import { sessionInfo } from '@/lib/server/auth';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const GET = route(() => sessionInfo());
