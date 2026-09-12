import { cancel } from '@/lib/server/receipts';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const POST = route(async (request, ctx) => cancel(request, (await ctx.params).id));
