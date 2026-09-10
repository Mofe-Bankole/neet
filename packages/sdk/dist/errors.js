/**
 * Error thrown by the SDK for invalid input, failed requests, and
 * non-JSON responses.
 */
export class NeetSDKError extends Error {
    status;
    code;
    cause;
    retryable;
    constructor(message, options = {}) {
        super(message, options.cause === undefined ? undefined : { cause: options.cause });
        this.name = 'NeetSDKError';
        this.code = options.code ?? 'HTTP';
        this.status = options.status;
        this.cause = options.cause;
        this.retryable = options.retryable ?? false;
    }
}
/** Type guard for {@link NeetSDKError}. */
export function isNeetSDKError(value) {
    return value instanceof NeetSDKError;
}
//# sourceMappingURL=errors.js.map