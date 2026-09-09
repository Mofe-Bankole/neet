import { NeetClient } from '../client.js'
import { NeetSDKError } from '../errors.js'
import { toFullHandle } from '../utils/validation.js'
import type { IdentityResponse, SearchOptions, SearchResponse, SearchResult } from '../types.js'

const SEARCH_LIMIT_MIN = 1
const SEARCH_LIMIT_MAX = 50
const SEARCH_LIMIT_DEFAULT = 10

/** Identity lookups and identity search. */
export class IdentityApi {
  constructor(private readonly client: NeetClient) {}

  /**
   * Fetch a profile by handle. Accepts `james` or `james.neet`.
   *
   * @returns The identity (profile, reputation, stats) plus recent endorsements.
   */
  async getIdentity(handle: string): Promise<IdentityResponse> {
    const fullHandle = toFullHandle(handle)
    return this.client.get<IdentityResponse>(
      `/api/identity/${encodeURIComponent(fullHandle)}`,
    )
  }

  /**
   * Search identities by bare handle or full handle prefix (min 2 characters).
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      throw new NeetSDKError('Search query must be at least 2 characters', {
        code: 'VALIDATION',
      })
    }

    const params = new URLSearchParams({
      q: trimmed,
      limit: String(clampSearchLimit(options.limit)),
    })

    const response = await this.client.get<SearchResponse>(`/api/search?${params.toString()}`)
    return response.results
  }
}

function clampSearchLimit(limit: number | undefined): number {
  if (limit === undefined || Number.isNaN(limit)) return SEARCH_LIMIT_DEFAULT
  return Math.min(SEARCH_LIMIT_MAX, Math.max(SEARCH_LIMIT_MIN, Math.floor(limit)))
}