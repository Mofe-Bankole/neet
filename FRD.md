> **Historical baseline document — superseded.** Retained for repository history. Follow [docs/02-FRD.md](docs/02-FRD.md) and [README.md](README.md) for the current contribution-payment MVP. Legacy reputation-score and SDK plans below are not active requirements.

# Functional Requirements Document (FRD)
## .neet — Portable Identity & Reputation Layer for Nimiq

---

## 1. System Overview

### 1.1 Purpose
Define detailed functional requirements for the .neet Mini App, covering all user-facing features, API contracts, data flows, and integration points with Nimiq Pay.

### 1.2 Scope
- Mini App running inside Nimiq Pay
- Identity registry + reputation engine
- NIM payment integration (tips + endorsements)
- Public profile pages with SEO metadata

### 1.3 Assumptions
- Nimiq Pay injects `window.nimiq` provider
- User has Nimiq wallet with testnet/mainnet NIM
- PostgreSQL database accessible via Prisma
- Deployed to HTTPS (Vercel) for Nimiq Pay registration

---

## 2. Functional Requirements

### FR-1: Wallet Connection & Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Detect `window.nimiq` availability on load | P0 |
| FR-1.2 | Show "Open in Nimiq Pay" if provider not available | P0 |
| FR-1.3 | Connect wallet via `nimiq.connect()` → returns `{address, network}` | P0 |
| FR-1.4 | Auto-detect existing connection via `nimiq.getAccount()` | P0 |
| FR-1.5 | Listen for account changes via `nimiq.onAccountChange()` | P0 |
| FR-1.6 | Display network badge (TESTNET/MAINNET/DEVNET) | P1 |
| FR-1.7 | Format address as `NQ12...3456` | P1 |

**Acceptance Criteria:**
- App shows connect button when no wallet connected
- Wallet address displayed after connection
- Switching accounts in Nimiq Pay updates UI automatically
- Works on testnet and mainnet

---

### FR-2: Identity Claim

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Search input: lowercase, alphanumeric, underscore, hyphen only | P0 |
| FR-2.2 | Minimum 3 chars, maximum 20 chars | P0 |
| FR-2.3 | Real-time availability check (debounced 300ms) | P0 |
| FR-2.4 | Show "✓ Available" / "Already taken" badge | P0 |
| FR-2.5 | Claim button calls `POST /api/identity/claim` with `{handle, nimiqAddress}` | P0 |
| FR-2.6 | Enforce one identity per wallet (server-side) | P0 |
| FR-2.7 | Enforce unique handle (server-side) | P0 |
| FR-2.8 | On success: create Identity + User + ReputationEvent(CLAIM_IDENTITY, +10) | P0 |
| FR-2.9 | Redirect to profile view after claim | P0 |
| FR-2.10 | Show success toast "Identity claimed successfully!" | P1 |

**API Contract:**
```
POST /api/identity/claim
Body: { handle: string, nimiqAddress: string }
Response: { identity: { id, handle, fullHandle, createdAt } }
Errors: 400 (validation), 409 (taken/wallet has identity), 500
```

---

### FR-3: Public Profile Page (`/:handle`)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | SSR page with `generateMetadata` for SEO/OG | P0 |
| FR-3.2 | Display: handle, fullHandle, displayName, bio, avatar | P0 |
| FR-3.3 | Show "Verified Wallet" badge | P0 |
| FR-3.4 | Display reputation score (calculated from events) | P0 |
| FR-3.5 | Stats grid: Reputation, Posts, NIM Received | P0 |
| FR-3.6 | Badges: Verified Wallet, Early Builder (>50), Contributor (>0 posts), Supporter (>0 sent) | P1 |
| FR-3.7 | Posts list (latest 10) with timestamps | P0 |
| FR-3.8 | Endorsements received (latest 10) with sender, amount, date | P0 |
| FR-3.9 | Reputation breakdown by event type | P1 |
| FR-3.10 | Tip + Endorse buttons (only for other profiles, wallet connected) | P0 |

**SEO Metadata:**
- Title: `{handle}.neet — .neet`
- Description: bio or "View {handle}'s profile on .neet"
- OG: type=profile, title=handle, description=bio

---

### FR-4: Profile Management (Own Profile)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Edit displayName, bio, avatarUrl via `PUT /api/profile` | P0 |
| FR-4.2 | On first profile save: ReputationEvent(COMPLETE_PROFILE, +5) | P0 |
| FR-4.3 | Avatar: text initial fallback (gold gradient bg) | P1 |
| FR-4.4 | Create post via `POST /api/posts` | P0 |
| FR-4.5 | On first post: ReputationEvent(FIRST_POST, +5) | P0 |
| FR-4.6 | Posts feed on own profile with timestamps | P0 |
| FR-4.7 | Activity feed: posts + endorsements received | P0 |
| FR-4.8 | Share profile button (Web Share API + copy fallback) | P1 |

---

### FR-5: NIM Payments (Tip & Endorse)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Tip: user enters amount (0.01-100 NIM) | P0 |
| FR-5.2 | Endorse: fixed 0.1 NIM | P0 |
| FR-5.3 | Call `nimiq.sendTransaction({toAddress, amountNim, memo})` | P0 |
| FR-5.4 | Handle payment states: loading, success, rejected, cancelled, error | P0 |
| FR-5.5 | On success: show toast with transaction hash | P0 |
| FR-5.6 | On error: show toast with error message | P0 |
| FR-5.7 | On cancel: dismiss silently | P0 |
| FR-5.8 | After successful endorsement: POST `/api/endorsements` with `{fromWalletAddress, toIdentityId, amountNim, transactionHash}` | P0 |
| FR-5.9 | Backend resolves sender identity from wallet address | P0 |
| FR-5.10 | Create Endorsement + 2 ReputationEvents (sender +2, receiver +3) | P0 |
| FR-5.11 | Auto-refresh profile data after payment | P1 |

**Payment Flow:**
```
User clicks Endorse (0.1 NIM)
  → nimiq.sendTransaction() → Nimiq Pay confirmation UI
  → User approves → Returns {success: true, transactionHash}
  → POST /api/endorsements with transactionHash
  → Backend creates Endorsement + ReputationEvents
  → Toast: "Endorsed alice.neet with 0.1 NIM!"
  → Auto-refresh after 2s
```

---

### FR-6: Reputation System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Reputation = SUM(ReputationEvent.points) per identity | P0 |
| FR-6.2 | Event types and points per spec (Section 4.4) | P0 |
| FR-6.3 | Display total reputation prominently | P0 |
| FR-6.4 | Breakdown by event type on profile | P1 |
| FR-6.5 | Reputation updates in real-time after payments | P0 |
| FR-6.6 | API returns reputation + breakdown | P0 |

---

### FR-7: Search & Discovery

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Search by handle prefix (min 2 chars) | P0 |
| FR-7.2 | Debounced 300ms | P0 |
| FR-7.3 | Results show: handle, displayName, reputation, avatar | P0 |
| FR-7.4 | Click result → pre-fill claim input | P0 |
| FR-7.5 | API: `GET /api/search?q={query}` | P0 |

---

### FR-8: Activity Feed

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8.1 | Combined feed: posts + endorsements received | P0 |
| FR-8.2 | Sorted by date descending | P0 |
| FR-8.3 | Post cards: content + timestamp | P0 |
| FR-8.4 | Endorsement cards: sender handle, amount, date | P0 |
| FR-8.5 | Empty state: "No activity yet" | P1 |

---

### FR-9: Nimiq Pay Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-9.1 | App loads inside Nimiq Pay iframe/webview | P0 |
| FR-9.2 | Uses `window.nimiq` for all wallet operations | P0 |
| FR-9.3 | No external wallet connect libraries | P0 |
| FR-9.4 | Payment confirmation handled by Nimiq Pay UI | P0 |
| FR-9.5 | Message signing available via `nimiq.signMessage()` | P1 |

---

### FR-10: UI/UX Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | White/gold design system (Nimiq L2 brand) | P0 |
| FR-10.2 | Poppins font only (no Geist Sans in UI) | P0 |
| FR-10.3 | Geist Mono only for addresses/code | P0 |
| FR-10.4 | Hero: 3 animated gold orbs (2 left, 1 right) | P0 |
| FR-10.5 | Glassmorphism cards with hover lift | P0 |
| FR-10.6 | Loading skeletons for all async data | P1 |
| FR-10.7 | Error toasts for all failure states | P0 |
| FR-10.8 | Success toasts for payments/claims | P0 |
| FR-10.9 | Mobile responsive (375px+) | P0 |
| FR-10.10 | Reduced motion support | P1 |
| FR-10.11 | Light mode only | P0 |

---

### FR-11: Deployment & Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11.1 | Deploy to Vercel with HTTPS | P0 |
| FR-11.2 | Environment variables: DATABASE_URL, NIMIQ_NETWORK | P0 |
| FR-11.3 | Prisma migrations run on deploy | P0 |
| FR-11.4 | Register Mini App URL in Nimiq Pay | P0 |
| FR-11.5 | Health check endpoint | P1 |

---

## 3. Non-Functional Requirements

### NFR-1: Performance
- Page load < 2s on 3G
- API responses < 500ms (p95)
- Bundle size < 200KB gzipped

### NFR-2: Security
- No private keys stored
- All payments via Nimiq Pay (user confirms)
- SQL injection prevented via Prisma
- XSS prevented via React auto-escaping

### NFR-3: Reliability
- Graceful degradation when Nimiq Pay unavailable
- Payment idempotency via transactionHash
- Database transactions for reputation updates

### NFR-4: Accessibility
- Semantic HTML
- Focus indicators
- Color contrast (WCAG AA)
- ARIA labels on interactive elements

---

## 4. Data Dictionary

### 4.1 Identity
| Field | Type | Constraints |
|-------|------|-------------|
| id | CUID | PK |
| userId | CUID | FK → User, Unique |
| handle | String | Unique, 3-20 chars, a-z0-9_- |
| fullHandle | String | Unique, `{handle}.neet` |
| createdAt | DateTime | Default now() |

### 4.2 ReputationEvent
| Field | Type | Constraints |
|-------|------|-------------|
| id | CUID | PK |
| identityId | CUID | FK → Identity |
| userId | CUID | FK → User |
| actorIdentityId | CUID? | FK → Identity (optional) |
| type | String | Enum: CLAIM_IDENTITY, COMPLETE_PROFILE, FIRST_POST, RECEIVE_TIP, SEND_TIP, RECEIVE_ENDORSEMENT, SEND_ENDORSEMENT, DAILY_RETURN |
| points | Int | Per spec |
| transactionHash | String? | For payment events |
| createdAt | DateTime | Default now() |

### 4.3 Endorsement
| Field | Type | Constraints |
|-------|------|-------------|
| id | CUID | PK |
| fromIdentityId | CUID | FK → Identity |
| toIdentityId | CUID | FK → Identity |
| fromUserId | CUID | FK → User |
| toUserId | CUID | FK → User |
| amountNim | Float | > 0 |
| transactionHash | String | Unique per endorsement |
| createdAt | DateTime | Default now() |

---

## 5. Error Handling Matrix

| Scenario | User Message | Logging |
|----------|--------------|---------|
| Handle taken | "This handle is already taken" | Info |
| Wallet has identity | "This wallet already has a .neet identity" | Info |
| Payment rejected | "Payment was rejected. Please try again." | Warn |
| Payment cancelled | (silent dismiss) | Info |
| Network error | "Connection failed. Check your internet." | Error |
| Server error | "Something went wrong. Please try again." | Error |
| Invalid handle | "Handle must be 3-20 characters, letters/numbers/_- only" | Info |

---

## 6. Testing Checklist

### Unit Tests (Target: API routes)
- [ ] POST /api/identity/claim — validation, uniqueness, reputation event
- [ ] GET /api/identity/:handle — reputation calculation, stats
- [ ] POST /api/endorsements — duplicate prevention, reputation events
- [ ] GET /api/search — filtering, limit

### Integration Tests (Manual)
- [ ] Wallet connect → claim → profile → post → endorse → reputation updates
- [ ] Tip flow with various amounts
- [ ] Payment rejected/cancelled handling
- [ ] Account switch in Nimiq Pay updates UI
- [ ] Mobile viewport (375px, 414px)
- [ ] SSR profile page metadata

### E2E (Competition Demo)
- [ ] Full demo script runs without errors
- [ ] 25+ unique wallets can claim
- [ ] Performance acceptable

---

## 7. API Reference Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/identity/claim | Wallet | Claim handle |
| GET | /api/identity/:handle | Public | Profile data |
| PUT | /api/profile | Wallet | Update profile |
| POST | /api/posts | Wallet | Create post |
| GET | /api/posts/:handle | Public | List posts |
| POST | /api/endorsements | Wallet | Record endorsement |
| GET | /api/endorsements | Public | List endorsements |
| GET | /api/reputation/:handle | Public | Reputation breakdown |
| GET | /api/activity/:handle | Public | Activity feed |
| GET | /api/search?q= | Public | Search identities |

---

*Last updated: September 2026 | Version 1.0*