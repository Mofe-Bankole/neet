import { getPublicProfile } from '@/lib/server/profiles';
import { json, route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const GET = route(async (_request, ctx) =>
  json(await getPublicProfile((await ctx.params).handle), 200, true),
);
export const OPTIONS = () => json({}, 200, true);
