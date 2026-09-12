import type { Receipt } from '../../src/lib/client';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createHash, sign } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { PublicKey } from '@nimiq/core';

const origin = 'http://127.0.0.1:3100';
const database = process.env.DOTNEET_TEST_DATABASE_URL;
assert(database, 'Set DOTNEET_TEST_DATABASE_URL to a dedicated local dotneet_test database.');
assert(
  ['localhost', '127.0.0.1'].includes(new URL(database).hostname) &&
    new URL(database).pathname === '/dotneet_test',
  'Integration tests require a dedicated loopback database named dotneet_test.',
);
const prisma = new PrismaClient({ datasources: { db: { url: database } } });
function wallet() {
  const pair = generateKeyPairSync('ed25519');
  const publicKey = pair.publicKey
    .export({ type: 'spki', format: 'der' })
    .subarray(-32)
    .toString('hex');
  const address = PublicKey.fromHex(publicKey)
    .toAddress()
    .toUserFriendlyAddress()
    .replace(/ /g, '');
  return {
    publicKey,
    address,
    sign(message: string) {
      const body = Buffer.from(message, 'utf8');
      const digest = createHash('sha256')
        .update(
          Buffer.concat([Buffer.from('\x16Nimiq Signed Message:\n' + body.length, 'utf8'), body]),
        )
        .digest();
      return { publicKey, signature: sign(null, digest, pair.privateKey).toString('hex') };
    },
  };
}
class Client {
  jar = new Map<string, string>();
  async call(path: string, method = 'GET', data?: unknown, sendOrigin = true) {
    const response = await fetch(origin + path, {
      method,
      headers: {
        ...(sendOrigin ? { Origin: origin } : {}),
        Cookie: [...this.jar].map(([k, v]) => k + '=' + v).join('; '),
        ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    for (const value of response.headers.getSetCookie()) {
      const part = value.split(';')[0],
        i = part.indexOf('=');
      this.jar.set(part.slice(0, i), part.slice(i + 1));
    }
    return { status: response.status, data: await response.json(), headers: response.headers };
  }
  async login(w: ReturnType<typeof wallet>) {
    const c = await this.call('/api/auth/challenge', 'POST', { address: w.address });
    assert.equal(c.status, 200, JSON.stringify(c.data));
    const r = await this.call('/api/auth/verify', 'POST', {
      id: c.data.id,
      ...w.sign(c.data.message),
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    return c.data;
  }
}
test('Local HTTP + database lifecycle; synthetic signatures and simulated RPC, no real payments', async (t) => {
  const issuer = wallet(),
    recipient = wallet(),
    outsider = wallet();
  const a = new Client(),
    b = new Client(),
    other = new Client(),
    publicClient = new Client();
  const suffix = Date.now().toString(36),
    fromHandle = 'issuer-' + suffix,
    toHandle = 'contributor-' + suffix;
  const transactions = new Map<string, Record<string, unknown>>();
  let rpcMode = 'normal',
    network = 'TestAlbatross',
    appLog = '';
  const rpcServer = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const input = JSON.parse(raw);
    res.setHeader('Content-Type', 'application/json');
    if (rpcMode === 'unavailable') {
      res.statusCode = 503;
      res.end('{}');
      return;
    }
    const data = input.method === 'getNetworkId' ? network : transactions.get(input.params[0]);
    res.end(
      JSON.stringify(
        data
          ? { jsonrpc: '2.0', id: input.id, result: { data, metadata: null } }
          : {
              jsonrpc: '2.0',
              id: input.id,
              error: { code: -32000, message: 'Not found', data: 'Transaction not found: fixture' },
            },
      ),
    );
  });
  await new Promise<void>((resolve) => rpcServer.listen(18546, '127.0.0.1', resolve));
  const app = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3100'],
    {
      env: {
        ...process.env,
        DATABASE_URL: database,
        APP_ORIGIN: origin,
        NIMIQ_NETWORK: 'testnet',
        NIMIQ_RPC_URL: 'http://127.0.0.1:18546',
        DOTNEET_BUILD_DIR: '.next-integration',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  app.stdout.on('data', (c) => {
    appLog += c.toString();
  });
  app.stderr.on('data', (c) => {
    appLog += c.toString();
  });
  let receipt: Receipt; // HTTP JSON fixture shape is asserted at each step.
  const ids: string[] = [];
  try {
    for (let i = 0; i < 80; i++) {
      try {
        const ready = await fetch(origin + '/api/health');
        if (ready.ok) break;
      } catch {}
      if (i === 79) throw new Error('Local app did not start:\n' + appLog);
      await new Promise((r) => setTimeout(r, 500));
    }
    await t.test('Same-origin write protection and body validation', async () => {
      assert.equal(
        (await a.call('/api/auth/challenge', 'POST', { address: issuer.address }, false)).status,
        403,
      );
      assert.equal((await a.call('/api/receipts', 'POST', {})).status, 401);
    });
    await t.test(
      'Wrong signer, valid wallet control, cookie binding and replay prevention',
      async () => {
        const c = await a.call('/api/auth/challenge', 'POST', { address: issuer.address });
        assert.equal(c.status, 200);
        assert.equal(
          (
            await publicClient.call('/api/auth/verify', 'POST', {
              id: c.data.id,
              ...issuer.sign(c.data.message),
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await a.call('/api/auth/verify', 'POST', {
              id: c.data.id,
              ...recipient.sign(c.data.message),
            })
          ).status,
          401,
        );
        const signed = await a.call('/api/auth/verify', 'POST', {
          id: c.data.id,
          ...issuer.sign(c.data.message),
        });
        assert.equal(signed.status, 200, JSON.stringify(signed.data));
        assert.match(signed.headers.getSetCookie().join(';'), /HttpOnly/i);
        assert.match(signed.headers.getSetCookie().join(';'), /SameSite=strict/i);
        assert.equal(
          (
            await a.call('/api/auth/verify', 'POST', {
              id: c.data.id,
              ...issuer.sign(c.data.message),
            })
          ).status,
          401,
        );
        await b.login(recipient);
        await other.login(outsider);
      },
    );
    await t.test('Expired authentication challenge cannot create session', async () => {
      const c = await other.call('/api/auth/challenge', 'POST', { address: outsider.address });
      await prisma.authChallenge.update({
        where: { id: c.data.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      assert.equal(
        (
          await other.call('/api/auth/verify', 'POST', {
            id: c.data.id,
            ...outsider.sign(c.data.message),
          })
        ).status,
        401,
      );
    });
    await t.test(
      'Claim normalization, returning session and protected profile ownership',
      async () => {
        assert.equal(
          (
            await a.call('/api/identity/claim', 'POST', {
              handle: fromHandle.toUpperCase() + '.neet',
            })
          ).status,
          201,
        );
        assert.equal(
          (await b.call('/api/identity/claim', 'POST', { handle: toHandle })).status,
          201,
        );
        assert.equal(
          (await other.call('/api/identity/claim', 'POST', { handle: toHandle })).status,
          409,
        );
        assert.equal((await a.call('/api/auth/session')).data.profile.handle, fromHandle);
        assert.equal(
          (await a.call('/api/identity/claim', 'POST', { handle: fromHandle })).status,
          200,
        );
        const changed = await a.call('/api/profile', 'PATCH', {
          displayName: 'Synthetic issuer',
          bio: 'Local fixture only',
          address: recipient.address,
        });
        assert.equal(changed.data.profile.address, issuer.address);
        const available = await publicClient.call('/api/v1/handles/' + toHandle);
        assert.equal(available.data.available, false);
        assert.equal(available.headers.get('access-control-allow-origin'), '*');
      },
    );
    const draft = {
      recipientHandle: toHandle,
      amountNim: '1.25001',
      statement: 'SYNTHETIC TEST ONLY: exercised a local contribution flow.',
      evidenceUrl: 'https://example.com/local-fixture',
      idempotencyKey: crypto.randomUUID(),
    };
    await t.test(
      'Private draft, exact amounts, validation and concurrent idempotency',
      async () => {
        const both = await Promise.all([
          a.call('/api/receipts', 'POST', draft),
          a.call('/api/receipts', 'POST', draft),
        ]);
        assert.ok(
          both.every((r) => [200, 201].includes(r.status)),
          JSON.stringify(both),
        );
        assert.equal(both[0].data.receipt.id, both[1].data.receipt.id);
        receipt = both[0].data.receipt;
        ids.push(receipt.id);
        assert.equal(receipt.amountLuna, '125001');
        assert.equal((await publicClient.call('/api/receipts/' + receipt.id)).status, 404);
        assert.equal((await other.call('/api/receipts/' + receipt.id)).status, 404);
        assert.equal((await b.call('/api/receipts/' + receipt.id)).status, 200);
        assert.equal(
          (await a.call('/api/receipts', 'POST', { ...draft, amountNim: '2' })).status,
          409,
        );
        assert.equal(
          (
            await a.call('/api/receipts', 'POST', {
              ...draft,
              idempotencyKey: crypto.randomUUID(),
              recipientHandle: fromHandle,
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await a.call('/api/receipts', 'POST', {
              ...draft,
              idempotencyKey: crypto.randomUUID(),
              amountNim: '0.000001',
            })
          ).status,
          400,
        );
      },
    );
    const path = () => '/api/receipts/' + receipt.id;
    await t.test(
      'Only issuer can pay; concurrent begin and stale rejection cannot trigger another attempt',
      async () => {
        assert.equal((await b.call(path() + '/payment', 'POST', { action: 'begin' })).status, 403);
        rpcMode = 'unavailable';
        assert.equal((await a.call(path() + '/payment', 'POST', { action: 'begin' })).status, 503);
        assert.equal((await a.call(path())).data.receipt.paymentState, 'DRAFT');
        rpcMode = 'normal';
        const results = await Promise.all([
          a.call(path() + '/payment', 'POST', { action: 'begin' }),
          a.call(path() + '/payment', 'POST', { action: 'begin' }),
        ]);
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
        const oldAttempt = results.find((r) => r.status === 200)!.data.receipt.paymentAttemptId;
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'rejected',
              paymentAttemptId: oldAttempt,
            })
          ).status,
          200,
        );
        const current = await a.call(path() + '/payment', 'POST', { action: 'begin' });
        receipt = current.data.receipt;
        assert.notEqual(receipt.paymentAttemptId, oldAttempt);
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'rejected',
              paymentAttemptId: oldAttempt,
            })
          ).status,
          409,
        );
        assert.equal((await a.call(path() + '/cancel', 'POST', {})).status, 409);
      },
    );
    const wrongHash = 'a'.repeat(64),
      correctHash = 'b'.repeat(64);
    await t.test(
      'Unknown, pending, unavailable and mismatching payment responses never confirm',
      async () => {
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'attach',
              walletResult: 'unknown',
              paymentAttemptId: receipt.paymentAttemptId,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'attach',
              walletResult: wrongHash,
              paymentAttemptId: receipt.paymentAttemptId,
            })
          ).status,
          200,
        );
        assert.equal((await a.call(path() + '/verify', 'POST', {})).status, 202);
        rpcMode = 'unavailable';
        assert.equal((await a.call(path() + '/verify', 'POST', {})).status, 503);
        rpcMode = 'normal';
        transactions.set(wrongHash, {
          hash: wrongHash,
          networkId: 5,
          from: issuer.address,
          to: recipient.address,
          value: 999,
          recipientData: Buffer.from('dotneet:' + receipt.id).toString('hex'),
          fromType: 0,
          toType: 0,
          flags: 0,
          executionResult: true,
          blockNumber: 123,
          confirmations: 10,
          timestamp: Date.now(),
        });
        assert.equal((await a.call(path() + '/verify', 'POST', {})).status, 409);
        assert.equal((await a.call(path())).data.receipt.paymentState, 'SUBMITTED');
        assert.equal((await a.call(path() + '/payment', 'POST', { action: 'begin' })).status, 409);
      },
    );
    await t.test(
      'Wrong-network verifier rejected; strict reconciliation confirms without sending',
      async () => {
        transactions.set(correctHash, {
          ...transactions.get(wrongHash),
          hash: correctHash,
          value: 125001,
        });
        network = 'MainAlbatross';
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'reconcile',
              transactionHash: correctHash,
            })
          ).status,
          503,
        );
        network = 'TestAlbatross';
        const result = await a.call(path() + '/payment', 'POST', {
          action: 'reconcile',
          transactionHash: correctHash,
        });
        assert.equal(result.status, 200, JSON.stringify(result.data));
        receipt = result.data.receipt;
        assert.equal(receipt.paymentState, 'CONFIRMED');
        assert.equal(receipt.signatureVerifiedAt, null);
        assert.equal(receipt.publishedAt, null);
        assert.equal(
          (await b.call(path() + '/publish', 'PATCH', { published: true, consent: true })).status,
          409,
        );
      },
    );
    await t.test(
      'Acknowledgment challenge CAS, wrong signature, expiry and exact signed message',
      async () => {
        const pair = await Promise.all([
          a.call(path() + '/acknowledgment', 'POST', { action: 'challenge' }),
          a.call(path() + '/acknowledgment', 'POST', { action: 'challenge' }),
        ]);
        assert.equal(pair[0].data.message, pair[1].data.message);
        assert.equal(
          (await a.call(path() + '/acknowledgment', 'POST', recipient.sign(pair[0].data.message)))
            .status,
          401,
        );
        await prisma.contributionReceipt.update({
          where: { id: receipt.id },
          data: { acknowledgmentExpiresAt: new Date(Date.now() - 1000) },
        });
        assert.equal(
          (await a.call(path() + '/acknowledgment', 'POST', issuer.sign(pair[0].data.message)))
            .status,
          409,
        );
        const challenge = await a.call(path() + '/acknowledgment', 'POST', { action: 'challenge' });
        const signature = issuer.sign(challenge.data.message);
        const signed = await a.call(path() + '/acknowledgment', 'POST', signature);
        assert.equal(signed.status, 200, JSON.stringify(signed.data));
        const after = await a.call(path() + '/acknowledgment', 'POST', { action: 'challenge' });
        assert.equal(after.data.message, challenge.data.message);
        assert.equal(signed.data.receipt.acknowledgmentSignature, signature.signature);
        assert.equal(
          (
            await a.call(path() + '/payment', 'POST', {
              action: 'reconcile',
              transactionHash: wrongHash,
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      'Recipient consent, public API projection and distinct wallet summary',
      async () => {
        assert.equal(
          (await a.call(path() + '/publish', 'PATCH', { published: true, consent: true })).status,
          403,
        );
        assert.equal((await b.call(path() + '/publish', 'PATCH', { published: true })).status, 400);
        assert.equal((await publicClient.call('/api/v1/receipts/' + receipt.id)).status, 404);
        assert.equal(
          (await b.call(path() + '/publish', 'PATCH', { published: true, consent: true })).status,
          200,
        );
        for (const route of [path(), '/api/v1/receipts/' + receipt.id]) {
          const pub = await publicClient.call(route);
          assert.equal(pub.status, 200);
          assert.equal(pub.data.receipt.paymentAttemptId, undefined);
          assert.equal(pub.data.receipt.idempotencyKey, undefined);
        }
        const profile = await publicClient.call('/api/v1/profiles/' + toHandle);
        assert.equal(profile.data.summary.activeDisplayedReceipts, 1);
        assert.equal(profile.data.summary.distinctDisplayedIssuerWallets, 1);
        const missing = await publicClient.call('/api/v1/receipts/missing');
        assert.equal(missing.status, 404);
        assert.equal(missing.headers.get('access-control-allow-origin'), '*');
      },
    );
    await t.test(
      'Withdrawal history, public count exclusion, unpublishing and immutable payment',
      async () => {
        assert.equal((await b.call(path() + '/withdraw', 'POST', {})).status, 403);
        assert.equal((await a.call(path() + '/withdraw', 'POST', {})).status, 200);
        assert.equal((await publicClient.call('/api/v1/receipts/' + receipt.id)).status, 200);
        assert.equal(
          (await publicClient.call('/api/v1/profiles/' + toHandle)).data.summary
            .activeDisplayedReceipts,
          0,
        );
        assert.equal(
          (await b.call(path() + '/publish', 'PATCH', { published: false })).status,
          200,
        );
        assert.equal((await publicClient.call(path())).status, 404);
        assert.equal(
          (await b.call(path() + '/publish', 'PATCH', { published: true, consent: true })).status,
          409,
        );
        assert.equal((await a.call(path())).data.receipt.transactionHash, correctHash);
      },
    );
    await t.test(
      'Draft cancellation, duplicate chain reference, pagination and logout',
      async () => {
        const r = await a.call('/api/receipts', 'POST', {
          ...draft,
          idempotencyKey: crypto.randomUUID(),
        });
        ids.push(r.data.receipt.id);
        const p = '/api/receipts/' + r.data.receipt.id;
        assert.equal((await a.call(p + '/cancel', 'POST', {})).status, 200);
        assert.equal((await a.call(p + '/payment', 'POST', { action: 'begin' })).status, 409);
        const r2 = await a.call('/api/receipts', 'POST', {
          ...draft,
          idempotencyKey: crypto.randomUUID(),
        });
        ids.push(r2.data.receipt.id);
        const p2 = '/api/receipts/' + r2.data.receipt.id,
          started = await a.call(p2 + '/payment', 'POST', { action: 'begin' });
        assert.equal(
          (
            await a.call(p2 + '/payment', 'POST', {
              action: 'attach',
              transactionHash: correctHash,
              paymentAttemptId: started.data.receipt.paymentAttemptId,
            })
          ).status,
          409,
        );
        const list = await a.call('/api/receipts?limit=1');
        assert.equal(list.data.receipts.length, 1);
        assert.ok(list.data.nextCursor);
        assert.equal((await a.call('/api/receipts?limit=1.5')).status, 200);
        assert.equal((await a.call('/api/auth/logout', 'POST', {})).status, 200);
        assert.equal((await a.call('/api/receipts')).status, 401);
      },
    );

    await t.test(
      'Legacy names remain reserved and can only be reclaimed by their original wallet',
      async () => {
        const legacyName = 'legacy-' + suffix;
        const legacyUser = await prisma.user.create({ data: { nimiqAddress: recipient.address } });
        await prisma.identity.create({
          data: { userId: legacyUser.id, handle: legacyName, fullHandle: legacyName + '.neet' },
        });
        try {
          const availability = await publicClient.call('/api/v1/handles/' + legacyName);
          assert.equal(availability.data.available, false);
          assert.equal(availability.data.reservedForLegacyOwner, true);
          assert.equal(
            (await other.call('/api/identity/claim', 'POST', { handle: legacyName })).status,
            409,
          );
        } finally {
          await prisma.identity.deleteMany({ where: { userId: legacyUser.id } });
          await prisma.user.delete({ where: { id: legacyUser.id } });
        }
        const ownName = 'legacy-own-' + suffix;
        const ownUser = await prisma.user.create({ data: { nimiqAddress: outsider.address } });
        await prisma.identity.create({
          data: { userId: ownUser.id, handle: ownName, fullHandle: ownName + '.neet' },
        });
        try {
          const reclaimed = await other.call('/api/identity/claim', 'POST', { handle: ownName });
          assert.equal(reclaimed.status, 201);
          assert.equal(reclaimed.data.profile.address, outsider.address);
        } finally {
          await prisma.identity.deleteMany({ where: { userId: ownUser.id } });
          await prisma.user.delete({ where: { id: ownUser.id } });
        }
      },
    );
  } finally {
    app.kill('SIGTERM');
    await new Promise<void>((resolve) => rpcServer.close(() => resolve()));
    await prisma.contributionReceipt.deleteMany({ where: { issuerAddress: issuer.address } });
    await prisma.walletSession.deleteMany({
      where: { address: { in: [issuer.address, recipient.address, outsider.address] } },
    });
    await prisma.authChallenge.deleteMany({
      where: { address: { in: [issuer.address, recipient.address, outsider.address] } },
    });
    await prisma.walletProfile.deleteMany({
      where: { address: { in: [issuer.address, recipient.address, outsider.address] } },
    });
    await prisma.$disconnect();
  }
});
