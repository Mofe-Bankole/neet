import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, paymentMarker, type ReceiptFacts } from '../src/lib/domain';
import { canonicalAddress } from '../src/lib/server/crypto';
import { checkPayment, rpc, validatePayment, type ChainTransaction } from '../src/lib/server/rpc';

const address = 'NQ46 KLJE 5TMF 4Y1A 1255 CJHJ YG1S H0NU T604';
const recipient = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000';
const receipt: ReceiptFacts = {
  id: 'local-receipt-fixture',
  network: 'testnet',
  issuerAddress: canonicalAddress(address),
  recipientAddress: canonicalAddress(recipient),
  amountLuna: 123456n,
  statement: 'Local payment-verification fixture only.',
  evidenceUrl: null,
  transactionHash: 'ab'.repeat(32),
  createdAt: new Date('2026-09-10T12:00:00Z'),
};
const transaction: ChainTransaction = {
  hash: receipt.transactionHash!,
  networkId: 5,
  from: address,
  to: recipient,
  value: 123456,
  recipientData: Buffer.from(paymentMarker(receipt.id)).toString('hex'),
  fromType: 0,
  toType: 0,
  flags: 0,
  executionResult: true,
  blockNumber: 1000001,
  confirmations: 10,
  timestamp: 1789041600000,
};
const errorIs = (code: string, status?: number) => (error: unknown) =>
  error instanceof AppError &&
  error.code === code &&
  (status === undefined || error.status === status);
const original = {
  APP_ORIGIN: process.env.APP_ORIGIN,
  NIMIQ_RPC_URL: process.env.NIMIQ_RPC_URL,
  NIMIQ_NETWORK: process.env.NIMIQ_NETWORK,
  NIMIQ_MIN_CONFIRMATIONS: process.env.NIMIQ_MIN_CONFIRMATIONS,
};
before(() => {
  process.env.APP_ORIGIN = 'https://dotneet.example';
  process.env.NIMIQ_RPC_URL = 'https://rpc.example.invalid';
  process.env.NIMIQ_NETWORK = 'testnet';
  process.env.NIMIQ_MIN_CONFIRMATIONS = '10';
});
after(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('matching included transaction satisfies configured confirmations', () => {
  assert.equal(validatePayment(transaction, receipt, 10), transaction);
  assert.equal(
    validatePayment({ ...transaction, hash: transaction.hash.toUpperCase() }, receipt, 10).value,
    123456,
  );
});

for (const [name, patch] of Object.entries({
  hash: { hash: 'cd'.repeat(32) },
  network: { networkId: 24 },
  sender: { from: recipient },
  recipient: { to: address },
  value: { value: 123455 },
  reference: { recipientData: Buffer.from('dotneet:another-intent').toString('hex') },
  senderType: { fromType: 1 },
  recipientType: { toType: 2 },
  flags: { flags: 1 },
})) {
  test(`rejects payment with changed ${name}`, () => {
    assert.throws(
      () => validatePayment({ ...transaction, ...patch }, receipt, 10),
      errorIs('PAYMENT_MISMATCH', 409),
    );
  });
}

test('failed execution cannot become a payment receipt', () => {
  assert.throws(
    () => validatePayment({ ...transaction, executionResult: false }, receipt, 10),
    errorIs('PAYMENT_EXECUTION_FAILED', 409),
  );
});

test('insufficient confirmations are pending rather than a failed transfer', () => {
  assert.throws(
    () => validatePayment({ ...transaction, confirmations: 9 }, receipt, 10),
    errorIs('PAYMENT_PENDING', 202),
  );
});

test('incomplete or numerically unsafe transaction fields remain verification-unavailable', () => {
  for (const candidate of [
    null,
    {},
    { ...transaction, value: Number.MAX_SAFE_INTEGER + 1 },
    { ...transaction, value: 1.5 },
    { ...transaction, blockNumber: 0 },
    { ...transaction, confirmations: -1 },
    { ...transaction, timestamp: undefined },
  ]) {
    assert.throws(() => validatePayment(candidate, receipt, 10), errorIs('RPC_UNAVAILABLE', 503));
  }
});

test('missing execution outcome is unavailable, not a claim that execution failed', () => {
  assert.throws(
    () => validatePayment({ ...transaction, executionResult: undefined }, receipt, 10),
    errorIs('RPC_UNAVAILABLE', 503),
  );
});

type RpcRequest = { jsonrpc: string; id: string; method: string; params: unknown[] };
function fakeRpc(makeWire: (request: RpcRequest) => unknown, status = 200): typeof fetch {
  return (async (_url: RequestInfo | URL, init?: RequestInit) => {
    const request = JSON.parse(init?.body as string) as RpcRequest;
    return new Response(JSON.stringify(makeWire(request)), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
}

test('RPC unwraps result.data and sends the exact method, hash, timeout and no-cache request', async () => {
  const fetcher = (async (url: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(String(url), 'https://rpc.example.invalid/');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.cache, 'no-store');
    assert.ok(init?.signal instanceof AbortSignal);
    const request = JSON.parse(init?.body as string) as RpcRequest;
    assert.equal(request.jsonrpc, '2.0');
    assert.equal(request.method, 'getTransactionByHash');
    assert.deepEqual(request.params, [receipt.transactionHash]);
    return Response.json({
      jsonrpc: '2.0',
      id: request.id,
      result: { data: transaction, metadata: null },
    });
  }) as typeof fetch;
  assert.deepEqual(
    await rpc('getTransactionByHash', [receipt.transactionHash], fetcher),
    transaction,
  );
});

test('a transaction absent from indexed history remains pending', async () => {
  await assert.rejects(
    rpc(
      'getTransactionByHash',
      [receipt.transactionHash],
      fakeRpc((r) => ({
        jsonrpc: '2.0',
        id: r.id,
        error: { code: -32603, data: 'Transaction not found: ' + receipt.transactionHash },
      })),
    ),
    errorIs('PAYMENT_PENDING', 202),
  );
});

for (const reason of [
  'Method requires a history index',
  'Method not supported for a light blockchain',
  'No consensus',
  'Rate limit exceeded',
]) {
  test(`RPC service failure is unavailable: ${reason}`, async () => {
    await assert.rejects(
      rpc(
        'getTransactionByHash',
        [receipt.transactionHash],
        fakeRpc((r) => ({ jsonrpc: '2.0', id: r.id, error: { code: -32603, data: reason } })),
      ),
      errorIs('RPC_UNAVAILABLE', 503),
    );
  });
}

test('not-found wording on unrelated RPC methods is not mistaken for payment pending', async () => {
  await assert.rejects(
    rpc(
      'getNetworkId',
      [],
      fakeRpc((r) => ({
        jsonrpc: '2.0',
        id: r.id,
        error: { data: 'Transaction not found: fixture' },
      })),
    ),
    errorIs('RPC_UNAVAILABLE', 503),
  );
});

test('RPC rejects mismatched response IDs and malformed envelopes', async () => {
  const invalid = [
    (r: RpcRequest) => ({ jsonrpc: '2.0', id: r.id + '-wrong', result: { data: transaction } }),
    (r: RpcRequest) => ({ jsonrpc: '1.0', id: r.id, result: { data: transaction } }),
    (r: RpcRequest) => ({ jsonrpc: '2.0', id: r.id, result: transaction }),
    (r: RpcRequest) => ({ jsonrpc: '2.0', id: r.id, result: null }),
  ];
  for (const wire of invalid)
    await assert.rejects(
      rpc('getTransactionByHash', [receipt.transactionHash], fakeRpc(wire)),
      errorIs('RPC_UNAVAILABLE', 503),
    );
});

test('HTTP failures, invalid JSON and timeout-like transport errors never establish payment failure', async () => {
  const fetchers = [
    fakeRpc((r) => ({ jsonrpc: '2.0', id: r.id }), 429),
    (async () => new Response('not JSON')) as typeof fetch,
    (async () => {
      throw new DOMException('Local timeout fixture', 'TimeoutError');
    }) as typeof fetch,
  ];
  for (const fetcher of fetchers)
    await assert.rejects(
      rpc('getTransactionByHash', [receipt.transactionHash], fetcher),
      errorIs('RPC_UNAVAILABLE', 503),
    );
});

test('missing or insecure RPC configuration fails before any request', async () => {
  const previous = process.env.NIMIQ_RPC_URL;
  let calls = 0;
  const neverFetch = (async () => {
    calls++;
    throw new Error('Must not fetch');
  }) as typeof fetch;
  try {
    for (const url of ['', 'not a url', 'http://rpc.example.invalid']) {
      process.env.NIMIQ_RPC_URL = url;
      await assert.rejects(rpc('getNetworkId', [], neverFetch), errorIs('RPC_UNAVAILABLE', 503));
    }
    assert.equal(calls, 0);
  } finally {
    process.env.NIMIQ_RPC_URL = previous;
  }
});

test('checkPayment verifies the server network before requesting transaction details', async () => {
  const previousFetch = globalThis.fetch;
  const methods: string[] = [];
  try {
    globalThis.fetch = fakeRpc((r) => {
      methods.push(r.method);
      return {
        jsonrpc: '2.0',
        id: r.id,
        result: {
          data: r.method === 'getNetworkId' ? 'TestAlbatross' : transaction,
          metadata: null,
        },
      };
    });
    assert.deepEqual(await checkPayment(receipt), transaction);
    assert.deepEqual(methods, ['getNetworkId', 'getTransactionByHash']);
    methods.length = 0;
    globalThis.fetch = fakeRpc((r) => {
      methods.push(r.method);
      return { jsonrpc: '2.0', id: r.id, result: { data: 'MainAlbatross' } };
    });
    await assert.rejects(checkPayment(receipt), errorIs('RPC_UNAVAILABLE', 503));
    assert.deepEqual(methods, ['getNetworkId']);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
