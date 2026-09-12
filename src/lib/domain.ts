export type Network = 'mainnet' | 'testnet';
export const NETWORK_IDS = { mainnet: 24, testnet: 5 } as const;
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
export function assert(
  condition: unknown,
  code: string,
  message: string,
  status = 400,
): asserts condition {
  if (!condition) throw new AppError(code, message, status);
}
export function text(value: unknown, label: string, max: number, min = 0): string {
  assert(typeof value === 'string', 'INVALID_INPUT', label + ' must be text.');
  const result = value.trim();
  assert(
    result.length >= min && result.length <= max,
    'INVALID_INPUT',
    label + ' must be ' + min + '–' + max + ' characters.',
  );
  assert(
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result),
    'INVALID_INPUT',
    'Control characters are not allowed.',
  );
  return result;
}
const reserved = new Set([
  'app',
  'api',
  'admin',
  'www',
  'preview',
  'design-system',
  'acknowledge',
  'receipts',
  'nimiq',
  'dotneet',
  'support',
  'help',
  'settings',
  'assets',
  'login',
  'logout',
  'favicon',
  'robots',
  '_next',
]);
export function normalizeHandle(value: unknown): string {
  const handle = text(value, 'Name', 37, 3)
    .toLowerCase()
    .replace(/\.neet$/, '');
  assert(
    /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(handle),
    'INVALID_HANDLE',
    'Use 3–32 lowercase letters, numbers or interior hyphens.',
  );
  assert(!reserved.has(handle), 'RESERVED_HANDLE', 'This name is reserved.');
  return handle;
}
export function lunaFromDecimal(value: unknown): number {
  assert(
    typeof value === 'string' && /^(?:0|[1-9]\d{0,9})(?:\.\d{1,5})?$/.test(value),
    'INVALID_AMOUNT',
    'Enter a positive NIM amount with up to 5 decimal places.',
  );
  const [whole, fraction = ''] = value.split('.');
  const luna = BigInt(whole) * 100000n + BigInt(fraction.padEnd(5, '0'));
  assert(
    luna > 0n && luna <= 100000000000000n,
    'INVALID_AMOUNT',
    'Amount is outside the supported range.',
  );
  return Number(luna);
}
export function formatLuna(value: number | string): string {
  const raw = BigInt(value);
  return (
    (raw / 100000n).toString() +
    '.' +
    (raw % 100000n)
      .toString()
      .padStart(5, '0')
      .replace(/0{1,3}$/, '')
  );
}
export function evidenceUrl(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const raw = text(value, 'Evidence link', 1000);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new AppError('INVALID_URL', 'Use a complete HTTPS evidence link.');
  }
  assert(
    url.protocol === 'https:' && !url.username && !url.password,
    'INVALID_URL',
    'Use an HTTPS link without embedded credentials.',
  );
  return url.toString();
}
export function txHash(value: unknown): string {
  assert(
    typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value),
    'INVALID_HASH',
    'Enter a 64-character transaction hash.',
  );
  return value.toLowerCase();
}
export function asciiJson(value: unknown): string {
  return JSON.stringify(value).replace(
    /[\u007f-\uffff]/g,
    (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  );
}
export interface ReceiptFacts {
  id: string;
  network: string;
  issuerAddress: string;
  recipientAddress: string;
  amountLuna: number | string | bigint;
  statement: string;
  evidenceUrl: string | null;
  transactionHash: string | null;
  createdAt: Date | string;
}
export function acknowledgmentText(r: ReceiptFacts, origin: string): string {
  return asciiJson({
    schema: 'dotneet.contribution.v1',
    purpose: 'acknowledge-contribution',
    origin,
    receiptId: r.id,
    network: r.network,
    issuer: r.issuerAddress,
    recipient: r.recipientAddress,
    amountLuna: r.amountLuna.toString(),
    statement: r.statement,
    evidenceUrl: r.evidenceUrl,
    transactionHash: r.transactionHash,
    createdAt: new Date(r.createdAt).toISOString(),
  });
}
export function paymentMarker(id: string) {
  return 'dotneet:' + id;
}
export function mayReadReceipt(
  r: {
    issuerAddress: string;
    recipientAddress: string;
    publishedAt: Date | string | null;
    paymentState: string;
    signatureVerifiedAt: Date | string | null;
  },
  address?: string,
) {
  return (
    address === r.issuerAddress ||
    address === r.recipientAddress ||
    Boolean(r.publishedAt && r.paymentState === 'CONFIRMED' && r.signatureVerifiedAt)
  );
}
export function mayPublishReceipt(
  r: {
    recipientAddress: string;
    paymentState: string;
    signatureVerifiedAt: Date | string | null;
    withdrawnAt?: Date | string | null;
  },
  address: string,
) {
  return (
    address === r.recipientAddress &&
    r.paymentState === 'CONFIRMED' &&
    Boolean(r.signatureVerifiedAt) &&
    !r.withdrawnAt
  );
}
