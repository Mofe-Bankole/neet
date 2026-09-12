import { NextResponse } from 'next/server';
import { AppError, assert } from '../domain';
import { config } from './config';
import { db } from './db';
import { digest } from './crypto';
export type RouteContext = { params: Promise<Record<string, string>> };
export function json(data: unknown, status = 200, publicRead = false) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(publicRead
        ? { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
        : {}),
    },
  });
}
export function errorResponse(error: unknown) {
  if (error instanceof AppError)
    return json({ error: { code: error.code, message: error.message } }, error.status);
  const code = (error as { code?: string })?.code;
  if (code === 'P2002')
    return json(
      {
        error: {
          code: 'CONFLICT',
          message: 'This name, wallet or payment reference is already in use.',
        },
      },
      409,
    );
  if (code === 'P2025')
    return json({ error: { code: 'NOT_FOUND', message: 'This record is not available.' } }, 404);
  console.error('[dotneet] request failed', error instanceof Error ? error.name : 'UnknownError');
  return json(
    {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The data service is temporarily unavailable. Please try again.',
      },
    },
    503,
  );
}
export const route =
  (fn: (request: Request, context: RouteContext) => Promise<Response>) =>
  async (request: Request, context: RouteContext) => {
    try {
      if (request.method === 'GET' && new URL(request.url).pathname.startsWith('/api/v1/'))
        await limit('public-read:global', 600);
      return await fn(request, context);
    } catch (e) {
      const response = errorResponse(e);
      if (new URL(request.url).pathname.startsWith('/api/v1/')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      }
      return response;
    }
  };
export function sameOrigin(request: Request) {
  assert(
    request.headers.get('origin') === config().origin,
    'ORIGIN_REJECTED',
    'This action must be requested from Dotneet.',
    403,
  );
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  assert(
    (request.headers.get('content-type') || '').includes('application/json'),
    'INVALID_CONTENT_TYPE',
    'Use a JSON request.',
  );
  const reader = request.body?.getReader();
  assert(reader, 'INVALID_BODY', 'A request body is required.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 12000) {
      await reader.cancel();
      throw new AppError('BODY_TOO_LARGE', 'The request is too large.', 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    assert(
      data && typeof data === 'object' && !Array.isArray(data),
      'INVALID_BODY',
      'Use a JSON object.',
    );
    return data;
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError('INVALID_BODY', 'The request could not be read.');
  }
}
export async function limit(key: string, max = 40, windowSeconds = 60) {
  const now = new Date();
  const bucket = digest(key);
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db().$queryRaw<{ count: number }[]>`
 INSERT INTO "RateLimitBucket" ("key","count","resetAt") VALUES (${bucket},1,${resetAt})
 ON CONFLICT ("key") DO UPDATE SET "count"=CASE WHEN "RateLimitBucket"."resetAt"<${now} THEN 1 ELSE "RateLimitBucket"."count"+1 END,"resetAt"=CASE WHEN "RateLimitBucket"."resetAt"<${now} THEN ${resetAt} ELSE "RateLimitBucket"."resetAt" END RETURNING "count"
`;
  assert(
    rows[0].count <= max,
    'RATE_LIMITED',
    'Too many requests. Please wait a minute and try again.',
    429,
  );
}
