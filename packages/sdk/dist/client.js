import { NeetSDKError } from './errors.js';
/** Lowest-level HTTP wrapper used by the endpoint modules. */
export class NeetClient {
    baseUrl;
    network;
    defaultTimeoutMs;
    defaultHeaders;
    fetchImpl;
    constructor(config) {
        this.baseUrl = normalizeBaseUrl(config.baseUrl);
        this.network = config.network ?? 'mainnet';
        this.defaultTimeoutMs = config.timeoutMs ?? 10_000;
        this.defaultHeaders = new Headers(config.headers);
        this.fetchImpl = config.fetch ?? globalThis.fetch;
    }
    /** Perform an HTTP GET and parse the JSON response. */
    get(path, options) {
        return this.request(path, { ...options, method: 'GET' });
    }
    async request(path, options) {
        const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
        const controller = new AbortController();
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, timeoutMs);
        const externalSignal = options.signal;
        const onExternalAbort = () => controller.abort();
        if (externalSignal) {
            if (externalSignal.aborted) {
                controller.abort();
            }
            else {
                externalSignal.addEventListener('abort', onExternalAbort);
            }
        }
        try {
            const headers = new Headers(this.defaultHeaders);
            if (options.headers) {
                new Headers(options.headers).forEach((value, key) => headers.set(key, value));
            }
            headers.set('Accept', 'application/json');
            headers.set('x-neet-network', this.network);
            const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
                method: options.method,
                headers,
                body: options.body,
                signal: controller.signal,
            });
            const text = await response.text();
            let data = null;
            if (text.length > 0) {
                try {
                    data = JSON.parse(text);
                }
                catch {
                    throw new NeetSDKError('Response body is not valid JSON', {
                        status: response.status,
                        code: 'PARSE',
                    });
                }
            }
            if (!response.ok) {
                throw new NeetSDKError(readErrorMessage(data), {
                    status: response.status,
                    code: response.status === 404 ? 'NOT_FOUND' : 'HTTP',
                    retryable: response.status >= 500,
                });
            }
            return data;
        }
        catch (error) {
            if (error instanceof NeetSDKError)
                throw error;
            if (isAbortError(error)) {
                throw new NeetSDKError(timedOut ? `Request timed out after ${timeoutMs}ms` : 'Request was aborted', { code: 'TIMEOUT', cause: error });
            }
            throw new NeetSDKError('Network request failed', {
                code: 'NETWORK',
                cause: error,
                retryable: true,
            });
        }
        finally {
            clearTimeout(timer);
            if (externalSignal)
                externalSignal.removeEventListener('abort', onExternalAbort);
        }
    }
}
function normalizeBaseUrl(baseUrl) {
    if (typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
        throw new NeetSDKError('baseUrl is required', { code: 'VALIDATION' });
    }
    let parsed;
    try {
        parsed = new URL(baseUrl);
    }
    catch {
        throw new NeetSDKError('baseUrl must be a valid URL', { code: 'VALIDATION' });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new NeetSDKError('baseUrl must use http or https', { code: 'VALIDATION' });
    }
    return parsed.toString().replace(/\/+$/, '');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readErrorMessage(payload) {
    if (isRecord(payload) && typeof payload.error === 'string' && payload.error.length > 0) {
        return payload.error;
    }
    return 'Request failed';
}
function isAbortError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        error.name === 'AbortError');
}
//# sourceMappingURL=client.js.map