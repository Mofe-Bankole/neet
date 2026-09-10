import { NeetClient } from './client.js';
import { IdentityApi } from './endpoints/identity.js';
import { ReputationApi } from './endpoints/reputation.js';
import { ActivityApi } from './endpoints/activity.js';
export * from './types.js';
export { NeetClient } from './client.js';
export { NeetSDKError, isNeetSDKError } from './errors.js';
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
export class NeetSDK {
    network;
    client;
    identity;
    reputation;
    activity;
    constructor(config) {
        this.network = config.network ?? 'mainnet';
        this.client = new NeetClient({ ...config, network: this.network });
        this.identity = new IdentityApi(this.client);
        this.reputation = new ReputationApi(this.client);
        this.activity = new ActivityApi(this.client);
    }
    /** Fetch a profile by handle (`james` or `james.neet`). */
    getIdentity = (handle) => this.identity.getIdentity(handle);
    /** Search identities by handle prefix (min 2 characters). */
    search = (query, options) => this.identity.search(query, options);
    /** Fetch total reputation, breakdown, and raw events. */
    getReputation = (handle) => this.reputation.getReputation(handle);
    /** Fetch only the reputation breakdown by event type. */
    getBreakdown = (handle) => this.reputation.getBreakdown(handle);
    /** Fetch the combined activity feed, newest first. */
    getActivity = (handle) => this.activity.getActivity(handle);
}
//# sourceMappingURL=index.js.map