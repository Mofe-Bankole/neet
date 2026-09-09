import { NeetClient } from '../client.js'
import { toFullHandle } from '../utils/validation.js'
import type { ReputationBreakdown, ReputationResponse } from '../types.js'

/** Reputation lookups. */
export class ReputationApi {
  constructor(private readonly client: NeetClient) {}

  /**
   * Fetch total reputation, the breakdown by event type, and the raw events.
   */
  async getReputation(handle: string): Promise<ReputationResponse> {
    const fullHandle = toFullHandle(handle)
    return this.client.get<ReputationResponse>(
      `/api/reputation/${encodeURIComponent(fullHandle)}`,
    )
  }

  /**
   * Fetch only the reputation breakdown, e.g.
   * `{ CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15 }`.
   */
  async getBreakdown(handle: string): Promise<ReputationBreakdown> {
    const response = await this.getReputation(handle)
    return response.breakdown
  }
}