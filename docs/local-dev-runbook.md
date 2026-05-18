# Moore Tires — Local Dev Runbook

How to bring the full stack up on your machine, with seeded test accounts, in
under two minutes. Pairs with `docs/TEST_ACCOUNTS.md` for credentials.

## Prerequisites

- Node ≥ 20, pnpm ≥ 9
- MongoDB Community running locally (`brew services start mongodb-community`)
- (Optional) Redis if you want to exercise the BullMQ-backed SMS / push / reminder workers. The API runs fine without it — queues degrade to no-ops.

## One-time setup

```bash
# From repo root
pnpm install
pnpm --filter @moore-tires/db build         # build the shared db package
```

Make sure a `.env.local` file at the repo root exists. The committed
`.env.example` is the template; the local-dev copy lives outside source control
and overrides any production values in `packages/api/.env`.

Minimum required values for local dev:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/moore-tires-dev
JWT_SECRET=<64-char random hex>
JWT_REFRESH_SECRET=<64-char random hex>
TWILIO_ACCOUNT_SID=ACdevdevdevdevdevdevdevdevdevdev01   # dummy is fine
TWILIO_AUTH_TOKEN=dev_local_auth_token_unused
TWILIO_FROM_NUMBER=+15555550100
API_PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
VITE_API_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Both `packages/api/src/index.ts` and `packages/db/src/seed.ts` load
`.env.local` first, then fall back to `.env` — so the developer file overrides
the production-style `packages/api/.env` without touching it.

## Seed the database

```bash
pnpm --filter @moore-tires/db seed
```

This **wipes** the target database (`Customer`, `Vehicle`, `Technician`,
`ServiceRequest`, `User`, `WholesaleAccount`, `StoreLocation`, `PricingTier`,
`TireProduct`, `CustomerInventory`, `DistributionCenter`, `Order`,
`RefreshToken` collections) and reinserts:

- 3 distribution centers, 3 pricing tiers, 16 tire SKUs
- 3 wholesale accounts (Acme, BuildPro, Pioneer), 4 store locations
- 7 users covering every role
- 3 customers + vehicles + service requests, 3 technicians
- An Acme HQ inventory snapshot and 2 sample orders for John Davis

Credentials are printed at the end of the run; the full list is in
`docs/TEST_ACCOUNTS.md`.

## Run the stack

Open three terminals (or use a multiplexer). All commands run from repo root.

```bash
# 1. API (Express + Mongoose + Socket.io) on :3001
pnpm dev:api

# 2. Marketing site (Vite SPA) on :5173
pnpm dev:web

# 3. Internal ops portal / partner dashboard on :5174
pnpm dev:dash

# 4. (Optional) Mobile app (Expo) — uses tunnel mode for device testing
pnpm dev:mobile
```

Or, to run everything at once via Turbo:

```bash
pnpm dev
```

### Health checks

```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}
```

## Logging in

| Surface         | URL                                   | Account to try                          |
| --------------- | ------------------------------------- | --------------------------------------- |
| Marketing site  | <http://localhost:5173>                | `retail@example.test` or any wholesale  |
| Internal portal | <http://localhost:5174/dispatch>       | `admin@mooretires.test` (admin)         |
| Partner portal* | <http://localhost:5174> (after roles) | `dm.acme@acmeconstruction.test`         |

\*The dashboard guards routes against role: `admin`, `district_manager`,
`store_employee`. `retail_customer` is rejected on login at the dashboard.

**Password for every seeded user:** `MooreTires!2026`

## Pointing at production (Atlas)

`packages/api/.env` already points at the Atlas cluster. To run the API
against production, remove or rename the repo-root `.env.local` so the
overrides drop out:

```bash
mv .env.local .env.local.bak   # turn off the local override
pnpm dev:api                   # API now loads packages/api/.env (Atlas)
```

> Do not run `pnpm --filter @moore-tires/db seed` against the Atlas DB without
> explicit owner confirmation — it deletes all existing data first.

## Common gotchas

- **API won't start, `JWT_SECRET` error** — `.env.local` is missing or the
  shell has overridden it with an empty value. Re-export it or recreate
  `.env.local`.
- **Dashboard says "You do not have access"** — you logged in with a
  `retail_customer`. Use an admin / district_manager / store_employee account.
- **Mongoose duplicate-index warnings** — should not appear after the latest
  index cleanup. If they reappear, rebuild the db package: `pnpm --filter
  @moore-tires/db build`.
- **Stale type errors after editing `packages/db`** — `packages/api` imports
  from the built `dist/`. Rebuild db (`pnpm --filter @moore-tires/db build`)
  to pick up the change.
