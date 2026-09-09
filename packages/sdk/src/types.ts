/**
 * Type definitions for the @neet/sdk package.
 *
 * These mirror the HTTP API contracts exposed by the .neet Mini App
 * (`GET /api/identity/:handle`, `GET /api/search`, `GET /api/reputation/:handle`,
 * `GET /api/activity/:handle`). See `FRD.md` for the source data dictionary.
 */

/** Supported Nimiq networks. */
export type Network = 'mainnet' | 'testnet' | 'devnet'

/**
 * Reputation event types awarded by the .neet scoring engine.
 *
 * The server stores event types as free-form strings, so consumers should treat
 * the union below as the known set and fall back to the string form for any
 * future event types.
 */
export type ReputationEventType =
  | 'CLAIM_IDENTITY'
  | 'COMPLETE_PROFILE'
  | 'FIRST_POST'
  | 'RECEIVE_TIP'
  | 'SEND_TIP'
  | 'RECEIVE_ENDORSEMENT'
  | 'SEND_ENDORSEMENT'
  | 'DAILY_RETURN'

/** Known event type, with a string fallback for forward compatibility. */
export type EventType = ReputationEventType | (string & {})

/** Badges shown on .neet profiles. */
export type Badge = 'VERIFIED_WALLET' | 'EARLY_BUILDER' | 'CONTRIBUTOR' | 'SUPPORTER'

/** A public .neet profile (display name, bio, avatar). */
export interface Profile {
  id: string
  identityId: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

/** Aggregated activity counters for an identity. */
export interface IdentityStats {
  posts: number
  endorsementsSent: number
  endorsementsReceived: number
  nimReceived: number
}

/** A claimed identity on the .neet registry. */
export interface Identity {
  id: string
  handle: string
  fullHandle: string
  createdAt: string
  profile: Profile | null
  reputation: number
  stats: IdentityStats
}

/** A recent endorsement received by an identity. */
export interface RecentEndorsement {
  from: string
  amount: number
  transactionHash: string
  createdAt: string
}

/** Response payload of `GET /api/identity/:handle`. */
export interface IdentityResponse {
  identity: Identity
  recentEndorsements: RecentEndorsement[]
}

/** A single reputation event as returned by `/api/reputation/:handle`. */
export interface ReputationEvent {
  type: EventType
  points: number
  transactionHash: string | null
  createdAt: string
}

/** Reputation points grouped by event type. */
export interface ReputationBreakdown {
  [type: string]: number
}

/** Response payload of `GET /api/reputation/:handle`. */
export interface ReputationResponse {
  reputation: number
  breakdown: ReputationBreakdown
  events: ReputationEvent[]
}

/** Activity item for a published post. */
export interface PostActivity {
  type: 'POST'
  content: string
  createdAt: string
}

/** Activity item for an endorsement received. */
export interface EndorsementActivity {
  type: 'ENDORSEMENT_RECEIVED'
  from: string
  amount: number
  transactionHash: string
  createdAt: string
}

/** Activity item for a reputation event. */
export interface ReputationActivity {
  type: 'REPUTATION_EVENT'
  eventType: EventType
  points: number
  transactionHash: string | null
  createdAt: string
}

/** Discriminated union of all possible activity items. */
export type ActivityItem = PostActivity | EndorsementActivity | ReputationActivity

/** Response payload of `GET /api/activity/:handle`. */
export interface ActivityResponse {
  activity: ActivityItem[]
}

/** A single identity returned by `GET /api/search`. */
export interface SearchResult {
  handle: string
  fullHandle: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  reputation: number
  postsCount: number
  endorsementsCount: number
  createdAt: string
}

/** Options for `NeetSDK.search`. */
export interface SearchOptions {
  /** Maximum number of results (default 10, clamped to 1-50). */
  limit?: number
}

/** Response payload of `GET /api/search`. */
export interface SearchResponse {
  results: SearchResult[]
}

/** Error payload returned by all .neet API endpoints. */
export interface ErrorResponse {
  error: string
}