import { NeetClient } from '../client.js'
import { toFullHandle } from '../utils/validation.js'
import type { ActivityItem, ActivityResponse } from '../types.js'

/** Activity feed lookups. */
export class ActivityApi {
  constructor(private readonly client: NeetClient) {}

  /**
   * Fetch the combined activity feed (posts, endorsements received, and
   * reputation events), newest first.
   */
  async getActivity(handle: string): Promise<ActivityItem[]> {
    const fullHandle = toFullHandle(handle)
    const response = await this.client.get<ActivityResponse>(
      `/api/activity/${encodeURIComponent(fullHandle)}`,
    )
    return response.activity
  }
}