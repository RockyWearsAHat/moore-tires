# Moore Tires — Copilot Instructions

## Project Purpose
Moore Tires is a wholesale tire distribution platform with supporting service operations, split into two distinct surfaces:
- **Operational App** — cross-platform mobile + web dashboard for buyers, store employees, dispatchers, managers, and Moore Tire staff handling ordering, inventory workflows, fulfillment, and service operations.
- **Marketing Website** — Vite + React 18 site for lead generation, account onboarding, wholesale ordering discovery, and secondary appointment booking.

Both surfaces share a single backend API and MongoDB database.

## Repository Layout
```
moore-tires/
├── apps/
│   ├── mobile/          # React Native (Expo) — iOS + Android
│   ├── dashboard/       # Vite + React 18 SPA — managers & admins
│   └── marketing/       # Vite + React 18 static site — public marketing
├── packages/
│   ├── api/             # Express + Mongoose REST/WebSocket API
│   ├── db/              # MongoDB models (Mongoose), seed scripts
│   ├── shared/          # Shared TypeScript types, validation schemas (Zod)
│   └── ui/              # Shared React component library (shadcn/ui base)
├── infra/               # Terraform / Netlify config
└── docs/                # Product specs, roadmap, ADRs
```

## Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Mobile | React Native + Expo SDK 51 | Cross-platform iOS/Android, OTA updates |
| Web App | Vite + React 18 | Fast SPA builds; dev proxy to API |
| Marketing | Vite + React 18 (static build) | Static HTML via Netlify; Lighthouse ≥ 90 |
| API | Node.js 20, Express 5, Zod | Type-safe validation at boundary |
| ORM / DB | Mongoose 8 + MongoDB Atlas | Document model; Firebase optional for auth/notifications/analytics |
| Auth | Custom JWT (bcrypt + jsonwebtoken) | Own DB, real B2B accounts, no vendor dependency |
| Real-time | Socket.io 4 | Dispatch board live updates |
| SMS/Voice | Twilio | Customer notifications, appointment reminders |
| Push | Expo Push + FCM | Technician job alerts |
| File Storage | Cloudflare R2 | Inspection photos, invoices |
| Hosting | Netlify (web), EAS (mobile), Netlify Functions or Node API host | |

## Coding Conventions
- TypeScript strict mode everywhere; `noUncheckedIndexedAccess: true`.
- All public API functions validated with Zod at the boundary; no runtime `any`.
- Vite React apps are client-rendered SPAs; use React Query or SWR for server-state fetching; avoid unnecessary re-renders.
- Business logic lives in `packages/api/src/services/`; route handlers are thin.
- Database queries go through Mongoose models — no raw query objects from user input; always use typed Mongoose methods with Zod-validated inputs.
- Errors: use a typed `AppError` class; never swallow exceptions.
- Test files colocated: `*.test.ts` for unit, `*.e2e.ts` for integration.
- Commit messages: `feat|fix|chore|docs|refactor(scope): description`.

## Documentation Standards (Required on Every Request)
- Every request must include a short implementation summary (what changed and why).
- Every code change must update related docs in docs/ if behavior, architecture, API, or workflow changed.
- Public functions/classes/endpoints need doc comments with purpose, inputs, outputs, errors.
- Non-obvious logic requires brief why-focused comments.
- API contract changes require schema/examples update.
- Database model changes require migration notes and rollback guidance.
- If no docs update is needed, response must explicitly state 'No documentation update required' with reason.
- Completion reports must distinguish validated facts vs assumptions.

## GitHub Issue Lifecycle (Required on Every Request)
- Every user request maps to one GitHub issue (new or existing) at https://github.com/RockyWearsAHat/moore-tires before any coding begins.
- **One branch per issue** — all work for a single issue goes in a single feature branch.

### Branch Naming Policy (Strict)
- **Format:** `issue-<number>-<kebab-summary>` (e.g., `issue-42-add-sms-intake`, `issue-18-fix-dispatch-race`, `issue-7-chore-eslint-upgrade`).
- **No commits to main/master directly** — all request work must go through a named branch.
- **Branch name required in completion output** — report the branch name when returning results (e.g., "Branch: `issue-42-add-sms-intake`").
- **Examples by type:**
  - Feature: `issue-42-add-sms-intake`, `issue-35-customer-payment-flow`
  - Fix: `issue-18-fix-dispatch-race`, `issue-22-fix-mobile-form-validation`
  - Chore: `issue-7-chore-eslint-upgrade`, `issue-12-chore-update-clerk-migration`

### Commit & Lifecycle
- Every commit must reference the issue: `feat(scope): description (#42)` — use the issue number in the commit message.
- All acceptance criteria defined in the issue must be met before the issue is closed.
- Run `pnpm test && pnpm lint` and attach a pass/fail evidence summary as an issue comment before closing.
- Push the branch after each completed request cycle; do not leave resolved work uncommitted or unpushed.
- Resolve/close the issue only when implementation and verification are both complete.
- If blocked, post a comment on the issue with the blocker and next action; keep the issue open.

## Build & Test Commands
```bash
# From repo root (pnpm workspaces)
pnpm install
pnpm --filter @moore/api dev          # start API on :3001
pnpm --filter @moore/dashboard dev    # start dashboard on :3000
pnpm --filter @moore/marketing dev    # start marketing on :3002
pnpm --filter @moore/mobile start     # start Expo dev server

# Tests
pnpm test           # run all unit tests (vitest)
pnpm test:e2e       # run integration tests (requires API running)
pnpm lint           # eslint + tsc --noEmit across all packages
```

## Key Domain Concepts
- **WholesaleAccount** — a commercial buyer or chain account with negotiated pricing, one or more locations, and linked district managers or store users.
- **StoreLocation** — a customer location operating under a larger wholesale account.
- **ServiceRequest** — a customer-initiated request for tire service (install, repair, inspection) used when the service workflow is active.
- **Order** — a tire purchase request placed by a wholesale customer, district manager, or authorized store user.
- **InventorySubmission** — customer- or store-provided inventory data used for replenishment and low-stock workflows.
- **Job** — an accepted service request or operational task assigned to staff with a scheduled time slot.
- **Appointment** — a time slot reserved for a service job at a shop or mobile location.
- **Customer** — an end-user or business contact associated with service history, ordering, or account activity.
- **Technician** — employee with skills, availability, assigned territory, or operational responsibilities.

## Feature Flags
- Marketing booking flow is behind `VITE_ENABLE_SERVICE_BOOKING`.
- Default behavior: booking disabled (`false`) for wholesale-first mode.
- Set `VITE_ENABLE_SERVICE_BOOKING=true` to expose `/book` and booking CTAs.

## Constraints
- Phone support is mandatory on all customer-facing flows; no desktop-only UX.
- The marketing site must achieve Lighthouse performance score ≥ 90.
- All customer PII encrypted at rest (MongoDB Atlas Encryption at Rest or field-level encryption).
- OWASP Top 10 mitigations required before any production deploy.
- Accessibility: WCAG 2.1 AA minimum on public-facing pages.
