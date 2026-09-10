# 🎯 Task Assignment: Reputation API Client SDK

Hey! I'm assigning you a **real, shippable piece** of the .neet project that you'll own end-to-end.

---

## 📦 What You're Building

**A TypeScript SDK** that other Mini Apps will use to query `.neet` reputation:

```typescript
// Target developer experience
import { NeetSDK } from '@neet/sdk'

const neet = new NeetSDK({ baseUrl: 'https://neet.vercel.app', network: 'testnet' })

const profile = await neet.getIdentity('james.neet')
// { handle, address, reputation: 68, badges: ['EARLY_BUILDER', 'VERIFIED_WALLET'] }

const rep = await neet.getReputation('james.neet')
// { total: 68, breakdown: { CLAIM_IDENTITY: 10, RECEIVE_ENDORSEMENT: 15, ... } }

const results = await neet.search('alice')
```

---

## 📁 File Structure to Create

```
packages/sdk/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # HTTP client + config
│   ├── types.ts              # All TypeScript interfaces
│   ├── endpoints/
│   │   ├── identity.ts       # getIdentity, search
│   │   ├── reputation.ts     # getReputation, getBreakdown
│   │   └── activity.ts       # getActivity
│   └── utils/
│       └── validation.ts     # Handle format validation
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🌿 Git Workflow (You'll Learn This)

```bash
# 1. Start fresh
git checkout main
git pull origin main

# 2. Create YOUR branch
git checkout -b feat/sdk-reputation-client

# 3. Work in small, logical commits
git add packages/sdk/src/types.ts
git commit -m "feat(sdk): add TypeScript types for Identity/Reputation"

git add packages/sdk/src/client.ts
git commit -m "feat(sdk): add HTTP client with fetch wrapper"

# 4. Push when ready for review
git push origin feat/sdk-reputation-client

# 5. Open PR → I review → I merge to main
```

**Branch naming:** `feat/`, `fix/`, `docs/`, `refactor/`

---

## ⛓️ Blockchain Concepts You'll Learn (Embedded)

| Concept | Where It Shows Up |
|---------|-------------------|
| **Account model vs UTXO** | Nimiq uses account-based — see `types.ts` address validation |
| **Transaction finality** | Endorsement verification needs `transactionHash` + confirmations |
| **Address formats** | Nimiq `NQ...` vs Ethereum `0x...` — validation in `utils/validation.ts` |
| **Fee markets** | Fixed 0.1 NIM endorsement = deliberate fee design |
| **Wallet provider pattern** | `window.nimiq` injection vs MetaMask `window.ethereum` |
| **Message signing** | `nimiq.signMessage()` for identity proof |
| **Testnet/Mainnet** | `NIMIQ_NETWORK` env var switching |

**Quick reads (15 min each):**
1. [Nimiq Whitepaper - Consensus](https://nimiq.com/whitepaper) (sections 2-3)
2. [UTXO vs Account Model](https://ethereum.org/en/developers/docs/accounts/)
3. [Nimiq Pay Provider API](https://github.com/nimiq/nimiq-pay)

---

## 🎓 My Role (Orchestrator)

| I Do | You Do |
|------|--------|
| Create `packages/sdk/` structure | Implement SDK code |
| Set up `package.json`, `tsconfig.json` | Write TypeScript types |
| Review PRs, suggest improvements | Small commits, push to branch |
| Merge to `main` after approval | Learn from review feedback |
| Publish to npm when ready | Tag release |

---

## 📅 Suggested Timeline

| Week | Deliverable |
|------|-------------|
| 1 | Repo setup, TypeScript types, HTTP client |
| 2 | Identity + Reputation endpoints |
| 3 | Search + Activity endpoints, validation |
| 4 | Tests, README, npm publish prep |

---

## ✅ First Steps for You

```bash
# 1. Clone the repo
git clone https://github.com/Mofe-Bankole/neet.git
cd neet

# 2. Create SDK package structure
mkdir -p packages/sdk/src/{endpoints,utils}
touch packages/sdk/{package.json,tsconfig.json}
touch packages/sdk/src/{index.ts,client.ts,types.ts}

# 3. Create your branch
git checkout -b feat/sdk-reputation-client

# 4. Start with types.ts (copy from FRD.md data models)
#    - Identity, ReputationEvent, Endorsement, Badge types
#    - API response types
```

---

## ✅ Success Criteria

- [ ] SDK installs via `npm i @neet/sdk`
- [ ] Full TypeScript types (zero `any`)
- [ ] All 5 API endpoints wrapped
- [ ] Handles testnet/mainnet via config
- [ ] Published to npm (I'll do the publish)
- [ ] Documented with usage examples

---

## 📚 Reference Docs in Repo

- `PRD.md` — Product vision, user flows, competition strategy
- `FRD.md` — **Functional requirements, API contracts, data models** (use for types)
- `README.md` — Architecture, deployment, roadmap

---

## 🚀 Ready?

1. Clone the repo
2. Run the first steps above
3. Ping me when you have the branch created and first commit pushed
4. I'll review your PRs within a few hours

**You own this SDK. Make it something you're proud to put on your GitHub.**

— Mofe (Orchestrator)