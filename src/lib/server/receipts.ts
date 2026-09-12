import type { ContributionReceipt, WalletProfile } from '@prisma/client';
import {
  assert,
  normalizeHandle,
  lunaFromDecimal,
  text,
  evidenceUrl,
  txHash,
  acknowledgmentText,
  asciiJson,
  mayReadReceipt,
  mayPublishReceipt,
} from '../domain';
import { config } from './config';
import { db } from './db';
import { requireSession, currentSession } from './auth';
import { body, json, limit } from './http';
import { checkPayment, checkNetwork } from './rpc';
import { secret, verifyNimiqSignature, walletResultHash } from './crypto';
type Joined = ContributionReceipt & { issuer?: WalletProfile; recipient?: WalletProfile };
export function serializeReceipt(r: Joined, publicOnly = false) {
  const { idempotencyKey, paymentAttemptId, ...safe } = r;
  void idempotencyKey;
  return {
    ...safe,
    ...(publicOnly ? {} : { paymentAttemptId }),
    amountLuna: r.amountLuna.toString(),
    issuer: r.issuer ? { handle: r.issuer.handle, address: r.issuer.address } : undefined,
    recipient: r.recipient
      ? { handle: r.recipient.handle, address: r.recipient.address }
      : undefined,
  };
}
async function findReceipt(id: string) {
  const r = await db().contributionReceipt.findFirst({
    where: { id, network: config().network },
    include: { issuer: true, recipient: true },
  });
  assert(r, 'NOT_FOUND', 'This receipt is not available.', 404);
  return r;
}
export async function getReceipt(id: string, publicOnly = false) {
  await limit('receipt-read:global', 600);
  const r = await findReceipt(id);
  const session = publicOnly ? null : await currentSession();
  assert(
    mayReadReceipt(r, session?.address),
    'NOT_FOUND',
    'This receipt is private or not available.',
    404,
  );
  return r;
}
export async function listReceipts(request: Request) {
  const session = await requireSession();
  const url = new URL(request.url);
  const take = Math.min(50, Math.max(1, Math.floor(Number(url.searchParams.get('limit')) || 20)));
  const cursor = url.searchParams.get('cursor');
  const rows = await db().contributionReceipt.findMany({
    where: {
      network: session.network,
      OR: [{ issuerAddress: session.address }, { recipientAddress: session.address }],
    },
    include: { issuer: true, recipient: true },
    orderBy: { id: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  if (hasMore) rows.pop();
  return json({
    receipts: rows.map((r) => serializeReceipt(r)),
    nextCursor: hasMore ? rows.at(-1)?.id : null,
  });
}
export async function createReceipt(request: Request) {
  const session = await requireSession(request);
  await limit('draft:' + session.address, 20);
  const data = await body(request);
  const handle = normalizeHandle(data.recipientHandle);
  const amount = lunaFromDecimal(data.amountNim);
  const statement = text(data.statement, 'Contribution description', 600, 10);
  const link = evidenceUrl(data.evidenceUrl);
  const key = text(data.idempotencyKey, 'Request key', 80, 16);
  assert(/^[a-zA-Z0-9-]+$/.test(key), 'INVALID_INPUT', 'Invalid request key.');
  const issuer = await db().walletProfile.findUnique({
    where: { network_address: { network: session.network, address: session.address } },
  });
  const recipient = await db().walletProfile.findUnique({
    where: { network_handle: { network: session.network, handle } },
  });
  assert(issuer, 'PROFILE_REQUIRED', 'Claim your .neet name before acknowledging someone.', 409);
  assert(
    recipient,
    'NOT_FOUND',
    'That contributor has not claimed this name on this network.',
    404,
  );
  assert(issuer.id !== recipient.id, 'SELF_RECEIPT', 'Choose someone other than yourself.', 409);
  const existing = await db().contributionReceipt.findUnique({
    where: { issuerId_idempotencyKey: { issuerId: issuer.id, idempotencyKey: key } },
  });
  if (existing) {
    assert(
      existing.recipientId === recipient.id &&
        existing.amountLuna === BigInt(amount) &&
        existing.statement === statement &&
        existing.evidenceUrl === link,
      'IDEMPOTENCY_CONFLICT',
      'This request key was used for different details.',
      409,
    );
    return json({ receipt: serializeReceipt(existing) });
  }
  let r;
  try {
    r = await db().contributionReceipt.create({
      data: {
        network: session.network,
        issuerId: issuer.id,
        recipientId: recipient.id,
        issuerAddress: issuer.address,
        recipientAddress: recipient.address,
        amountLuna: BigInt(amount),
        statement,
        evidenceUrl: link,
        idempotencyKey: key,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code !== 'P2002') throw error;
    const raced = await db().contributionReceipt.findUnique({
      where: { issuerId_idempotencyKey: { issuerId: issuer.id, idempotencyKey: key } },
    });
    assert(
      raced &&
        raced.recipientId === recipient.id &&
        raced.amountLuna === BigInt(amount) &&
        raced.statement === statement &&
        raced.evidenceUrl === link,
      'IDEMPOTENCY_CONFLICT',
      'This request key was used for different details.',
      409,
    );
    return json({ receipt: serializeReceipt(raced) });
  }
  return json({ receipt: serializeReceipt(r) }, 201);
}
async function issuerReceipt(request: Request, id: string) {
  const session = await requireSession(request);
  await limit('receipt-write:' + session.address, 60);
  const r = await findReceipt(id);
  assert(
    r.issuerAddress === session.address,
    'FORBIDDEN',
    'Only the issuing wallet can do this.',
    403,
  );
  return r;
}
export async function payment(request: Request, id: string) {
  const r = await issuerReceipt(request, id);
  const data = await body(request);
  if (data.action === 'begin') {
    await checkNetwork();
    assert(
      r.paymentState === 'DRAFT' && !r.transactionHash,
      'PAYMENT_ALREADY_STARTED',
      'Payment was already requested. Resume using the existing transaction.',
      409,
    );
    const changed = await db().contributionReceipt.updateMany({
      where: { id, paymentState: 'DRAFT', transactionHash: null },
      data: {
        paymentState: 'AWAITING_WALLET',
        paymentAttemptAt: new Date(),
        paymentAttemptId: secret(),
      },
    });
    assert(
      changed.count === 1,
      'PAYMENT_ALREADY_STARTED',
      'A payment request is already in progress.',
      409,
    );
  } else if (data.action === 'reconcile') {
    assert(
      ['AWAITING_WALLET', 'SUBMITTED'].includes(r.paymentState) && !r.signatureVerifiedAt,
      'INVALID_STATE',
      'Only an unfinished payment can be reconciled.',
      409,
    );
    const hash = txHash(data.transactionHash);
    const t = await checkPayment({ ...r, transactionHash: hash });
    const changed = await db().contributionReceipt.updateMany({
      where: {
        id,
        paymentState: r.paymentState,
        transactionHash: r.transactionHash,
        paymentAttemptId: r.paymentAttemptId,
        signatureVerifiedAt: null,
      },
      data: {
        transactionHash: hash,
        paymentState: 'CONFIRMED',
        paymentVerifiedAt: new Date(),
        paymentBlock: t.blockNumber,
        confirmationCount: t.confirmations,
        verificationPolicy: 'nimiq-pos-inclusion-v1-min-' + config().confirmations,
      },
    });
    assert(
      changed.count === 1,
      'PAYMENT_CHANGED',
      'The payment changed while checking. Reload this receipt.',
      409,
    );
  } else {
    assert(
      typeof data.paymentAttemptId === 'string' && data.paymentAttemptId === r.paymentAttemptId,
      'ATTEMPT_CHANGED',
      'This wallet attempt is no longer active. Reload the receipt.',
      409,
    );
    if (data.action === 'rejected') {
      assert(
        r.paymentState === 'AWAITING_WALLET' && !r.transactionHash,
        'INVALID_STATE',
        'This payment cannot be reset.',
        409,
      );
      const changed = await db().contributionReceipt.updateMany({
        where: {
          id,
          paymentState: 'AWAITING_WALLET',
          transactionHash: null,
          paymentAttemptId: r.paymentAttemptId,
        },
        data: { paymentState: 'DRAFT', paymentAttemptAt: null, paymentAttemptId: null },
      });
      assert(
        changed.count === 1,
        'ATTEMPT_CHANGED',
        'The payment changed. Reload it without resending.',
        409,
      );
    } else {
      assert(data.action === 'attach', 'INVALID_INPUT', 'Unknown payment action.');
      const hash =
        data.walletResult !== undefined
          ? walletResultHash(data.walletResult)
          : txHash(data.transactionHash);
      if (r.transactionHash) {
        assert(
          r.transactionHash === hash,
          'IMMUTABLE_PAYMENT',
          'Use reconciliation to check a replacement hash without sending again.',
          409,
        );
      } else {
        const changed = await db().contributionReceipt.updateMany({
          where: {
            id,
            transactionHash: null,
            paymentState: 'AWAITING_WALLET',
            paymentAttemptId: r.paymentAttemptId,
          },
          data: { transactionHash: hash, paymentState: 'SUBMITTED' },
        });
        assert(
          changed.count === 1,
          'PAYMENT_ALREADY_RECORDED',
          'A transaction is already attached or this attempt changed.',
          409,
        );
      }
    }
  }
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
export async function verifyPayment(request: Request, id: string) {
  const r = await issuerReceipt(request, id);
  assert(
    r.transactionHash && ['SUBMITTED', 'CONFIRMED'].includes(r.paymentState),
    'INVALID_STATE',
    'Attach the submitted transaction before checking its payment.',
    409,
  );
  const t = await checkPayment(r);
  const changed = await db().contributionReceipt.updateMany({
    where: { id, transactionHash: r.transactionHash, paymentState: r.paymentState },
    data: {
      paymentState: 'CONFIRMED',
      paymentVerifiedAt: new Date(),
      paymentBlock: t.blockNumber,
      confirmationCount: t.confirmations,
      verificationPolicy: 'nimiq-pos-inclusion-v1-min-' + config().confirmations,
    },
  });
  assert(
    changed.count === 1,
    'PAYMENT_CHANGED',
    'This payment changed while checking. Reload the receipt.',
    409,
  );
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
async function acknowledgmentChallenge(r: Joined) {
  assert(
    r.paymentState === 'CONFIRMED',
    'INVALID_STATE',
    'Wait for payment confirmation before signing.',
    409,
  );
  assert(!r.withdrawnAt, 'INVALID_STATE', 'This acknowledgment was withdrawn.', 409);
  if (r.signatureVerifiedAt)
    return json({ receipt: serializeReceipt(r), message: r.acknowledgmentMessage, complete: true });
  if (
    r.acknowledgmentMessage &&
    r.acknowledgmentExpiresAt &&
    r.acknowledgmentExpiresAt > new Date()
  )
    return json({ message: r.acknowledgmentMessage, expiresAt: r.acknowledgmentExpiresAt });
  const expiresAt = new Date(Date.now() + 300000);
  const message = asciiJson({
    receipt: JSON.parse(acknowledgmentText(r, config().origin)),
    nonce: secret(),
    expiresAt: expiresAt.toISOString(),
  });
  const changed = await db().contributionReceipt.updateMany({
    where: {
      id: r.id,
      signatureVerifiedAt: null,
      acknowledgmentMessage: r.acknowledgmentMessage,
      acknowledgmentExpiresAt: r.acknowledgmentExpiresAt,
      paymentState: 'CONFIRMED',
      withdrawnAt: null,
    },
    data: { acknowledgmentMessage: message, acknowledgmentExpiresAt: expiresAt },
  });
  if (changed.count !== 1) {
    const current = await findReceipt(r.id);
    assert(
      current.acknowledgmentMessage,
      'ACKNOWLEDGMENT_CHANGED',
      'Reload the receipt and request signing again.',
      409,
    );
    return json({
      message: current.acknowledgmentMessage,
      expiresAt: current.acknowledgmentExpiresAt,
      complete: Boolean(current.signatureVerifiedAt),
    });
  }
  return json({ message, expiresAt });
}
export async function signAcknowledgment(request: Request, id: string) {
  const r = await issuerReceipt(request, id);
  const data = await body(request);
  if (data.action === 'challenge') return acknowledgmentChallenge(r);
  if (r.signatureVerifiedAt) return json({ receipt: serializeReceipt(r) });
  assert(
    r.paymentState === 'CONFIRMED' &&
      r.acknowledgmentMessage &&
      r.acknowledgmentExpiresAt &&
      r.acknowledgmentExpiresAt > new Date() &&
      !r.withdrawnAt,
    'CHALLENGE_EXPIRED',
    'The acknowledgment request expired. Request it again.',
    409,
  );
  assert(
    verifyNimiqSignature(r.acknowledgmentMessage, r.issuerAddress, data.publicKey, data.signature),
    'INVALID_SIGNATURE',
    'The acknowledgment signature could not be verified.',
    401,
  );
  const changed = await db().contributionReceipt.updateMany({
    where: {
      id,
      signatureVerifiedAt: null,
      acknowledgmentMessage: r.acknowledgmentMessage,
      acknowledgmentExpiresAt: { gt: new Date() },
      paymentState: 'CONFIRMED',
    },
    data: {
      acknowledgmentPublicKey: data.publicKey as string,
      acknowledgmentSignature: data.signature as string,
      signatureVerifiedAt: new Date(),
    },
  });
  assert(
    changed.count === 1,
    'ACKNOWLEDGMENT_CHANGED',
    'This signing request changed. Reload the receipt.',
    409,
  );
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
export async function publish(request: Request, id: string) {
  const session = await requireSession(request);
  await limit('publication:' + session.address, 20);
  const r = await findReceipt(id);
  assert(
    r.recipientAddress === session.address,
    'FORBIDDEN',
    'Only the contributor can choose whether this receipt is public.',
    403,
  );
  const data = await body(request);
  assert(
    typeof data.published === 'boolean',
    'INVALID_INPUT',
    'Specify whether to publish this receipt.',
  );
  if (data.published) {
    assert(
      data.consent === true,
      'CONSENT_REQUIRED',
      'Confirm that the statement, evidence and payment link may be public.',
    );
    assert(
      mayPublishReceipt(r, session.address),
      'INVALID_STATE',
      'Only complete, active receipts can be published.',
      409,
    );
  }
  const changed = await db().contributionReceipt.updateMany({
    where: {
      id,
      ...(data.published
        ? { paymentState: 'CONFIRMED', signatureVerifiedAt: { not: null }, withdrawnAt: null }
        : {}),
    },
    data: { publishedAt: data.published ? new Date() : null },
  });
  assert(
    changed.count === 1,
    'RECEIPT_CHANGED',
    'This receipt changed. Reload before publishing.',
    409,
  );
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
export async function cancel(request: Request, id: string) {
  const r = await issuerReceipt(request, id);
  assert(
    r.paymentState === 'DRAFT' && !r.transactionHash,
    'INVALID_STATE',
    'A requested payment cannot be cancelled here. Reconcile it without resending.',
    409,
  );
  const changed = await db().contributionReceipt.updateMany({
    where: { id, paymentState: 'DRAFT', transactionHash: null },
    data: { paymentState: 'CANCELLED' },
  });
  assert(
    changed.count === 1,
    'PAYMENT_CHANGED',
    'The payment changed. Reload without resending.',
    409,
  );
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
export async function withdraw(request: Request, id: string) {
  const r = await issuerReceipt(request, id);
  assert(
    r.signatureVerifiedAt,
    'INVALID_STATE',
    'There is no signed acknowledgment to withdraw.',
    409,
  );
  await db().contributionReceipt.update({
    where: { id },
    data: { withdrawnAt: r.withdrawnAt || new Date() },
  });
  return json({ receipt: serializeReceipt(await findReceipt(id)) });
}
