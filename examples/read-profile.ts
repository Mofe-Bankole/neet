/** Public read integration: no credentials, no reputation score. */
export async function readDotneetProfile(appOrigin: string, handle: string) {
  const base = new URL(appOrigin);
  if (base.protocol !== 'https:' && base.hostname !== 'localhost' && base.hostname !== '127.0.0.1')
    throw new Error('Use the configured HTTPS application origin.');
  const response = await fetch(new URL('/api/v1/profiles/' + encodeURIComponent(handle), base), {
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Dotneet is unavailable.');
  return result;
}
// Pass your configured origin and a real claimed handle.
// Amounts are Luna strings. Check network, dates and withdrawnAt before display.
// Distinct wallets do not imply distinct people. Profile results cap at 50 receipts.
