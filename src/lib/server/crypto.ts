import { Transaction } from '@nimiq/core';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Address, Hash, PublicKey, Signature } from '@nimiq/core';
import { AppError, assert } from '../domain';
export function canonicalAddress(value: unknown): string {
  if (typeof value !== 'string' || value.length > 80)
    throw new AppError('INVALID_ADDRESS', 'Enter a valid Nimiq address.');
  try {
    return Address.fromString(value).toUserFriendlyAddress().replace(/ /g, '');
  } catch {
    throw new AppError('INVALID_ADDRESS', 'Enter a valid Nimiq address.');
  }
}
export function verifyNimiqSignature(
  message: string,
  expectedAddress: string,
  publicKeyHex: unknown,
  signatureHex: unknown,
): boolean {
  if (
    typeof publicKeyHex !== 'string' ||
    typeof signatureHex !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(publicKeyHex) ||
    !/^[0-9a-f]{128}$/i.test(signatureHex)
  )
    return false;
  try {
    const body = new TextEncoder().encode(message);
    const prefix = new TextEncoder().encode('\x16Nimiq Signed Message:\n' + body.length);
    const preimage = new Uint8Array(prefix.length + body.length);
    preimage.set(prefix);
    preimage.set(body, prefix.length);
    const key = PublicKey.fromHex(publicKeyHex);
    if (
      canonicalAddress(key.toAddress().toUserFriendlyAddress()) !==
      canonicalAddress(expectedAddress)
    )
      return false;
    return key.verify(Signature.fromHex(signatureHex), Hash.computeSha256(preimage));
  } catch {
    return false;
  }
}
export const secret = () => randomBytes(32).toString('hex');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function walletResultHash(value: unknown): string {
  assert(
    typeof value === 'string' && value.length <= 8192 && /^(?:[a-f0-9]{2})+$/i.test(value),
    'UNKNOWN_WALLET_RESULT',
    'The wallet response could not be read. Reconcile using the existing transaction hash; do not resend.',
  );
  if (value.length === 64) return value.toLowerCase();
  try {
    const bytes = Buffer.from(value, 'hex');
    const transaction = Transaction.deserialize(bytes);
    assert(
      Buffer.from(transaction.serialize()).equals(bytes),
      'UNKNOWN_WALLET_RESULT',
      'Unexpected transaction encoding.',
    );
    return transaction.hash().toLowerCase();
  } catch {
    throw new AppError(
      'UNKNOWN_WALLET_RESULT',
      'The wallet response could not be read. Reconcile using the existing transaction hash; do not resend.',
    );
  }
}
