import { legacyHandle } from '@/lib/server/profiles';
import { normalizeHandle } from '@/lib/domain';
import { db } from '@/lib/server/db';
import { config } from '@/lib/server/config';
import { json, route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const GET = route(async (_request, ctx) => {
  const handle = normalizeHandle((await ctx.params).handle);
  const network = config().network;
  const profile = await db().walletProfile.findUnique({
    where: { network_handle: { network, handle } },
  });
  const legacy = profile ? null : await legacyHandle(handle);
  return json(
    { handle, network, available: !profile && !legacy, reservedForLegacyOwner: Boolean(legacy) },
    200,
    true,
  );
});
export const OPTIONS = async () => json({}, 200, true);
