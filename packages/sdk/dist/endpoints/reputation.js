import { NeetClient } from '../client.js';
import { toFullHandle } from '../utils/validation.js';
/** Reputation lookups. */
export class ReputationApi {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Fetch total reputation, the breakdown by event type, and the raw events.
     */
    async getReputation(handle) {
        const fullHandle = toFullHandle(handle);
        return this.client.get(`/api/reputation/${encodeURIComponent(fullHandle)}`);
    }
    /**
     * Fetch only the reputation breakdown, e.g.
     * `{ CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15 }`.
     */
    async getBreakdown(handle) {
        const response = await this.getReputation(handle);
        return response.breakdown;
    }
}
//# sourceMappingURL=reputation.js.map