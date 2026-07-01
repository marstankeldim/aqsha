<div align="center">

# 💸 Aqsha — Personal Finance Platform

**Your money, beautifully understood.**

A production-grade personal finance platform — net worth, accounts, transactions, budgets, goals, analytics, and automated recurring bills across multiple currencies. Built like a real SaaS product (Monarch / Copilot / YNAB), not a tutorial app.

*Aqsha (ақша) is Kazakh for "money."*

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF)

</div>

---

## Overview

Aqsha unifies a user's entire financial life — checking, savings, credit cards, cash, and investment accounts — into a single premium dashboard. It handles money with correct decimal precision and multi-currency conversion, posts income/expense/transfer transactions with automatic balance updates, and layers on budgets, savings goals, spending analytics, and automated recurring transactions. Every user's data is isolated behind authentication, and the UI is fully responsive with light/dark themes.

---

## Features

- **🔐 Authentication** — Clerk-based sign-up/sign-in, middleware-protected routes, automatic Clerk→database user provisioning.
- **📊 Dashboard** — Net worth, cash, monthly income/expenses, an interactive **spending-by-category donut**, a **6-month income-vs-expense chart**, budget-progress, goals, and recent-activity widgets — all from live data.
- **🏦 Accounts** — Six types (checking, savings, credit card, cash, investment, loan), each with its own currency and running balance, plus a net-worth / assets / liabilities summary.
- **💳 Transactions** — Income, expense, and transfers with **atomic balance updates**; single-row transfers with **cross-currency FX**; tags; full search, filter, sort, and pagination; edit/delete with correct balance reversal.
- **🏷️ Categories** — Full CRUD with one-level subcategories, per-user default seeding, emoji + color pickers.
- **🎯 Budgets** — Monthly limits per category or overall, with **subcategory roll-up**, multi-currency spend conversion, progress bars and overspend warnings, and month-to-month navigation.
- **🐖 Goals** — Savings goals (emergency fund, vacation, house…) tracked via contributions, with **auto-completion**, SVG progress rings, and target-date countdowns.
- **🔁 Recurring** — A recurrence engine (daily → yearly, custom intervals) that **posts real transactions on schedule** with **idempotent catch-up**, manual "post now," pause/resume, and a **secured cron endpoint** for hands-off automation.
- **🌍 Multi-currency** — 12 currencies with an exchange-rate table; balances and budgets convert to the user's primary currency; localized formatting.
- **🌗 Polish** — Dark mode, responsive layout, toasts, optimistic-feeling TanStack Query caching, accessible shadcn/ui components.

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| **Framework** | Next.js 15 (App Router, React Server Components), React 19, TypeScript (strict) |
| **UI** | Tailwind CSS, shadcn/ui (hand-authored), Recharts 3, Lucide, `next-themes` |
| **Server state** | TanStack Query |
| **Backend** | Next.js Route Handlers, layered service/repository architecture |
| **Database** | PostgreSQL (Neon) + Prisma ORM — 16-model normalized schema |
| **Auth** | Clerk |
| **Validation / forms** | Zod (shared client + server), React Hook Form |
| **Automation** | Vercel Cron |

---

## Architecture

A strictly layered, testable architecture with clear boundaries:

```
UI (RSC + client)  →  TanStack Query  →  Route Handlers
   →  Zod validation  →  Services (business logic)
   →  Repositories  →  Prisma  →  PostgreSQL
```

**Rules that hold throughout the codebase:**

- Route handlers and Server Components **never** touch Prisma directly — they call domain **services**, which call **repositories**.
- Every user-owned query is scoped by `userId` (tenant isolation; IDOR-safe).
- Money is stored as `Decimal` (never a JS float); amounts are positive magnitudes whose effect on a balance is derived from transaction type.
- Every mutation that moves money runs inside a database transaction.

```
src/
├─ app/
│  ├─ (marketing)/        landing page
│  ├─ (auth)/             Clerk sign-in / sign-up
│  ├─ (dashboard)/        dashboard, accounts, transactions, categories,
│  │                      budgets, goals, recurring, settings
│  └─ api/                route handlers (+ /api/cron/recurring)
├─ server/<domain>/       {repo,service}.ts  ← business + data layer
├─ components/            ui · charts · dashboard · <feature> · shared
├─ hooks/                 TanStack Query hooks
├─ lib/                   prisma · auth · money · currency · date · fx · recurrence
├─ validations/           Zod schemas (shared client + server)
├─ types/                 serializers + DTOs
└─ config/                currencies · categories · accounts · goals · …
prisma/                   schema.prisma · migrations · seed.ts
```

### Data model (16 Prisma models)

`User`, `Currency`, `ExchangeRate`, `Account`, `Category` (self-referencing tree), `Transaction`, `Tag`, `TransactionTag`, `Budget`, `Goal`, `GoalContribution`, `RecurringTransaction`, `Holding`, `NetWorthSnapshot`, `Notification`, `Attachment`.

---

## Getting started

### Prerequisites

- Node.js 18+
- A **Neon** (or any PostgreSQL) database — [neon.tech](https://neon.tech)
- A **Clerk** application — [clerk.com](https://clerk.com)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the template and fill in your values:

```bash
cp .env.example .env
```

```dotenv
# Database (Neon) — pooled URL for the app, direct URL for migrations
DATABASE_URL="postgresql://…-pooler.…/neondb?sslmode=require"
DIRECT_URL="postgresql://….…/neondb?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_…"
CLERK_SECRET_KEY="sk_…"

# Optional — enables the recurring-transactions cron (see Deployment)
CRON_SECRET="a-long-random-string"
```

### 3. Set up the database

```bash
npm run db:migrate   # apply migrations
npm run db:seed      # seed currencies + exchange rates
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:migrate` | Apply a dev migration |
| `npm run db:seed` | Seed reference data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

---

## Recurring transactions & automation

Recurring templates (rent, salary, subscriptions) post **real transactions** on their schedule, reusing the same logic that keeps account balances correct. Posting is **idempotent** — deduplicated by `(recurringId, date)` — so catch-up runs, manual triggers, and the cron never double-post.

Three ways they post:

1. **On page visit** — opening `/recurring` catches up any due auto-posting templates.
2. **Manual** — "Run due" posts everything due now; "Post now" posts a single template's next occurrence.
3. **Scheduled (cron)** — `vercel.json` registers a daily job hitting `/api/cron/recurring`, secured by `CRON_SECRET` (Vercel Cron sends it as a `Bearer` token).

---

## Deployment (Vercel)

1. Push to GitHub and import the repo into Vercel.
2. Add the environment variables from `.env` (including `CRON_SECRET`).
3. Deploy. The cron in `vercel.json` runs automatically on Vercel's scheduler.

---

## Security

Aqsha is built defensively — it handles real financial data, so security is a first-class concern:

- **Authentication & tenant isolation** — every page and API route is gated by Clerk; every database query is scoped by `userId`, so one user can never read or mutate another's data (IDOR-safe). Service-layer ownership checks precede every update/delete.
- **Input validation** — all mutations and query params are validated with **Zod** on the server before touching the database; `data` objects are built field-by-field (no mass assignment).
- **SQL-injection-safe** — 100% of data access goes through Prisma's parameterized query API (no string-built SQL).
- **Money integrity** — decimal (never float) money, with balance-changing operations wrapped in database transactions.
- **Secrets** — `.env` is gitignored and never committed; no secret is exposed to the client (only `NEXT_PUBLIC_*` and the Clerk publishable key are public).
- **HTTP hardening** — security headers on every response: `Strict-Transport-Security`, `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and the framework banner disabled.
- **Cron** — the recurring-transactions cron authenticates with a `CRON_SECRET` compared in **constant time** (`timingSafeEqual`).
- **Dependency hygiene** — audited with `npm audit`; removed a heavy transitive dependency that pulled an entire crypto-wallet stack into the app, eliminating the majority of advisories. Remaining advisories are internal to Next.js with no exploit path in this app.

**Recommended before a public production launch:** add rate limiting on auth/mutation endpoints (e.g. Upstash Ratelimit) and a nonce-based Content-Security-Policy.

## Roadmap

- [x] Foundation, auth, app shell
- [x] Accounts · Transactions · Categories · Budgets
- [x] Dashboard analytics (charts)
- [x] Goals
- [x] Recurring transactions (+ cron automation)
- [ ] Investment portfolio (holdings, gain/loss, allocation)
- [ ] Reports (cash flow, net-worth history)
- [ ] CSV import / export
- [ ] Receipt uploads, notifications, household accounts

---

<div align="center">

Built as a portfolio-grade demonstration of full-stack engineering.

</div>
