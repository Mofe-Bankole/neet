export interface Profile {
  id: string;
  network: string;
  address: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  verifiedAt: string;
  createdAt: string;
}
export interface Receipt {
  id: string;
  network: string;
  issuerId: string;
  recipientId: string;
  issuerAddress: string;
  recipientAddress: string;
  amountLuna: string;
  statement: string;
  evidenceUrl: string | null;
  paymentState: string;
  paymentAttemptId?: string | null;
  paymentAttemptAt?: string | null;
  transactionHash: string | null;
  paymentVerifiedAt: string | null;
  confirmationCount: number | null;
  verificationPolicy: string | null;
  signatureVerifiedAt: string | null;
  acknowledgmentMessage: string | null;
  acknowledgmentPublicKey: string | null;
  acknowledgmentSignature: string | null;
  publishedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  issuer?: { handle: string; address: string };
  recipient?: { handle: string; address: string };
}
export class ClientError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(url: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(data === undefined
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ClientError(
      'SERVICE_UNAVAILABLE',
      'The service could not be reached. Please try again.',
    );
  }
  if (result.error || !response.ok)
    throw new ClientError(
      result.error?.code || 'REQUEST_FAILED',
      result.error?.message || 'The request could not be completed.',
    );
  return result;
}
export function compactAddress(value: string) {
  return value.slice(0, 8) + '…' + value.slice(-6);
}
export function receiptLabel(r: Receipt) {
  if (r.withdrawnAt) return 'Acknowledgment withdrawn';
  if (r.signatureVerifiedAt && r.paymentState === 'CONFIRMED')
    return 'Payment + acknowledgment checked';
  if (r.paymentState === 'CONFIRMED') return 'Payment confirmed · signature needed';
  if (r.paymentState === 'SUBMITTED') return 'Payment submitted';
  if (r.paymentState === 'AWAITING_WALLET') return 'Payment needs reconciliation';
  if (r.paymentState === 'CANCELLED') return 'Draft cancelled';
  return 'Draft · no payment requested';
}
export async function copyLink(url: string) {
  await navigator.clipboard.writeText(url);
}
