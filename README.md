# Paalan

**Verified bill coordination for NRIs caring for parents back home.**

Paalan lets an adult child living abroad stop guessing whether their aging
parent's bills are handled. Each bill carries an attached receipt and a one-tap
confirmation from a second party (parent or helper) — proof, not "trust us."
Paalan records and verifies; it never touches your money or reads medical reports.

This repo is the v1 mobile-first PWA (the child's surface).

## Quick start (no setup)

```bash
git clone https://github.com/thak005004/Paalan.git
cd Paalan
npm install
npm run dev
```

Open **http://localhost:3000** — you'll see the sample **"Amma · Pune"**
household with confirmed, proof-backed bills and the closed-trust-loops metric.

No database or config required: with no `.env`, the app runs in **demo mode**
using built-in sample data. (Package manager is **bun** by preference, but
`npm` works fine.)

## Run with a real database

To persist data in Postgres instead of the demo fixture:

1. Create a Postgres database (e.g. on [Neon](https://neon.tech)).
2. Copy the env template and add your connection string:
   ```bash
   cp .env.example .env   # then set DATABASE_URL
   ```
3. Migrate, seed, and run:
   ```bash
   bun install
   bun run db:setup       # apply migrations + seed the demo household
   bun run dev
   ```

When `DATABASE_URL` is set, the home page reads from the database; otherwise it
falls back to the demo fixture (`lib/demo.ts`). The two are kept identical.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run db:generate` | Generate a Drizzle migration from schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:seed` | Seed the demo household (idempotent) |
| `bun run db:setup` | Migrate + seed in one step |

## Stack

- [Next.js 15](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript
- [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com/)
- [Auth.js v5](https://authjs.dev) — magic-link (auth wiring is in progress)
- [Drizzle ORM](https://orm.drizzle.team) + Postgres ([Neon](https://neon.tech))

## Data model

Schema lives in `lib/schema.ts` (migrations in `drizzle/`). Core tables:
`households` (ownership/billing unit), `householdMembers`, `bills` (with
recurrence + lifecycle status), `attachments` (proof), `confirmations` (the
trust trail), `paymentIntents`, `disputes`, plus the Auth.js tables.

The closed-trust-loop metric — confirmed bills with ≥1 attachment, per household
per month — is the north-star (`lib/bills/lifecycle.ts`).
