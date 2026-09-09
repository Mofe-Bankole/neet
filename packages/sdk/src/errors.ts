/** Error codes raised by the SDK. */
export type NeetSDKErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'HTTP'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'PARSE'

/** Options for constructing a {@link NeetSDKError}. */
export interface NeetSDKErrorOptions {
  /** HTTP status code when the error originated from a response. */
  status?: number
  /** Error code categorising the failure. */
  code?: NeetSDKErrorCode
  /** Underlying error that triggered this one. */
  cause?: unknown
  /** Whether retrying the request is likely to help. */
  retryable?: boolean
}

/**
 * Error thrown by the SDK for invalid input, failed requests, and
 * non-JSON responses.
 */
export class NeetSDKError extends Error {
  readonly status?: number
  readonly code: NeetSDKErrorCode
  override readonly cause?: unknown
  readonly retryable: boolean

  constructor(message: string, options: NeetSDKErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'NeetSDKError'
    this.code = options.code ?? 'HTTP'
    this.status = options.status
    this.cause = options.cause
    this.retryable = options.retryable ?? false
  }
}

/** Type guard for {@link NeetSDKError}. */
export function isNeetSDKError(value: unknown): value is NeetSDKError {
  return value instanceof NeetSDKError
}