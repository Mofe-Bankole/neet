import { createReceipt, listReceipts } from '@/lib/server/receipts';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const POST = route((request) => createReceipt(request));
export const GET = route((request) => listReceipts(request));
