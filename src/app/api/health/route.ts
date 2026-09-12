import { json, route } from '@/lib/server/http';
import { db } from '@/lib/server/db';
export const runtime = 'nodejs';
export const GET = route(async () => {
  await db().$queryRaw`SELECT 1`;
  return json({ status: 'ok' });
});
