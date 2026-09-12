import { publish } from '@/lib/server/receipts';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const PATCH = route(async (request, ctx) => publish(request, (await ctx.params).id));
