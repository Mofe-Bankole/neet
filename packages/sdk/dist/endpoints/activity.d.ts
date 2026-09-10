import { NeetClient } from '../client.js';
import type { ActivityItem } from '../types.js';
/** Activity feed lookups. */
export declare class ActivityApi {
    private readonly client;
    constructor(client: NeetClient);
    /**
     * Fetch the combined activity feed (posts, endorsements received, and
     * reputation events), newest first.
     */
    getActivity(handle: string): Promise<ActivityItem[]>;
}
//# sourceMappingURL=activity.d.ts.map