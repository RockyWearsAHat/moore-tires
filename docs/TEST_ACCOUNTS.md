# Moore Tires — Test Accounts

Seeded by `pnpm --filter @moore-tires/db seed`. Re-running the seed wipes the
database first, so these credentials are deterministic after every reseed.

**Common password for every account below:** `MooreTires!2026`

> ⚠️ The seed targets whatever MongoDB the `MONGODB_URI` env var points to.
> By default this is local Mongo (`mongodb://127.0.0.1:27017/moore-tires-dev`)
> when `.env.local` is present. To seed production (Atlas), unset / remove
> `.env.local` first — but it will **delete the existing data** in the target
> database, so confirm with the owner before doing so.

---

## 1 · Moore Tires staff (internal ops portal — `apps/dashboard`)

| Role  | Email                     | First / Last  | Notes                              |
| ----- | ------------------------- | ------------- | ---------------------------------- |
| admin | `admin@mooretires.test`   | Sarah Nguyen  | Full access; can invite users      |
| admin | `ops@mooretires.test`     | Chris Romero  | Second admin for parallel testing  |

Open the dashboard at <http://localhost:5174>, sign in with either account. The
**Internal Ops Portal** (dispatch board, orders queue, source allocation, fleet
status, exceptions) renders for these roles.

## 2 · Wholesale partners

### Acme Construction Co. — Platinum tier, NET-30

| Role             | Email                                       | First / Last     | Linked locations         |
| ---------------- | ------------------------------------------- | ---------------- | ------------------------ |
| district_manager | `dm.acme@acmeconstruction.test`             | John Davis       | All Acme locations       |
| store_employee   | `employee.hq@acmeconstruction.test`         | Maya Patel       | Acme HQ - Main Yard      |
| store_employee   | `employee.north@acmeconstruction.test`      | Diego Martinez   | Acme Site - North        |

Acme is the “Good morning, Acme Construction” account shown in the partner
portal mockup. The seed creates **2 sample orders** owned by John Davis so the
Recent Orders / Account Snapshot panels render with real data.

### BuildPro Logistics — Gold tier, NET-15

| Role           | Email                       | First / Last     | Linked location          |
| -------------- | --------------------------- | ---------------- | ------------------------ |
| store_employee | `employee@buildpro.test`    | Maria Rodriguez  | BuildPro Yard - South    |

### Pioneer Materials — Silver tier, prepaid

No seeded users yet — the wholesale account and billing address exist; invite
flow can add staff here from the dashboard once you sign in as admin.

## 3 · Retail customer (consumer / public marketing site)

| Role            | Email                  | First / Last   |
| --------------- | ---------------------- | -------------- |
| retail_customer | `retail@example.test`  | Avery Lopez    |

Open the marketing site at <http://localhost:5173>, click **Sign In**, and use
this account to land on the partner-style portal home. Retail customers can
also self-register via `/register` against the API.

---

## Bonus seeded data

- **Distribution centers:** Pacific Northwest Hub (WA), Texas Central Yard (TX), Memphis Distribution (TN)
- **Pricing tiers:** Silver (8% off), Gold (14% off), Platinum (22% off)
- **Tire catalog:** 16 SKUs across Goodyear, Michelin, Bridgestone, Continental, Yokohama, Toyo, BFGoodrich, Cooper — commercial, all-terrain, highway, and winter
- **Service request fixtures:** 3 PENDING service requests + 3 customers + 3 vehicles + 3 technicians (Marcus Webb, Destiny Reyes, Leon Park)
- **Acme HQ inventory snapshot:** 4 commercial SKUs with current stock 6/8/4/7 to drive the Low Stock / Replenishment panel
- **Acme orders:** SHIPPED (with tracking number `MT-SHIP-248731`) + PROCESSING

---

## Quick login curl recipes

```bash
# Internal ops admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mooretires.test","password":"MooreTires!2026"}'

# Wholesale district manager (Acme buyer)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"dm.acme@acmeconstruction.test","password":"MooreTires!2026"}'

# Store employee (location-scoped)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"employee.hq@acmeconstruction.test","password":"MooreTires!2026"}'

# Retail customer
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"retail@example.test","password":"MooreTires!2026"}'
```

All four return `{ success: true, data: { user, tokens: { accessToken, refreshToken } } }`.
