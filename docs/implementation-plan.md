# Moore Tires — Implementation Plan

## Execution Model
Work proceeds in 2-week sprints. Each sprint has a fixed scope, explicit entry criteria, and a defined "done" state. No sprint starts until the previous sprint's acceptance criteria are all green. Hotfixes are cherry-picked to `main`; all features go through `dev` → PR → `main`.

---

## Tech Stack Decisions (Final)

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Shared types, unified CI cache |
| Mobile | React Native + Expo SDK 51 | OTA updates, EAS Build for both platforms |
| Web | Vite + React 18 | Fast SPA; static export for marketing; dev proxy for dashboard |
| API | Express 5 + Node.js 20 | Team familiarity; Zod validation at boundary |
| Database | MongoDB Atlas | Document model; managed backups; Firebase optional for auth/analytics |
| ORM | Mongoose 8 | Schema-based models; typed queries via TypeScript |
| Auth | Clerk | Unified mobile + web session, magic link, Expo SDK |
| Real-time | Socket.io 4 | Battle-tested, room-based for technician groups |
| SMS | Twilio Messaging + Verify | Opt-out handling at carrier level |
| Push | Expo Push Notifications | Wraps APNs + FCM; no direct cert management |
| Queue | BullMQ + Redis (Upstash) | Retry logic for SMS, reminder scheduling |
| File Storage | Cloudflare R2 | S3-compatible, no egress fees |
| CI/CD | GitHub Actions → Netlify + EAS + Node API host | Parallel deploys per app |

---

## Sprint 0 — Infrastructure (Days 1–5)
**Entry criteria:** GitHub repo created, team members added.

### Tasks
| # | Task | Owner Layer | Notes |
|---|---|---|---|
| S0-1 | Initialize pnpm monorepo with Turborepo | Infra | `apps/`, `packages/` scaffold |
| S0-2 | Shared `tsconfig.base.json`, ESLint config, Prettier | Infra | Strict TS, `noUncheckedIndexedAccess` |
| S0-3 | Vitest + `@testing-library/react` wired to all packages | Infra | Coverage threshold 80% blocks CI |
| S0-4 | GitHub Actions CI: lint → typecheck → test → build | Infra | Fails PR if any step red |
| S0-5 | MongoDB Atlas cluster + Redis (Upstash) provisioned | Infra | Dev + staging environments |
| S0-6 | Clerk application created; dev keys in `.env.local` | Infra | Separate dev/staging/prod apps |
| S0-7 | Cloudflare R2 bucket + access keys; presigned URL helper in `packages/shared` | Infra | |
| S0-8 | Twilio account + sandbox number; credentials in env | Infra | Webhook endpoint for STOP handler |

**Done state:** `pnpm lint && pnpm test && pnpm build` exits 0 on CI. MongoDB Atlas reachable from API. Clerk dev login works.

---

## Sprint 1 — Data Model & API Skeleton (Days 6–19)

### MongoDB Collections & Indexes (packages/db)

All collections are defined as Mongoose schemas in `packages/db/src/models/`. Use TypeScript interfaces matching each schema for full type safety.

**Collections and key indexes:**

| Collection | Key Fields | Indexes |
|---|---|---|
| `customers` | `phone` (unique), `email` | `{ phone: 1 }` unique; `{ email: 1 }` sparse |
| `vehicles` | `customerId`, `licensePlate` | `{ customerId: 1 }`; `{ licensePlate: 1 }` |
| `service_requests` | `customerId`, `vehicleId`, `status`, `createdAt` | `{ customerId: 1 }`; `{ status: 1, createdAt: -1 }` |
| `technicians` | `phone` (unique), `territory` | `{ phone: 1 }` unique; `{ territory: 1 }` |
| `jobs` | `serviceRequestId` (unique), `technicianId`, `status`, `scheduledAt` | `{ serviceRequestId: 1 }` unique; `{ technicianId: 1, scheduledAt: 1 }` |
| `appointments` | `jobId` (unique), `technicianId`, `startsAt`, `endsAt` | `{ jobId: 1 }` unique; `{ technicianId: 1, startsAt: 1 }` for conflict checks |

**Conventions:**
- Use `_id` (ObjectId) as primary key; expose as `id` string via Mongoose `toJSON` transform.
- `smsOptedOut`, `status`, and enum fields use string enums validated by Zod in `packages/shared`.
- No raw MongoDB query objects from user input; always compose queries from typed Mongoose methods.
- Seed scripts live in `packages/db/src/seed.ts`; run with `tsx packages/db/src/seed.ts`.

### API Routes (packages/api)
```
POST   /api/v1/service-requests         → createServiceRequest
GET    /api/v1/service-requests         → listServiceRequests (auth: manager)
GET    /api/v1/service-requests/:id     → getServiceRequest   (auth: manager)
POST   /api/v1/jobs                     → scheduleJob         (auth: manager)
PATCH  /api/v1/jobs/:id/status          → updateJobStatus     (auth: tech|manager)
PATCH  /api/v1/jobs/:id/assign          → reassignJob         (auth: manager)
GET    /api/v1/technicians/:id/jobs     → getTechnicianJobs   (auth: tech)
POST   /api/v1/webhooks/twilio/opt-out  → handleTwilioOptOut  (auth: Twilio sig)
```

**Done state:** All routes return correct 400/401/404/409/201/200 in Vitest integration tests. MongoDB Atlas dev cluster seeded and reachable from API.

---

## Sprint 2 — Service Request Intake (Days 20–33)

### Tasks
| # | Task | Notes |
|---|---|---|
| S2-1 | `IntakeForm` component in `packages/ui` | Reusable on both marketing site and mobile |
| S2-2 | Zod schema `ServiceRequestSchema` in `packages/shared` | Shared between client and API |
| S2-3 | `createServiceRequest` service: validate → persist → enqueue SMS | Bull job `sms:send` with template `sms_receipt` |
| S2-4 | Twilio SMS worker: dequeue `sms:send`, send, log delivery SID | Max 3 retries, exponential backoff |
| S2-5 | Embed `IntakeForm` in marketing site at `/book` route | |
| S2-6 | Embed `IntakeForm` in mobile app `screens/BookScreen.tsx` | Expo `KeyboardAvoidingView`, native date picker |
| S2-7 | Manager toast + badge on `sr:new` Socket.io event | Dashboard layout subscribes on mount |
| S2-8 | Tests: AC-01 through AC-06 (see mvp-spec.md) | Playwright for web, Detox smoke for mobile |

**Done state:** All AC-01 through AC-06 pass.

---

## Sprint 3 — Scheduling & Notifications (Days 34–47)

### Tasks
| # | Task | Notes |
|---|---|---|
| S3-1 | `AppointmentCalendar` component: week/day swimlane | react-big-calendar + custom technician lanes |
| S3-2 | Availability query: `GET /api/v1/technicians/availability?date=&skill=` | Returns free 30-min blocks |
| S3-3 | `scheduleJob` service: conflict check → create Job + Appointment | MongoDB session transaction; query overlapping Appointment docs before insert |
| S3-4 | Expo push integration: register device token on Technician record | `POST /api/v1/technicians/push-token` |
| S3-5 | Push worker: dequeue `push:job_assigned`, send via Expo SDK | |
| S3-6 | Reminder scheduler: on Job creation, enqueue 2 Bull delayed jobs (24h, 2h) | Bull `jobId` stored on Appointment for cancellation |
| S3-7 | Socket.io broadcast `calendar:updated` on new job → all dashboard sessions re-fetch | |
| S3-8 | Tests: AC-07 through AC-11 | |

**Done state:** All AC-07 through AC-11 pass. Reminders fire in staging Twilio sandbox.

---

## Sprint 4 — Dispatch Board & Job Status (Days 48–61)

### Tasks
| # | Task | Notes |
|---|---|---|
| S4-1 | Dispatch board: Kanban columns per status, drag-to-reassign | `@dnd-kit/core` |
| S4-2 | Socket.io room `dispatch:today`; server broadcasts `job:status_changed` | All managers in room see update |
| S4-3 | Technician mobile `JobDetailScreen`: status action buttons per state machine | Guard invalid transitions at API |
| S4-4 | Photo upload: presigned R2 URL from API, upload direct from mobile | `expo-image-picker` + compress to ≤1 MB |
| S4-5 | `reassignJob` service: record audit trail fields, notify original tech | |
| S4-6 | Terminal state guard in `updateJobStatus`: CANCELLED blocks all transitions | |
| S4-7 | `EN_ROUTE` SMS trigger in status worker | Template `sms_en_route` |
| S4-8 | `COMPLETE` SMS trigger | Template `sms_complete` |
| S4-9 | Tests: AC-12 through AC-16 | Load test with 20 concurrent Socket.io clients |

**Done state:** All AC-12 through AC-16 pass. Real device smoke test on iPhone and Android.

---

## Sprint 5 — Marketing Site & Launch Prep (Days 62–75)

### Tasks
| # | Task | Notes |
|---|---|---|
| S5-1 | Home page: hero, services grid, testimonials, CTA | Lighthouse ≥ 90 mobile |
| S5-2 | Services page: detailed service descriptions | Static content, ISR 1h |
| S5-3 | About and Contact pages | Google Maps embed for shop location |
| S5-4 | `/book` route: embedded `IntakeForm` with success state | |
| S5-5 | GA4 + Meta Pixel: `form_start`, `form_submit` events | GTM or direct script |
| S5-6 | axe-core Playwright plugin: zero critical violations in CI | |
| S5-7 | Core Web Vitals measured via Lighthouse CI in GitHub Actions | Blocks merge if LCP > 2.5 s |
| S5-8 | OWASP checklist review: CSRF, rate-limiting, dependency audit | `pnpm audit`; resolve all high/critical |
| S5-9 | Security headers: CSP, HSTS, X-Frame-Options on all apps | Netlify `_headers` file for web; Express `helmet` for API |
| S5-10 | Staging smoke test: full E2E — submit request → schedule → dispatch → complete | Manual + Playwright script |

**Done state:** All MVP acceptance criteria green. Lighthouse ≥ 90 on marketing. `pnpm audit` zero high/critical. E2E smoke test passes.

---

## Environments

| Environment | API URL | Database | Twilio | Expo |
|---|---|---|---|---|
| Local | `localhost:3001` | MongoDB Atlas dev cluster | Sandbox | `expo start` |
| Staging | `api-staging.mooretires.app` | MongoDB Atlas staging cluster | Sandbox | EAS dev/preview build |
| Production | `api.mooretires.app` | MongoDB Atlas prod cluster | Live | EAS production build |

## Deployment Checklist (Pre-Production)
- [ ] All env vars set in Netlify + Node API host production dashboards
- [ ] Clerk production app keys loaded
- [ ] Twilio live number purchased and verified
- [ ] R2 bucket `public-read` policy confirmed off (all access via presigned URLs)
- [ ] MongoDB Atlas automated daily backup (continuous backup) enabled
- [ ] Upstash Redis persistence enabled
- [ ] GitHub Actions secrets rotated for production
- [ ] Error monitoring (Sentry) wired to all three apps
- [ ] On-call runbook in `docs/runbook.md`
