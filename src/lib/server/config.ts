import { AppError, type Network } from '../domain';
export function config() {
  const network = process.env.NIMIQ_NETWORK || 'testnet';
  if (network !== 'mainnet' && network !== 'testnet')
    throw new AppError('CONFIGURATION', 'Unsupported network configuration.', 503);
  const origin =
    process.env.APP_ORIGIN ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
  if (!origin)
    throw new AppError('CONFIGURATION', 'The application origin is not configured.', 503);
  const parsed = new URL(origin);
  if (parsed.origin !== origin)
    throw new AppError(
      'CONFIGURATION',
      'APP_ORIGIN must be an origin without a path or trailing slash.',
      503,
    );
  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:')
    throw new AppError('CONFIGURATION', 'Production requires HTTPS.', 503);
  const confirmations = Number(process.env.NIMIQ_MIN_CONFIRMATIONS || 10);
  if (!Number.isSafeInteger(confirmations) || confirmations < 1)
    throw new AppError('CONFIGURATION', 'Invalid confirmation policy.', 503);
  return {
    network: network as Network,
    origin,
    confirmations,
    rpcUrl: process.env.NIMIQ_RPC_URL || '',
    secure: parsed.protocol === 'https:',
  };
}
