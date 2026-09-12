> **Historical baseline document — superseded.** Retained for repository history. Follow [docs/01-PRD.md](docs/01-PRD.md) and [README.md](README.md) for the current contribution-payment MVP. Legacy reputation-score and SDK plans below are not active requirements.

# Product Requirements Document (PRD)
## .neet — Portable Identity & Reputation Layer for Nimiq

---

## 1. Executive Summary

**Product Name:** .neet  
**Tagline:** Your identity on Nimiq  
**Competition:** Nimiq Mini Apps Competition Cycle 2  
**Deadline:** September 18, 2026, 23:59 UTC  
**Build Window:** 6 days (started ~Sept 12, 2026)

### Vision
A human-readable identity and portable reputation layer for the Nimiq ecosystem. Every Nimiq wallet gets a memorable `.neet` handle (e.g., `james.neet`) that builds reputation through real wallet activity, NIM payments, and endorsements — not vanity metrics.

### Core Value Proposition
> **`.neet` gives Nimiq users a human-readable identity that turns real wallet activity, payments and endorsements into portable reputation.**

---

## 2. Problem Statement

- **Wallet addresses are not human:** `NQ57...8921` tells you nothing about the person
- **No portable reputation:** Contributions in one app don't carry to another
- **Social signals are shallow:** Likes/follows have no cost, no weight
- **Mini Apps are isolated:** No shared identity layer across the Nimiq Pay ecosystem

---

## 3. Target Users

| Primary | Secondary |
|---------|-----------|
| Nimiq builders & contributors | Nimiq Pay wallet holders |
| Mini App developers (future) | NIM holders wanting social signals |
| Community members | Ecosystem explorers |

---

## 4. Key Features (MVP Scope)

### 4.1 Identity Claim (Day 2)
- Search available handles in real-time
- Claim `.neet` name permanently bound to Nimiq wallet
- One identity per wallet (enforced)
- Instant feedback: available/taken

### 4.2 Public Profile (Day 3)
- Display name, bio, avatar
- Verified Wallet badge (auto)
- Reputation score (calculated from events)
- Stats: posts, endorsements sent/received, NIM received
- Recent activity feed (posts + endorsements received)

### 4.3 NIM-Powered Interactions (Day 4) — **Killer Feature**
| Action | Cost | Reputation Effect | Purpose |
|--------|------|-------------------|---------|
| **Tip** | Any NIM amount | Receiver +10 | Pure value transfer |
| **Endorse** | Fixed 0.1 NIM | Receiver +3, Sender +2 | Proof-of-support |

### 4.4 Deterministic Reputation System
| Action | Points | Trigger |
|--------|--------|---------|
| Claim identity | +10 | On claim |
| Complete profile | +5 | First profile save |
| First post | +5 | On publish |
| Receive tip | +10 | Per tip |
| Send tip | +5 | Per tip |
| Receive endorsement | +3 | Per endorsement |
| Send endorsement | +2 | Per endorsement |
| Daily return | +2 | Per day (future) |

**Formula:** `reputation = Σ(event.points)` — no hidden algorithm

### 4.5 Portable Reputation API
```
GET /api/identity/:handle
→ { handle, address, reputation, badges: ["EARLY_BUILDER", "VERIFIED_WALLET"] }
```
Future Mini Apps can query reputation without OAuth.

### 4.6 Badges (Auto-awarded)
- **Verified Wallet** — Always (claimed identity)
- **Early Builder** — Reputation > 50
- **Contributor** — Posts > 0
- **Supporter** — Endorsements sent > 0

---

## 5. User Flows

### Flow 1: First Visit (Outside Nimiq Pay)
```
Landing Page → "Open in Nimiq Pay" message
```

### Flow 2: First Visit (Inside Nimiq Pay)
```
Landing Page → "Try Now" → Nimiq Pay wallet connect → Claim handle → Profile → Done
```

### Flow 3: Returning User
```
App Page → Wallet auto-detected → Profile dashboard → Actions (post, tip, endorse)
```

### Flow 4: Social Interaction (Core Loop)
```
Discover profile (/alice.neet) → See reputation + activity → Tip/Endorse → Reputation updates → Share profile → New user joins
```

---

## 6. Design System

### Colors (Nimiq L2 Brand)
| Role | Value | Usage |
|------|-------|-------|
| Background | `#ffffff` | Page background |
| Foreground | `#1a1a1a` | Primary text |
| Primary | `#c9a900` | Gold - CTAs, accents |
| Primary Light | `#fef9e7` | Badge backgrounds |
| Muted | `#f5f5f0` | Section backgrounds |
| Border | `#e5e5dc` | Dividers, inputs |
| Card | `#ffffff` | Elevated surfaces |

### Typography
- **Sans:** Poppins (300-800) — all UI
- **Mono:** Geist Mono — wallet addresses, code snippets only

### Components (HeroUI v2)
- Button (primary, secondary, ghost, outline)
- Card (elevated with hover lift)
- Badge (soft, primary, outline variants)
- Avatar, Input, Toast

### Visual Style
- Light mode only (competition requirement)
- Glassmorphism: `backdrop-filter: blur(20-30px)`
- Card elevation: subtle shadow + hover lift (`translateY(-2px)`)
- Hero orbs: 3 animated gold gradients (2 left, 1 right)

---

## 7. Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, HeroUI v2 |
| Backend | Next.js Route Handlers (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Nimiq Pay injected provider (wallet-native) |
| Payments | `window.nimiq.sendTransaction()` |
| Deployment | Vercel |

### Data Models (Prisma)
```prisma
User { id, nimiqAddress, createdAt }
Identity { id, userId, handle, fullHandle, createdAt }
Profile { identityId, displayName, bio, avatarUrl }
Post { id, identityId, content, createdAt }
Endorsement { fromIdentityId, toIdentityId, amountNim, transactionHash }
ReputationEvent { identityId, userId, actorIdentityId, type, points, transactionHash }
```

### API Endpoints
```
POST /api/identity/claim        # Claim handle
GET  /api/identity/:handle      # Public profile data
PUT  /api/profile               # Update profile
POST /api/posts                 # Create post
GET  /api/posts/:handle         # List posts
POST /api/endorsements          # Record endorsement (after payment)
GET  /api/endorsements          # List endorsements
GET  /api/reputation/:handle    # Reputation breakdown
GET  /api/activity/:handle      # Activity feed
GET  /api/search?q=             # Search identities
```

---

## 8. Competition Scoring Strategy

| Category | Weight | Target | Strategy |
|----------|--------|--------|----------|
| Functionality | 45 pts | Max | One clear core loop, zero bugs |
| Nimiq Integration | 25 pts | Max | Wallet-native, NIM payments required, error handling |
| Real Usage | 15 pts | 25+ wallets | Recruit via Discord/Twitter, "claim before taken" |
| Design & UX | 10 pts | High | White/gold premium, 60-sec comprehension |
| Promotion | 5 pts | Max | Post in community + social |

---

## 9. Out of Scope (Explicitly Cut)
- DMs / chat
- Communities / groups
- Algorithmic feeds
- NFTs / token launch
- DAO / governance
- Smart contracts (Nimiq has none)
- Notifications
- Followers system (maybe post-MVP)
- Video / media uploads

---

## 10. Success Metrics (Competition)

| Metric | Target |
|--------|--------|
| Unique Nimiq wallets | 25+ |
| Identity claims | 25+ |
| Endorsements sent | 50+ |
| Profile completion rate | >60% |
| Demo video quality | Professional |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Nimiq Pay Mini App registration delayed | Medium | High | Deploy early, test with ngrok |
| Low user recruitment | Medium | High | Pre-seed 5 test profiles, aggressive sharing |
| Payment flow bugs | Medium | High | Test all states: success/cancel/error |
| Database not provisioned | Low | High | Use Supabase/Neon free tier |
| Design feels generic | Low | Medium | White/gold + custom orbs + Poppins |

---

## 12. Timeline (6-Day Sprint)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | Mini App + Nimiq Pay | Deployed, wallet connect works |
| 2 | Identity claim | Search, claim, profile page |
| 3 | Profiles + activity | Edit profile, posts, search |
| 4 | NIM + Reputation | Tip, Endorse, reputation calc |
| 5 | Polish + Users | Deploy, seed, recruit 25+ |
| 6 | Demo + Submit | Video, screenshots, community post |

---

## 13. Demo Script (2 min)

1. **Problem** (15s): Show NQ address → "Technically identity, not human"
2. **Reveal** (10s): Show `james.neet` → "Human-readable on Nimiq"
3. **Claim** (20s): Search `alice` → Available → Claim
4. **Profile** (15s): Show reputation, badges, verified wallet
5. **Endorse** (40s): Switch to `alice.neet` → Endorse 0.1 NIM → Approve in Nimiq Pay
6. **Payoff** (20s): Return to James → Rep 43→48 → "Reputation from actions, not database"

---

*Last updated: September 2026 | Version 1.0*