import type { NeetSDKConfig } from './client.js';
import { IdentityApi } from './endpoints/identity.js';
import { ReputationApi } from './endpoints/reputation.js';
import { ActivityApi } from './endpoints/activity.js';
import type { ActivityItem, IdentityResponse, ReputationBreakdown, ReputationResponse, SearchOptions, SearchResult, Network } from './types.js';
export * from './types.js';
export { NeetClient } from './client.js';
export type { NeetSDKConfig, RequestOptions } from './client.js';
export { NeetSDKError, isNeetSDKError } from './errors.js';
export type { NeetSDKErrorCode, NeetSDKErrorOptions } from './errors.js';
export { IdentityApi } from './endpoints/identity.js';
export { ReputationApi } from './endpoints/reputation.js';
export { ActivityApi } from './endpoints/activity.js';
export { HANDLE_MAX_LENGTH, HANDLE_MIN_LENGTH, HANDLE_REGEX, NEET_SUFFIX, NIMIQ_ALPHABET, assertValidHandle, assertValidNimiqAddress, isValidEthereumAddress, isValidHandle, isValidNimiqAddress, normalizeHandle, normalizeNimiqAddress, toFullHandle, } from './utils/validation.js';
/**
 * Main developer-facing facade for the .neet SDK.
 *
 * ```ts
 * const neet = new NeetSDK({ baseUrl: 'https://neet.vercel.app', network: 'testnet' })
 * const { identity } = await neet.getIdentity('james.neet')
 * ```
 */
export declare class NeetSDK {
    readonly network: Network;
    private readonly client;
    readonly identity: IdentityApi;
    readonly reputation: ReputationApi;
    readonly activity: ActivityApi;
    constructor(config: NeetSDKConfig);
    /** Fetch a profile by handle (`james` or `james.neet`). */
    readonly getIdentity: (handle: string) => Promise<IdentityResponse>;
    /** Search identities by handle prefix (min 2 characters). */
    readonly search: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
    /** Fetch total reputation, breakdown, and raw events. */
    readonly getReputation: (handle: string) => Promise<ReputationResponse>;
    /** Fetch only the reputation breakdown by event type. */
    readonly getBreakdown: (handle: string) => Promise<ReputationBreakdown>;
    /** Fetch the combined activity feed, newest first. */
    readonly getActivity: (handle: string) => Promise<ActivityItem[]>;
}
//# sourceMappingURL=index.d.ts.map