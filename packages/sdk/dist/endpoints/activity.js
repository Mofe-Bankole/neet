import { NeetClient } from '../client.js';
import { toFullHandle } from '../utils/validation.js';
/** Activity feed lookups. */
export class ActivityApi {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Fetch the combined activity feed (posts, endorsements received, and
     * reputation events), newest first.
     */
    async getActivity(handle) {
        const fullHandle = toFullHandle(handle);
        const response = await this.client.get(`/api/activity/${encodeURIComponent(fullHandle)}`);
        return response.activity;
    }
}
//# sourceMappingURL=activity.js.map