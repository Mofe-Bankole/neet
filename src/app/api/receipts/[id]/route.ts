import { getReceipt, serializeReceipt } from '@/lib/server/receipts';
import { currentSession } from '@/lib/server/auth';
import { route, json } from '@/lib/server/http';
export const runtime = 'nodejs';
export const GET = route(async (_request, ctx) => {
  const receipt = await getReceipt((await ctx.params).id);
  const session = await currentSession();
  const participant =
    session &&
    (session.address === receipt.issuerAddress || session.address === receipt.recipientAddress);
  return json({ receipt: serializeReceipt(receipt, !participant) });
});
