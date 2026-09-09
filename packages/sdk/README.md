# @neet/sdk

TypeScript SDK for querying **.neet** identity and reputation on the Nimiq ecosystem.

Other Mini Apps can read any `.neet` profile, its deterministic reputation, and its
activity feed over the public read API — no wallet connection required.

## Install

```bash
npm install @neet/sdk
```

Requires a runtime with `fetch` (Node.js 18+, browsers, Nimiq Pay webview).

## Quick Start

```ts
import { NeetSDK } from '@neet/sdk'

const neet = new NeetSDK({
  baseUrl: 'https://neet.vercel.app',
  network: 'testnet',
})

// Profile + reputation + stats
const { identity, recentEndorsements } = await neet.getIdentity('james.neet')
console.log(identity.reputation)          // e.g. 68
console.log(identity.handle)          // 'james'
console.log(identity.profile?.bio)

// Reputation
const rep = await neet.getReputation('james.neet')
// { reputation: 68, breakdown: { CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15 }, events: [] }

const breakdown = await neet.getBreakdown('james.neet')
// { CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15, ... }

// Search
const results = await neet.search('alice')
console.log(results[0]?.fullHandle)       // 'alice.neet'

// Activity feed (posts, endorsements received, reputation events)
const activity = await neet.getActivity('james.neet')
```

## API

### `new NeetSDK(config)`

| Option     | Type                           | Default     | Description                                        |
|------------|--------------------------------|-------------|----------------------------------------------------|
| `baseUrl`  | `string`                       | —           | Base URL of a .neet deployment, e.g. `https://neet.vercel.app`. **Required.** |
| `network`  | `'mainnet' \| 'testnet' \| 'devnet'` | `'mainnet'` | Sent to the API as the `x-neet-network` header. |
| `timeoutMs`| `number`                       | `10_000`    | Default request timeout.                           |
| `headers`  | `HeadersInit`                  | —           | Extra headers merged onto every request.           |
| `fetch`    | `typeof fetch`                 | global      | Custom fetch implementation (tests, node runtimes).|

### Methods

| Method                | Returns                            | Endpoint                     |
|-----------------------|------------------------------------|------------------------------|
| `getIdentity(handle)` | `IdentityResponse`                 | `GET /api/identity/:handle`  |
| `search(query, opts?)`| `SearchResult[]`                   | `GET /api/search?q=`         |
| `getReputation(handle)` | `ReputationResponse`             | `GET /api/reputation/:handle`|
| `getBreakdown(handle)`| `ReputationBreakdown`              | `GET /api/reputation/:handle`|
| `getActivity(handle)` | `ActivityItem[]`                   | `GET /api/activity/:handle`  |

Handles are normalized and validated before any request is sent: `" james.NEET "`
becomes `james.neet`, and anything shorter than 3 characters or containing invalid
characters is rejected with a `NeetSDKError` (`code: 'VALIDATION'`).

## Types

All response types are exported from the package root with **zero `any`**:

- `Identity`, `IdentityResponse`, `RecentEndorsement`
- `Reputation`, `ReputationResponse`, `ReputationBreakdown`, `EventType`
- `ActivityItem` (discriminated union: `POST` \| `ENDORSEMENT_RECEIVED` \| `REPUTATION_EVENT`)
- `SearchResult`
- `Profile`, `IdentityStats`, `Badge`, `Network`

## Errors

Every failure throws a `NeetSDKError`:

```ts
import { NeetSDKError, isNeetSDKError } from '@neet/sdk'

try {
  await neet.getIdentity('missing-user')
} catch (error) {
  if (isNeetSDKError(error)) {
    console.log(error.code)         // 'NOT_FOUND'
    console.log(error.status)       // 404
    console.log(error.retryable)    // false
    console.log(error.message)      // 'Identity not found'
  }
}
```

| Code          | Meaning                                            |
|---------------|----------------------------------------------------|
| `VALIDATION`  | Invalid input (bad handle, bad `baseUrl`, short query) |
| `NOT_FOUND`   | HTTP 404 response                                   |
| `HTTP`        | Other non-2xx response                              |
| `PARSE`       | Response body was not valid JSON                    |
| `TIMEOUT`     | Request exceeded the timeout or was aborted         |
| `NETWORK`     | Fetch failed / connection error                     |

## Handle Rules

- 3–20 characters
- Lowercase letters, digits, `_`, `-` only
- One handle per wallet, claimable via the Mini App

## Address Validation

`.neet` uses Nimiq's account-based model (`NQ...` base32 addresses), unlike
Ethereum's `0x...`. Helpers are exported:

```ts
import { isValidNimiqAddress, isValidEthereumAddress } from '@neet/sdk'

isValidNimiqAddress('NQ07 0000 0000 0000 0000 0000 0000 0000 0000') // true
isValidEthereumAddress('0x...')                                    // true
```

## Development

```bash
npm install        # installs TypeScript (dev only)
npm run typecheck
npm run build      # emits dist/
```

## License

MIT