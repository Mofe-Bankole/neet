import type { Network } from './types.js';
/** Configuration for the .neet SDK. */
export interface NeetSDKConfig {
    /**
     * Base URL of the .neet deployment, e.g. `https://neet.vercel.app`.
     * Trailing slashes are stripped.
     */
    baseUrl: string;
    /**
     * Nimiq network the SDK targets. Sent to the API as the
     * `x-neet-network` header (default `mainnet`).
     */
    network?: Network;
    /** Per-request timeout in milliseconds (default 10_000). */
    timeoutMs?: number;
    /** Additional headers sent on every request. */
    headers?: HeadersInit;
    /** Custom fetch implementation (useful in tests and non-browser runtimes). */
    fetch?: typeof fetch;
}
/** Options accepted by individual requests. */
export interface RequestOptions {
    /** Per-request timeout override. */
    timeoutMs?: number;
    /** Merge these headers onto the request. */
    headers?: HeadersInit;
    /** Abort the request from the caller's side. */
    signal?: AbortSignal;
    /** Optional request body. */
    body?: BodyInit | null;
}
/** Lowest-level HTTP wrapper used by the endpoint modules. */
export declare class NeetClient {
    readonly baseUrl: string;
    readonly network: Network;
    private readonly defaultTimeoutMs;
    private readonly defaultHeaders;
    private readonly fetchImpl;
    constructor(config: NeetSDKConfig);
    /** Perform an HTTP GET and parse the JSON response. */
    get<T>(path: string, options?: RequestOptions): Promise<T>;
    private request;
}
//# sourceMappingURL=client.d.ts.map