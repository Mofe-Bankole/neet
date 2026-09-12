import { getReceipt, serializeReceipt } from '@/lib/server/receipts';
import { json, route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const GET = route(async (_request, ctx) =>
  json(
    { receipt: serializeReceipt(await getReceipt((await ctx.params).id, true), true) },
    200,
    true,
  ),
);
export const OPTIONS = () => json({}, 200, true);
