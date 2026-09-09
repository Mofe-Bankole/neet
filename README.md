# .neet

> **Your identity on Nimiq.** A portable identity and reputation layer for the Nimiq ecosystem.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![HeroUI](https://img.shields.io/badge/HeroUI-v2-FF6B35?logo=heroui)](https://heroui.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Overview

**.neet** is a Nimiq Mini App that gives every Nimiq wallet a human-readable identity (`james.neet`) and builds portable reputation through real wallet activity — NIM payments, tips, and endorsements — not vanity metrics.

Built for the **Nimiq Mini Apps Competition Cycle 2** (deadline: September 18, 2026).

### The Problem
- Wallet addresses (`NQ57...8921`) aren't human-readable
- No portable reputation across Mini Apps
- Social signals (likes/follows) have no cost or weight
- Identity is siloed per app

### The Solution
| Feature | Description |
|---------|-------------|
| **Human-readable identity** | Claim `yourname.neet` permanently bound to your Nimiq wallet |
| **Deterministic reputation** | Score from actions: claim (+10), post (+5), tip (+10), endorse (+3/+2) |
| **NIM-powered endorsements** | 0.1 NIM = proof-of-support (not a free like) |
| **Portable reputation API** | Other Mini Apps can query `GET /api/identity/:handle` |
| **Native Nimiq Pay integration** | No wallet connect modals — identity is already there |

---

## ✨ Features

### Core MVP (Competition Scope)
- 🔐 **Wallet-native auth** — Nimiq Pay injected provider, no passwords
- 🏷️ **Identity claim** — Search & claim `.neet` handle (one per wallet)
- 👤 **Public profiles** — Display name, bio, avatar, stats, badges
- 📝 **Posts & activity** — Publish updates, view combined feed
- 💰 **Tip** — Pure NIM transfer (+10 rep to receiver)
- 🤝 **Endorse** — 0.1 NIM fixed = proof-of-support (+3 receiver, +2 sender)
- 📊 **Deterministic reputation** — Transparent scoring, no black box
- 🏷️ **Badges** — Verified Wallet, Early Builder, Contributor, Supporter
- 🔍 **Search & discovery** — Find other `.neet` identities
- 🔗 **Portable API** — `GET /api/identity/:handle` for ecosystem integration

### Design & UX
- 🎨 **White/Gold design system** (Nimiq L2 brand colors)
- 🔤 **Poppins-only typography** (Geist Mono for addresses only)
- ✨ **Glassmorphism cards** with hover lift animations
- 🌊 **Hero orbs** — 3 animated gold gradients (2 left, 1 right)
- ♿ **Accessible** — HeroUI v2 (React Aria), semantic HTML, reduced motion support

---

## 🏗 Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     Nimiq Pay App                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   .neet Mini App                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────────┐   │   │
│  │  │ Frontend│  │  API    │  │  Nimiq Pay       │   │   │
│  │  │(Next.js)│◄─►│ Routes  │◄─►│  Provider        │   │   │
│  │  └────┬────┘  └────┬────┘  └────────┬─────────┘   │   │
│  │       │            │                 │             │   │
│  │       ▼            ▼                 ▼             │   │
│  │  ┌──────────────────────────────────────────┐     │   │
│  │  │           Prisma ORM                     │     │   │
│  │  │  User │ Identity │ Profile │ Post       │     │   │
│  │  │  Endorsement │ ReputationEvent          │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  │                    │                              │   │
│  │                    ▼                              │   │
│  │  ┌──────────────────────────────────────────┐     │   │
│  │  │         PostgreSQL (Neon)                │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.3 |
| **Language** | TypeScript | 5.x |
| **Runtime** | React | 19 |
| **Styling** | Tailwind CSS | 4.x |
| **UI Library** | HeroUI (v2) | Latest |
| **Database** | PostgreSQL (Neon) | 16 |
| **ORM** | Prisma | 5.x |
| **Auth/Payments** | Nimiq Pay Provider | Injected |
| **Deployment** | Vercel | — |

### Data Model

```mermaid
erDiagram
    USER ||--o| IDENTITY : has
    USER ||--o{ ENDORSEMENT : sends
    USER ||--o{ ENDORSEMENT : receives
    USER ||--o{ REPUTATION_EVENT : generates
    IDENTITY ||--o| PROFILE : has
    IDENTITY ||--o{ POST : publishes
    IDENTITY ||--o{ ENDORSEMENT : sends
    IDENTITY ||--o{ ENDORSEMENT : receives
    IDENTITY ||--o{ REPUTATION_EVENT : accumulates
    
    USER {
        string id PK
        string nimiqAddress UK
        datetime createdAt
    }
    IDENTITY {
        string id PK
        string userId FK
        string handle UK
        string fullHandle UK
        datetime createdAt
    }
    PROFILE {
        string id PK
        string identityId FK
        string displayName
        string bio
        string avatarUrl
    }
    POST {
        string id PK
        string identityId FK
        string content
        datetime createdAt
    }
    ENDORSEMENT {
        string id PK
        string fromIdentityId FK
        string toIdentityId FK
        string fromUserId FK
        string toUserId FK
        float amountNim
        string transactionHash
        datetime createdAt
    }
    REPUTATION_EVENT {
        string id PK
        string identityId FK
        string userId FK
        string actorIdentityId FK
        string type
        int points
        string transactionHash
        datetime createdAt
    }
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)
- Nimiq Pay app for testing

### Installation

```bash
# Clone repository
git clone https://github.com/Mofe-Bankole/namiq.git
cd neet

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NIMIQ_NETWORK

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see "Open in Nimiq Pay" message (expected outside Nimiq Pay).

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NIMIQ_NETWORK="testnet"  # or "mainnet"

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create project → copy connection string
3. Use **pooled connection** for serverless:
   ```
   postgresql://user:pass@ep-xxx.neon.tech/neet?sslmode=require
   ```
3. Run migrations:
   ```bash
   pnpm prisma migrate dev
   ```

---

## 📁 Project Structure

```
neet/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── activity/
│   │   │   ├── endorsements/
│   │   │   ├── identity/
│   │   │   ├── posts/
│   │   │   ├── profile/
│   │   │   ├── reputation/
│   │   │   └── search/
│   │   ├── [handle]/          # Public profile pages (SSR)
│   │   ├── app/               # Mini App main page
│   │   ├── layout.tsx         # Root layout + HeroUI provider
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Design system
│   ├── components/
│   │   ├── landing/           # Landing page sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LandingPage.tsx
│   │   └── ui/                # HeroUI wrapper components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       └── Avatar.tsx
│   ├── hooks/
│   │   ├── useNimiqWallet.ts  # Nimiq Pay integration
│   │   └── useIdentity.ts     # Data fetching hooks
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton
│   │   └── nimiq.ts           # Nimiq Pay utilities
│   └── hooks/                 # Custom React hooks
├── .env.example               # Environment template
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── PRD.md                     # Product Requirements
├── FRD.md                     # Functional Requirements
└── README.md
```

---

## 🔌 API Reference

### Identity
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/identity/claim` | Claim `.neet` handle |
| `GET` | `/api/identity/:handle` | Get profile data |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/profile` | Update profile |
| `GET` | `/api/profile?handle=` | Get profile |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/posts` | Create post |
| `GET` | `/api/posts?handle=` | List posts |

### Endorsements
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/endorsements` | Record endorsement |
| `GET` | `/api/endorsements?handle=` | List endorsements |

### Reputation & Activity
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reputation/:handle` | Reputation breakdown |
| `GET` | `/api/activity/:handle` | Activity feed |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=` | Search identities |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel
# - Connect GitHub repo
# - Add environment variables:
#   DATABASE_URL, NIMIQ_NETWORK
# - Deploy
```

### Database (Neon)
1. Create project at [neon.tech](https://neon.tech)
2. Copy pooled connection string
3. Add as `DATABASE_URL` in Vercel
4. Run migrations after first deploy:
   ```bash
   pnpm prisma migrate deploy
   ```

### Nimiq Pay Registration
1. Get Vercel deployment URL (e.g., `https://neet.vercel.app`)
2. Register in Nimiq Pay Mini Apps dashboard
3. Or use "Custom Mini App" with your URL

### Environment Variables for Production
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neet?sslmode=require"
NIMIQ_NETWORK="mainnet"  # or "testnet" for testing
```

---

## 🗺 Roadmap

### Phase 1: Competition MVP (Current - Days 1-6)
- [x] Day 1: Mini App skeleton + Nimiq Pay integration
- [x] Day 2: Identity claim flow
- [x] Day 3: Profiles + posts + search
- [x] Day 4: NIM tips + endorsements + reputation
- [ ] Day 5: Polish + recruit 25+ users
- [ ] Day 6: Demo + submission

### Phase 2: Post-Competition
- [ ] Daily return reputation (+2/day)
- [ ] Follow system
- [ ] Profile sharing (Web Share API + QR)
- [ ] Avatar upload (Supabase Storage)
- [ ] Notification system
- [ ] Multi-language support

### Phase 3: Ecosystem Integration
- [ ] Reputation SDK for other Mini Apps
- [ ] Webhooks for endorsement events
- [ ] Batch reputation queries
- [ ] Governance integration (DAO voting weight)

### Phase 3: Advanced
- [ ] Cross-chain identity (EVM, Solana)
- [ ] Verifiable credentials
- [ ] Reputation marketplace
- [ ] Mobile app (React Native)

---

## 📚 References

### Documentation
- [PRD.md](PRD.md) — Product Requirements Document
- [FRD.md](FRD.md) — Functional Requirements Document
- [Nimiq Mini Apps Competition](https://nimiq.com/mini-apps)
- [Nimiq Pay Documentation](https://pay.nimiq.com/docs)

### Technical Resources
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [HeroUI v2 Components](https://heroui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Nimiq Pay Provider API](https://github.com/nimiq/nimiq-pay)

### Design & Brand
- [Nimiq Brand Guidelines](https://nimiq.com/brand)
- [Poppins Font](https://fonts.google.com/specimen/Poppins)

---

## 🤝 Contributing

This project was built for the Nimiq Mini Apps Competition Cycle 2. Contributions welcome for post-competition phases.

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
# ... code ...

# Run checks
pnpm lint
pnpm typecheck
pnpm build

# Commit with conventional messages
git commit -m "feat: add amazing feature"

# Push and open PR
git push origin feature/amazing-feature
```

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-first architecture

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Nimiq Team** — For the Mini Apps platform and competition
- **HeroUI** — Beautiful, accessible components
- **Neon** — Serverless PostgreSQL
- **Vercel** — Seamless deployment
- **Poppins** — Google Fonts

---

## 📞 Contact

- **GitHub:** [@Mofe-Bankole](https://github.com/Mofe-Bankole)
- **Project:** [github.com/Mofe-Bankole/namiq](https://github.com/Mofe-Bankole/namiq)
- **Competition:** Nimiq Mini Apps Cycle 2

---

*Built with ❤️ for the Nimiq ecosystem*