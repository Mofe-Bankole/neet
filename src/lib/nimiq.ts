import { init, type NimiqProvider } from '@nimiq/mini-app-sdk';
let providerPromise: Promise<NimiqProvider> | null = null;
export async function initializeNimiqProvider() {
  if (typeof window === 'undefined') throw new Error('Open Dotneet inside Nimiq Pay.');
  if (!providerPromise)
    providerPromise = init({ timeout: 5000 }).catch((error) => {
      providerPromise = null;
      throw error;
    });
  return providerPromise;
}
export function isNimiqPayAvailable() {
  return typeof window !== 'undefined' && Boolean(window.nimiq || window.nimiqPay);
}
function unwrap<T>(result: T): Exclude<T, { error: unknown }> {
  if (typeof result === 'object' && result !== null && 'error' in result) {
    const error = result.error as { message?: string; type?: string };
    const e = new Error(error.message || 'The wallet request was not completed.');
    e.name = error.type || 'WalletError';
    throw e;
  }
  return result as Exclude<T, { error: unknown }>;
}
export async function connectNimiqWallet() {
  const p = await initializeNimiqProvider();
  return unwrap(await p.listAccounts());
}
export async function signMessage(message: string) {
  const p = await initializeNimiqProvider();
  return unwrap(await p.sign(message));
}
export async function payContribution(recipient: string, value: number, reference: string) {
  const p = await initializeNimiqProvider();
  return unwrap(await p.sendBasicTransactionWithData({ recipient, value, data: reference }));
}
export const listNimiqAccounts = connectNimiqWallet;
export const formatNimAddress = (address: string) => address.slice(0, 8) + '…' + address.slice(-6);
export const formatNimAmount = (amount: number) => amount.toFixed(5) + ' NIM';

export async function requireWalletAddress(expected: string) {
  const accounts = await connectNimiqWallet();
  const selected = accounts[0]?.replace(/ /g, '').toUpperCase();
  if (selected !== expected.replace(/ /g, '').toUpperCase())
    throw new Error(
      'The active wallet differs from this session. Select the original wallet in Nimiq Pay, or sign out and connect again.',
    );
}
