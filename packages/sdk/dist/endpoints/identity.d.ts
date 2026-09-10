import { NeetClient } from '../client.js';
import type { IdentityResponse, SearchOptions, SearchResult } from '../types.js';
/** Identity lookups and identity search. */
export declare class IdentityApi {
    private readonly client;
    constructor(client: NeetClient);
    /**
     * Fetch a profile by handle. Accepts `james` or `james.neet`.
     *
     * @returns The identity (profile, reputation, stats) plus recent endorsements.
     */
    getIdentity(handle: string): Promise<IdentityResponse>;
    /**
     * Search identities by bare handle or full handle prefix (min 2 characters).
     */
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}
//# sourceMappingURL=identity.d.ts.map