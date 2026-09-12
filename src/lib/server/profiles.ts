import { canonicalAddress } from './crypto';
import { normalizeHandle, text, assert } from '../domain';
import { config } from './config';
import { db } from './db';
import { requireSession } from './auth';
import { body, json, limit } from './http';
import { serializeReceipt } from './receipts';
export async function claimProfile(request: Request) {
  const session = await requireSession(request);
  await limit('claim:' + session.address, 6);
  const data = await body(request);
  const handle = normalizeHandle(data.handle);
  const existing = await db().walletProfile.findUnique({
    where: { network_address: { network: session.network, address: session.address } },
  });
  if (existing) {
    assert(
      existing.handle === handle,
      'ALREADY_CLAIMED',
      'This wallet already has a name. Open your existing profile.',
      409,
    );
    return json({ profile: existing });
  }
  const legacy = await legacyHandle(handle);
  if (legacy) {
    let sameWallet = false;
    try {
      sameWallet = canonicalAddress(legacy.user.nimiqAddress) === session.address;
    } catch {}
    assert(
      sameWallet,
      'LEGACY_NAME_RESERVED',
      'This name is held by a legacy record. Use its original wallet or request a migration review.',
      409,
    );
  }
  const profile = await db().walletProfile.create({
    data: {
      network: session.network,
      address: session.address,
      handle,
      displayName:
        typeof data.displayName === 'string' ? text(data.displayName, 'Display name', 60) : null,
    },
  });
  return json({ profile }, 201);
}
export async function editProfile(request: Request) {
  const session = await requireSession(request);
  await limit('profile:' + session.address, 20);
  const data = await body(request);
  const profile = await db().walletProfile.update({
    where: { network_address: { network: session.network, address: session.address } },
    data: {
      ...(data.displayName !== undefined
        ? { displayName: text(data.displayName, 'Display name', 60) }
        : {}),
      ...(data.bio !== undefined ? { bio: text(data.bio, 'Bio', 280) } : {}),
    },
  });
  return json({ profile });
}
export async function getPublicProfile(handle: string) {
  const normalized = normalizeHandle(handle);
  const profile = await db().walletProfile.findUnique({
    where: { network_handle: { network: config().network, handle: normalized } },
  });
  assert(profile, 'NOT_FOUND', 'This .neet profile is not available.', 404);
  const receipts = await db().contributionReceipt.findMany({
    where: {
      recipientId: profile.id,
      publishedAt: { not: null },
      paymentState: 'CONFIRMED',
      signatureVerifiedAt: { not: null },
    },
    include: { issuer: true, recipient: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 50,
  });
  const active = receipts.filter((r) => !r.withdrawnAt);
  return {
    profile,
    receipts: receipts.map((r) => serializeReceipt(r, true)),
    summary: {
      displayedPublicReceipts: receipts.length,
      activeDisplayedReceipts: active.length,
      distinctDisplayedIssuerWallets: new Set(active.map((r) => r.issuerAddress)).size,
      limit: 50,
    },
  };
}

export async function legacyHandle(handle: string) {
  return db().identity.findFirst({
    where: {
      OR: [
        { handle: { equals: handle, mode: 'insensitive' } },
        { fullHandle: { equals: handle + '.neet', mode: 'insensitive' } },
      ],
    },
    include: { user: true },
  });
}
