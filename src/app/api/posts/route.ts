import { json } from '@/lib/server/http';
const retired = () =>
  json(
    {
      error: {
        code: 'LEGACY_ENDPOINT_RETIRED',
        message:
          'This unverified reputation endpoint is retired. Use the documented v1 profile and receipt API.',
      },
    },
    410,
  );
export const GET = retired;
export const POST = retired;
export const PATCH = retired;
