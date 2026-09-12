import { PrismaClient } from '@prisma/client';
import { AppError } from '../domain';
const globalDb = globalThis as unknown as { dotneetDb?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL)
    throw new AppError(
      'SERVICE_UNAVAILABLE',
      'The data service is not configured. Your wallet has not been asked to pay.',
      503,
    );
  if (!globalDb.dotneetDb) globalDb.dotneetDb = new PrismaClient({ log: ['error'] });
  return globalDb.dotneetDb;
}
