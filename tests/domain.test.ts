import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AppError,
  acknowledgmentText,
  evidenceUrl,
  lunaFromDecimal,
  mayPublishReceipt,
  mayReadReceipt,
  normalizeHandle,
  type ReceiptFacts,
} from '../src/lib/domain';

const hasCode = (code: string) => (error: unknown) =>
  error instanceof AppError && error.code === code;

test('amount entry preserves exact Luna at fractional and maximum boundaries', () => {
  for (const [input, expected] of [
    ['0.00001', 1],
    ['0.1', 10000],
    ['1.23456', 123456],
    ['1000000000', 100000000000000],
  ] as const) {
    assert.equal(lunaFromDecimal(input), expected);
  }
});

test('amount entry rejects rounding, exponent notation, nonpositive and out-of-range values', () => {
  for (const input of [
    '0',
    '-1',
    '0.000001',
    '1e3',
    '1,000',
    '01',
    '1.',
    ' 1',
    '1000000000.00001',
    1,
    null,
  ]) {
    assert.throws(() => lunaFromDecimal(input), hasCode('INVALID_AMOUNT'), String(input));
  }
});

test('handles normalize the suffix and reject reserved names, confusables and invalid boundaries', () => {
  assert.equal(normalizeHandle(' Ada-Test.NEET '), 'ada-test');
  for (const input of [
    'admin',
    'api.neet',
    'ada.neet.neet',
    '-ada',
    'ada-',
    'ab',
    'ádá',
    'a'.repeat(33),
  ]) {
    assert.throws(
      () => normalizeHandle(input),
      (e: unknown) => e instanceof AppError,
      input,
    );
  }
});

test('evidence links require HTTPS and exclude embedded credentials', () => {
  assert.equal(evidenceUrl('https://example.org/issue/1'), 'https://example.org/issue/1');
  assert.equal(evidenceUrl(''), null);
  for (const value of [
    'javascript:alert(1)',
    'http://example.org',
    'https://user:password@example.org',
    '/relative',
  ]) {
    assert.throws(() => evidenceUrl(value), hasCode('INVALID_URL'));
  }
});

test('acknowledgments bind payment, parties, origin, network and exact human statement', () => {
  const receipt: ReceiptFacts = {
    id: 'receipt-fixture',
    network: 'testnet',
    issuerAddress: 'issuer-fixture',
    recipientAddress: 'recipient-fixture',
    amountLuna: 123456n,
    statement: 'Café testing ✅\nSecond line.',
    evidenceUrl: 'https://example.org/issue/1',
    transactionHash: 'ab'.repeat(32),
    createdAt: new Date('2026-09-10T12:00:00Z'),
  };
  const signed = acknowledgmentText(receipt, 'https://dotneet.example');
  assert.match(signed, /^[\x00-\x7f]*$/);
  const parsed = JSON.parse(signed);
  assert.equal(parsed.statement, receipt.statement);
  assert.equal(parsed.amountLuna, '123456');
  assert.equal(parsed.transactionHash, receipt.transactionHash);
  for (const patch of [
    { recipientAddress: 'another' },
    { issuerAddress: 'another' },
    { network: 'mainnet' },
    { amountLuna: 1n },
    { transactionHash: 'cd'.repeat(32) },
    { statement: 'Different work' },
    { evidenceUrl: null },
  ]) {
    assert.notEqual(
      acknowledgmentText({ ...receipt, ...patch }, 'https://dotneet.example'),
      signed,
    );
  }
  assert.notEqual(acknowledgmentText(receipt, 'https://another.example'), signed);
});

test('private receipts remain participant-only until payment, signature and publication all exist', () => {
  const complete = {
    issuerAddress: 'issuer',
    recipientAddress: 'recipient',
    publishedAt: new Date(),
    paymentState: 'CONFIRMED',
    signatureVerifiedAt: new Date(),
  };
  assert.equal(mayReadReceipt(complete), true);
  for (const patch of [
    { publishedAt: null },
    { paymentState: 'SUBMITTED' },
    { signatureVerifiedAt: null },
  ]) {
    assert.equal(mayReadReceipt({ ...complete, ...patch }, 'stranger'), false);
    assert.equal(mayReadReceipt({ ...complete, ...patch }, 'issuer'), true);
    assert.equal(mayReadReceipt({ ...complete, ...patch }, 'recipient'), true);
  }
});

test('only the contributor can publish a complete active acknowledgment', () => {
  const receipt = {
    recipientAddress: 'recipient',
    paymentState: 'CONFIRMED',
    signatureVerifiedAt: new Date(),
    withdrawnAt: null,
  };
  assert.equal(mayPublishReceipt(receipt, 'recipient'), true);
  assert.equal(mayPublishReceipt(receipt, 'issuer'), false);
  assert.equal(mayPublishReceipt({ ...receipt, withdrawnAt: new Date() }, 'recipient'), false);
  assert.equal(mayPublishReceipt({ ...receipt, paymentState: 'SUBMITTED' }, 'recipient'), false);
  assert.equal(mayPublishReceipt({ ...receipt, signatureVerifiedAt: null }, 'recipient'), false);
});
