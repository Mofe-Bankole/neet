import { NeetClient } from '../client.js';
import type { ReputationBreakdown, ReputationResponse } from '../types.js';
/** Reputation lookups. */
export declare class ReputationApi {
    private readonly client;
    constructor(client: NeetClient);
    /**
     * Fetch total reputation, the breakdown by event type, and the raw events.
     */
    getReputation(handle: string): Promise<ReputationResponse>;
    /**
     * Fetch only the reputation breakdown, e.g.
     * `{ CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15 }`.
     */
    getBreakdown(handle: string): Promise<ReputationBreakdown>;
}
//# sourceMappingURL=reputation.d.ts.map