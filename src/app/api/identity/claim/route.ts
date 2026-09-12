import { claimProfile } from '@/lib/server/profiles';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const POST = route((request) => claimProfile(request));
