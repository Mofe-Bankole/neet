import { createChallenge } from '@/lib/server/auth';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const POST = route((request) => createChallenge(request));
