import {
  AppError,
  assert,
  NETWORK_IDS,
  paymentMarker,
  type ReceiptFacts,
  type Network,
} from '../domain';
import { canonicalAddress } from './crypto';
import { config } from './config';
export interface ChainTransaction {
  hash: string;
  networkId: number;
  from: string;
  to: string;
  value: number;
  recipientData: string;
  fromType: number;
  toType: number;
  flags: number;
  executionResult: boolean;
  blockNumber: number;
  confirmations: number;
  timestamp: number;
}
export function validatePayment(
  transaction: unknown,
  receipt: ReceiptFacts,
  minimumConfirmations: number,
): ChainTransaction {
  assert(
    transaction && typeof transaction === 'object',
    'RPC_UNAVAILABLE',
    'The payment service returned an unreadable transaction.',
    503,
  );
  const t = transaction as ChainTransaction;
  assert(
    typeof t.hash === 'string' &&
      typeof t.from === 'string' &&
      typeof t.to === 'string' &&
      typeof t.recipientData === 'string' &&
      Number.isSafeInteger(t.value) &&
      Number.isInteger(t.networkId) &&
      Number.isInteger(t.blockNumber) &&
      t.blockNumber > 0 &&
      Number.isInteger(t.confirmations) &&
      t.confirmations >= 0 &&
      Number.isSafeInteger(t.timestamp) &&
      typeof t.executionResult === 'boolean',
    'RPC_UNAVAILABLE',
    'The payment service returned incomplete transaction data.',
    503,
  );
  assert(
    t.hash.toLowerCase() === receipt.transactionHash &&
      t.networkId === NETWORK_IDS[receipt.network as Network] &&
      canonicalAddress(t.from) === receipt.issuerAddress &&
      canonicalAddress(t.to) === receipt.recipientAddress &&
      BigInt(t.value) === BigInt(receipt.amountLuna) &&
      t.recipientData.toLowerCase() ===
        Buffer.from(paymentMarker(receipt.id), 'utf8').toString('hex') &&
      t.fromType === 0 &&
      t.toType === 0 &&
      t.flags === 0,
    'PAYMENT_MISMATCH',
    'This transaction does not match the recipient, amount, network or reference for this receipt.',
    409,
  );
  assert(
    t.executionResult === true,
    'PAYMENT_EXECUTION_FAILED',
    'The blockchain reports that this transaction did not execute successfully.',
    409,
  );
  assert(
    t.confirmations >= minimumConfirmations,
    'PAYMENT_PENDING',
    'The transaction is included and is waiting for more confirmations.',
    202,
  );
  return t;
}
export async function rpc(
  method: string,
  params: unknown[],
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const c = config();
  assert(
    c.rpcUrl,
    'RPC_UNAVAILABLE',
    'Payment verification is not configured. Do not resend a payment.',
    503,
  );
  let url: URL;
  try {
    url = new URL(c.rpcUrl);
  } catch {
    throw new AppError(
      'RPC_UNAVAILABLE',
      'The payment verification service is misconfigured.',
      503,
    );
  }
  assert(
    url.protocol === 'https:' ||
      (process.env.NODE_ENV !== 'production' &&
        url.protocol === 'http:' &&
        ['127.0.0.1', 'localhost'].includes(url.hostname)),
    'RPC_UNAVAILABLE',
    'A secure payment verification service is required.',
    503,
  );
  try {
    const id = crypto.randomUUID();
    const response = await fetcher(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    assert(
      response.ok,
      'RPC_UNAVAILABLE',
      'The payment verification service is unavailable. Do not resend.',
      503,
    );
    const wire = await response.json();
    assert(
      wire.jsonrpc === '2.0' && wire.id === id,
      'RPC_UNAVAILABLE',
      'Invalid verification-service response.',
      503,
    );
    if (wire.error) {
      if (
        method === 'getTransactionByHash' &&
        typeof wire.error.data === 'string' &&
        wire.error.data.startsWith('Transaction not found:')
      )
        throw new AppError(
          'PAYMENT_PENDING',
          'This payment is not visible in indexed history yet. Check again; do not resend.',
          202,
        );
      throw new AppError(
        'RPC_UNAVAILABLE',
        'The payment verification service could not check this transaction.',
        503,
      );
    }
    assert(
      wire.result && 'data' in wire.result,
      'RPC_UNAVAILABLE',
      'Invalid verification-service response.',
      503,
    );
    return wire.result.data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'RPC_UNAVAILABLE',
      'Payment verification timed out or is unavailable. Do not resend.',
      503,
    );
  }
}
export async function checkNetwork() {
  const c = config();
  const chain = await rpc('getNetworkId', []);
  assert(
    chain === (c.network === 'mainnet' ? 'MainAlbatross' : 'TestAlbatross'),
    'RPC_UNAVAILABLE',
    'The verification service is connected to the wrong network.',
    503,
  );
}
export async function checkPayment(receipt: ReceiptFacts) {
  await checkNetwork();
  return validatePayment(
    await rpc('getTransactionByHash', [receipt.transactionHash]),
    receipt,
    config().confirmations,
  );
}
