# Aqsha — Personal Finance Platform

> Aqsha (ақша — Kazakh for *money*) is a premium personal finance platform:
> net worth, accounts, transactions, budgets, goals, investments, and reports
> across multiple currencies.

A production-grade, full-stack application built with the Next.js App Router, a
layered service architecture, and a normalized PostgreSQL schema.

## Tech stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | Next.js 15 (App Router, RSC) · React 19 · TypeScript |
| Styling/UI   | Tailwind CSS · shadcn/ui · Recharts · Lucide        |
| State        | TanStack Query (server) · Zustand (UI)              |
| Auth         | Clerk                                               |
| Database     | PostgreSQL (Neon) · Prisma ORM                      |
| Validation   | Zod · React Hook Form                               |
| Deployment   | Vercel                                              |

## Architecture

```
UI (RSC + client) → State (TanStack Query / Zustand)
   → API (route handlers / server actions)
   → Validation (Zod)  → Services (business logic)
   → Repositories (Prisma) → PostgreSQL
```

Route handlers and Server Components never touch Prisma directly — they call
**services** (`src/server/<domain>`), which call **repositories**. Money is
stored as `Decimal` (never a float); amounts are positive magnitudes whose
effect on balance is derived from the transaction type.

```
src/
  app/            (marketing) · (auth) · (dashboard) · api
  components/     ui · charts · dashboard · shared · providers
  server/         <domain>/{service,repo}.ts
  lib/            prisma · auth · money · currency · date · utils
  hooks/          TanStack Query hooks
  stores/         Zustand
  validations/    Zod schemas (shared client + server)
  config/         currencies · categories · navigation · site
prisma/           schema.prisma · seed.ts
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

- **Neon** — create a project at [neon.tech](https://neon.tech), then paste the
  pooled connection string into `DATABASE_URL` and the direct (non-pooled) one
  into `DIRECT_URL`.
- **Clerk** — create an app at [clerk.com](https://clerk.com), then copy the
  publishable + secret keys.

### 3. Set up the database

```bash
npm run db:migrate   # create tables from the Prisma schema
npm run db:seed      # seed currencies + exchange rates
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Generate Prisma client + build       |
| `npm run db:migrate` | Run a dev migration                  |
| `npm run db:seed`    | Seed reference data                  |
| `npm run db:studio`  | Open Prisma Studio                   |
| `npm run typecheck`  | TypeScript, no emit                  |
| `npm run lint`       | ESLint                               |

## Build roadmap

- [x] **0** — Scaffold, schema, auth, app shell
- [ ] **1** — Accounts
- [ ] **2** — Transactions
- [ ] **3** — Categories & budgets
- [ ] **4** — Dashboard analytics
- [ ] **5** — Goals
- [ ] **6** — Recurring transactions
- [ ] **7** — Investments
- [ ] **8** — Reports
- [ ] **9** — CSV import/export
- [ ] **10** — Polish: multi-currency display, dark mode, responsive pass
