import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createHash, sign } from 'node:crypto';
import { Address, Transaction, PublicKey } from '@nimiq/core';
import { AppError } from '../src/lib/domain';
import { canonicalAddress, verifyNimiqSignature, walletResultHash } from '../src/lib/server/crypto';

// Fixed synthetic fixtures created independently with Node Ed25519, never captured from Nimiq Pay.
// Public signature fixtures only. Private keys are generated in memory where needed.
const vectors = [
  {
    message: 'hello',
    utf8Length: 5,
    publicKeyHex: '03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8',
    signatureHex:
      '78d1ce8260044f5bc4ea1c1b2a6772f03fe80d0237110d6d818fdb6c9ae0bac31a08b7e6d325de4d711c332d26166443105445420b2ccea2d7c2787420dc610c',
  },
  {
    message: 'Dotneet authentication\nOrigin: https://dotneet.example\nNonce: fixture-001',
    utf8Length: 73,
    publicKeyHex: '03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8',
    signatureHex:
      '02aafb82f08a23f46d32ee1cf6ec40ab728c80beb4e462e33b9a305e7510c01c8d6c875547f33efb75bff20142ab9a8f12c2dce10fb10f1e8789c8aaae0d5c0a',
  },
  {
    message: 'Caf\u00e9 \u2014 contribution \u2705',
    utf8Length: 26,
    publicKeyHex: '03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8',
    signatureHex:
      'c7f3a9c10d41384e72a1e4e6dff98f9c846fd0c67740daade81e257a50eae232d82176e31f268367548de7de2c868ad88cd0d1d3bdbe10fd7d7410c6ca25fb0f',
  },
  {
    message: '',
    utf8Length: 0,
    publicKeyHex: '03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8',
    signatureHex:
      '6d7e47d0e27dd1a8e84201d7870991ce1c4d445f7bbcc9525547b29ddee582955fb30182cbdc6a1216abab0827edde61739a7db28b8541111e70db507e1ad601',
  },
];
const address = 'NQ46 KLJE 5TMF 4Y1A 1255 CJHJ YG1S H0NU T604';
const otherAddress = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000';

for (const vector of vectors) {
  test(`accepts independent Ed25519 signature for ${vector.utf8Length} UTF-8 message bytes`, () => {
    assert.equal(
      verifyNimiqSignature(vector.message, address, vector.publicKeyHex, vector.signatureHex),
      true,
    );
    assert.equal(
      verifyNimiqSignature(vector.message + '!', address, vector.publicKeyHex, vector.signatureHex),
      false,
    );
    assert.equal(
      verifyNimiqSignature(vector.message, otherAddress, vector.publicKeyHex, vector.signatureHex),
      false,
    );
  });
}

test('canonical address parsing checks checksum and normalizes spacing', () => {
  assert.equal(canonicalAddress(address), address.replace(/ /g, ''));
  assert.throws(() => canonicalAddress(address.replace('NQ46', 'NQ47')));
  assert.throws(() => canonicalAddress('0x' + 'ab'.repeat(20)));
});

test('signature verifier rejects malformed encodings instead of truncating or guessing', () => {
  const v = vectors[0];
  for (const key of [
    v.publicKeyHex + '00',
    v.publicKeyHex.slice(2),
    '0x' + v.publicKeyHex,
    'gg'.repeat(32),
    null,
  ]) {
    assert.equal(verifyNimiqSignature(v.message, address, key, v.signatureHex), false);
  }
  for (const signature of [
    v.signatureHex + '00',
    v.signatureHex.slice(2),
    '0x' + v.signatureHex,
    'gg'.repeat(64),
    null,
  ]) {
    assert.equal(verifyNimiqSignature(v.message, address, v.publicKeyHex, signature), false);
  }
});

test('raw signing, extra-space prefix and UTF-16-length formats are not accepted as fallbacks', () => {
  const v = vectors.find((item) => item.utf8Length === 26)!;
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const keyHex = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex');
  const signingAddress = PublicKey.fromHex(keyHex).toAddress().toUserFriendlyAddress();
  const variants = [
    Buffer.from(v.message),
    createHash('sha256')
      .update('\x16 Nimiq Signed Message:\n' + Buffer.byteLength(v.message) + v.message)
      .digest(),
    createHash('sha256')
      .update('\x16Nimiq Signed Message:\n' + v.message.length + v.message)
      .digest(),
  ];
  for (const bytes of variants) {
    const signature = sign(null, bytes, privateKey).toString('hex');
    assert.equal(verifyNimiqSignature(v.message, signingAddress, keyHex, signature), false);
  }
});

function localUnsignedTransaction() {
  // Parser fixture only: no wallet request, signature, network or broadcast.
  return new Transaction(
    Address.fromString(address),
    0,
    new Uint8Array(),
    Address.fromString(otherAddress),
    0,
    new TextEncoder().encode('dotneet:local-parser-fixture'),
    100000n,
    0n,
    0,
    1000000,
    5,
  );
}

test('wallet-result adapter accepts exact hashes and derives serialized transaction identity', () => {
  const tx = localUnsignedTransaction();
  assert.equal(walletResultHash(tx.hash().toUpperCase()), tx.hash());
  assert.equal(walletResultHash(tx.toHex()), tx.hash());
  const changed = localUnsignedTransaction();
  changed.data = new TextEncoder().encode('dotneet:different-reference');
  assert.notEqual(walletResultHash(changed.toHex()), walletResultHash(tx.toHex()));
});

test('wallet-result adapter rejects ambiguous, malformed and oversized results without inventing a hash', () => {
  const encoded = localUnsignedTransaction().toHex();
  for (const result of [
    undefined,
    { hash: 'ab'.repeat(32) },
    '0x' + 'ab'.repeat(32),
    'ab'.repeat(31),
    encoded + '00',
    'a',
    'zz',
    '00'.repeat(5000),
  ]) {
    assert.throws(
      () => walletResultHash(result),
      (e: unknown) => e instanceof AppError && e.code === 'UNKNOWN_WALLET_RESULT',
    );
  }
});
