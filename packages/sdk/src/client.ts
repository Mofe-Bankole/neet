import { NeetSDKError } from './errors.js'
import type { Network } from './types.js'

/** Configuration for the .neet SDK. */
export interface NeetSDKConfig {
  /**
   * Base URL of the .neet deployment, e.g. `https://neet.vercel.app`.
   * Trailing slashes are stripped.
   */
  baseUrl: string
  /**
   * Nimiq network the SDK targets. Sent to the API as the
   * `x-neet-network` header (default `mainnet`).
   */
  network?: Network
  /** Per-request timeout in milliseconds (default 10_000). */
  timeoutMs?: number
  /** Additional headers sent on every request. */
  headers?: HeadersInit
  /** Custom fetch implementation (useful in tests and non-browser runtimes). */
  fetch?: typeof fetch
}

/** Options accepted by individual requests. */
export interface RequestOptions {
  /** Per-request timeout override. */
  timeoutMs?: number
  /** Merge these headers onto the request. */
  headers?: HeadersInit
  /** Abort the request from the caller's side. */
  signal?: AbortSignal
  /** Optional request body. */
  body?: BodyInit | null
}

/** Lowest-level HTTP wrapper used by the endpoint modules. */
export class NeetClient {
  readonly baseUrl: string
  readonly network: Network

  private readonly defaultTimeoutMs: number
  private readonly defaultHeaders: Headers
  private readonly fetchImpl: typeof fetch

  constructor(config: NeetSDKConfig) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl)
    this.network = config.network ?? 'mainnet'
    this.defaultTimeoutMs = config.timeoutMs ?? 10_000
    this.defaultHeaders = new Headers(config.headers)
    this.fetchImpl = config.fetch ?? globalThis.fetch
  }

  /** Perform an HTTP GET and parse the JSON response. */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  private async request<T>(
    path: string,
    options: RequestOptions & { method: string },
  ): Promise<T> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)

    const externalSignal = options.signal
    const onExternalAbort = () => controller.abort()
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort()
      } else {
        externalSignal.addEventListener('abort', onExternalAbort)
      }
    }

    try {
      const headers = new Headers(this.defaultHeaders)
      if (options.headers) {
        new Headers(options.headers).forEach((value, key) => headers.set(key, value))
      }
      headers.set('Accept', 'application/json')
      headers.set('x-neet-network', this.network)

      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: options.method,
        headers,
        body: options.body,
        signal: controller.signal,
      })

      const text = await response.text()
      let data: unknown = null
      if (text.length > 0) {
        try {
          data = JSON.parse(text) as unknown
        } catch {
          throw new NeetSDKError('Response body is not valid JSON', {
            status: response.status,
            code: 'PARSE',
          })
        }
      }

      if (!response.ok) {
        throw new NeetSDKError(readErrorMessage(data), {
          status: response.status,
          code: response.status === 404 ? 'NOT_FOUND' : 'HTTP',
          retryable: response.status >= 500,
        })
      }

      return data as T
    } catch (error) {
      if (error instanceof NeetSDKError) throw error
      if (isAbortError(error)) {
        throw new NeetSDKError(
          timedOut ? `Request timed out after ${timeoutMs}ms` : 'Request was aborted',
          { code: 'TIMEOUT', cause: error },
        )
      }
      throw new NeetSDKError('Network request failed', {
        code: 'NETWORK',
        cause: error,
        retryable: true,
      })
    } finally {
      clearTimeout(timer)
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort)
    }
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  if (typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
    throw new NeetSDKError('baseUrl is required', { code: 'VALIDATION' })
  }

  let parsed: URL
  try {
    parsed = new URL(baseUrl)
  } catch {
    throw new NeetSDKError('baseUrl must be a valid URL', { code: 'VALIDATION' })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new NeetSDKError('baseUrl must use http or https', { code: 'VALIDATION' })
  }

  return parsed.toString().replace(/\/+$/, '')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readErrorMessage(payload: unknown): string {
  if (isRecord(payload) && typeof payload.error === 'string' && payload.error.length > 0) {
    return payload.error
  }
  return 'Request failed'
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'AbortError'
  )
}