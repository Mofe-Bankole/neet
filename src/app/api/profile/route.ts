import { editProfile } from '@/lib/server/profiles';
import { route } from '@/lib/server/http';
export const runtime = 'nodejs';
export const PATCH = route((request) => editProfile(request));
