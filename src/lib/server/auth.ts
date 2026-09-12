import { cookies } from 'next/headers';
import { assert, asciiJson } from '../domain';
import { config } from './config';
import { db } from './db';
import { canonicalAddress, digest, sameSecret, secret, verifyNimiqSignature } from './crypto';
import { body, json, limit, sameOrigin } from './http';
const sessionCookie = 'dotneet_session';
const challengeCookie = 'dotneet_challenge';
export const CHALLENGE_SECONDS = 300;
export const SESSION_SECONDS = 86400;
export async function currentSession() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return db().walletSession.findFirst({
    where: { tokenHash: digest(token), expiresAt: { gt: new Date() }, network: config().network },
  });
}
export async function requireSession(request?: Request) {
  if (request) sameOrigin(request);
  const session = await currentSession();
  assert(session, 'UNAUTHENTICATED', 'Connect your wallet to continue.', 401);
  return session;
}
export async function createChallenge(request: Request) {
  sameOrigin(request);
  const data = await body(request);
  const address = canonicalAddress(data.address);
  const c = config();
  await limit('challenge:global', 300);
  await limit('challenge:' + c.network + address, 8);
  const binding = secret();
  const nonce = secret();
  const expiresAt = new Date(Date.now() + CHALLENGE_SECONDS * 1000);
  const message = asciiJson({
    schema: 'dotneet.auth.v1',
    purpose: 'sign-in',
    origin: c.origin,
    network: c.network,
    address,
    nonce,
    expiresAt: expiresAt.toISOString(),
  });
  const challenge = await db().authChallenge.create({
    data: { address, network: c.network, message, bindingHash: digest(binding), expiresAt },
  });
  (await cookies()).set(challengeCookie, binding, {
    httpOnly: true,
    sameSite: 'strict',
    secure: c.secure,
    path: '/',
    maxAge: CHALLENGE_SECONDS,
  });
  return json({ id: challenge.id, message, expiresAt, network: c.network });
}
export async function verifyChallenge(request: Request) {
  sameOrigin(request);
  const data = await body(request);
  assert(typeof data.id === 'string', 'INVALID_INPUT', 'Challenge ID is required.');
  await limit('verify:global', 500);
  const challenge = await db().authChallenge.findUnique({ where: { id: data.id } });
  const binding = (await cookies()).get(challengeCookie)?.value;
  assert(
    challenge &&
      binding &&
      sameSecret(challenge.bindingHash, digest(binding)) &&
      challenge.network === config().network &&
      !challenge.usedAt &&
      challenge.expiresAt > new Date(),
    'CHALLENGE_EXPIRED',
    'This sign-in request expired or was already used. Start again.',
    401,
  );
  await limit('verify:' + challenge.id, 6);
  assert(
    verifyNimiqSignature(challenge.message, challenge.address, data.publicKey, data.signature),
    'INVALID_SIGNATURE',
    'The wallet signature could not be verified.',
    401,
  );
  const token = secret();
  await db().$transaction(async (tx) => {
    const consumed = await tx.authChallenge.updateMany({
      where: { id: challenge.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    assert(
      consumed.count === 1,
      'CHALLENGE_USED',
      'This sign-in request has already been used.',
      409,
    );
    await tx.walletSession.create({
      data: {
        tokenHash: digest(token),
        address: challenge.address,
        network: challenge.network,
        expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
      },
    });
  });
  const jar = await cookies();
  jar.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config().secure,
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  jar.delete(challengeCookie);
  return json({ address: challenge.address, network: challenge.network });
}
export async function sessionInfo() {
  const c = config();
  if (!process.env.DATABASE_URL)
    return json({ session: null, profile: null, network: c.network, configured: false });
  const session = await currentSession();
  const profile = session
    ? await db().walletProfile.findUnique({
        where: { network_address: { network: c.network, address: session.address } },
      })
    : null;
  return json({
    session: session ? { address: session.address, network: c.network } : null,
    profile,
    network: c.network,
    configured: true,
  });
}
export async function logout(request: Request) {
  sameOrigin(request);
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token) await db().walletSession.deleteMany({ where: { tokenHash: digest(token) } });
  (await cookies()).delete(sessionCookie);
  return json({ ok: true });
}
