---
description: "Strict execution protocol for all build and feature prompts in the Moore Tires project. Read this before generating any code."
applyTo: "**"
---

# Moore Tires — Go Build Execution Protocol

You are implementing code for the Moore Tires tire-service platform. Before writing a single line of code, read and comply with every rule in this file. Non-compliance results in rejected output.

## 0. Context You Must Have Before Starting

Before responding to any build request, confirm you have read and loaded:
- `copilot-instructions.md` — tech stack, directory layout, conventions
- `docs/mvp-spec.md` — feature specs and acceptance criteria
- `docs/implementation-plan.md` — sprint tasks, schema, API routes

If any of these files are not in your context window, read them via `read_file` before proceeding. Do not generate code from memory of these documents.

## 0.5. Issue-First Workflow (Mandatory Pre-Step)

Before writing a single line of code:
- [ ] Confirm a GitHub issue exists at https://github.com/RockyWearsAHat/moore-tires for this request — or create one now.
- [ ] Verify the issue has explicit done criteria (acceptance criteria). If missing, define them in the issue before proceeding.
- [ ] Record the issue number — it is required in the branch name and every commit.
- [ ] Create a branch with strict naming: `issue-<number>-<kebab-summary>` (e.g., `issue-42-add-sms-intake`). One branch per issue. No direct commits to main/master.

**Done criteria are a contract.** Implementation must not begin until they are written in the issue.

## 1. Surface Separation — Never Cross the Boundary

The **operational app** and the **marketing website** are distinct Vite + React applications:
- `apps/dashboard/` — manager and dispatcher views; requires Clerk authentication.
- `apps/marketing/` — public-facing; no auth; Lighthouse ≥ 90 mobile is non-negotiable.
- `apps/mobile/` — React Native (Expo); all customer and technician mobile flows.

**Rules:**
- Business logic (queries, mutations, queue jobs) lives in `packages/api/src/services/`. Route handlers call services; they contain zero business logic themselves.
- Shared React components go in `packages/ui/`. Never copy a component between apps.
- Shared TypeScript types and Zod schemas go in `packages/shared/`. Never redefine a type that already exists there.
- The marketing Vite app is a client-rendered SPA deployed as static HTML on Netlify. Avoid heavy client-side JS on initial load; prefer static route components with deferred data fetching for SEO-critical pages.

## 2. Phone Support Is Mandatory

Every customer-facing UI element must render correctly at 375 px viewport width (iPhone SE) and 412 px (Pixel 6). This is not optional.

Before marking any frontend task complete:
- [ ] Verify layout does not overflow at 375 px (use browser devtools or Playwright viewport).
- [ ] Verify all touch targets are ≥ 44 × 44 px.
- [ ] Verify no horizontal scroll introduced.
- [ ] Verify text is legible at mobile font sizes (minimum 14 px).

If a design cannot satisfy these constraints, redesign it. Do not ship a layout that fails mobile.

## 3. Type Safety — No Shortcuts

- TypeScript strict mode is already configured. Do not add `// @ts-ignore` or `// @ts-expect-error` without an inline comment explaining why it is safe and a GitHub issue reference.
- Do not use `any`. If you need an escape hatch, use `unknown` and narrow explicitly.
- All form inputs and API request bodies must be validated with a Zod schema from `packages/shared` before processing. Validation on the client is UX; validation on the server is security. Both are required.
- All database queries must use typed Mongoose model methods. Never construct raw MongoDB query objects from unvalidated user input; always pass Zod-validated data into Mongoose queries.

## 4. API Contract Rules

- Every new API route must have a corresponding Zod request schema and a Zod response schema in `packages/shared/src/schemas/`.
- Return the correct HTTP status code. Consult this table — do not invent codes:
  - `200` — successful GET or PATCH
  - `201` — resource created
  - `204` — successful DELETE with no body
  - `400` — validation failure (include Zod error details in dev; omit in prod)
  - `401` — unauthenticated
  - `403` — authenticated but not authorized
  - `404` — resource not found
  - `409` — conflict (duplicate, double-booking, terminal state violation)
  - `500` — unhandled server error (never expose stack trace in prod)
- Every authenticated route must verify the Clerk JWT. Use the `requireAuth` middleware from `packages/api/src/middleware/auth.ts`. Never manually parse JWTs.

## 5. Security Rules (OWASP Top 10 — Enforced)

Every code change must pass this checklist before being considered complete:
- [ ] **A01 (Broken Access Control):** All mutations check that the requesting user owns or has permission for the resource. Never trust a resource ID in the request body alone.
- [ ] **A03 (Injection):** No raw MongoDB operator injection. All user input Zod-sanitized before use; never spread user-supplied objects directly into Mongoose `find`/`update` calls.
- [ ] **A05 (Security Misconfiguration):** No credentials, API keys, or secrets in source code. Use `process.env` with a `.env.example` entry. Run `git grep -r "sk_" .` and `git grep -r "AC[0-9a-f]{32}"` before committing.
- [ ] **A07 (Auth Failures):** Intake form (public) rate-limited to 10 requests/minute per IP via `express-rate-limit`. Authenticated routes use `requireAuth`.
- [ ] **A08 (Data Integrity):** Twilio webhook handler verifies `X-Twilio-Signature` using `twilio.validateRequest()`. Reject requests that fail.
- [ ] **CSRF:** All state-mutating requests from the Vite React frontend include a CSRF token managed by the Clerk session. Do not disable CSRF.

## 6. Real-Time Events — Socket.io Protocol

When emitting or handling Socket.io events, follow this naming convention exactly:
- `sr:new` — new ServiceRequest created (broadcast to `room:managers`)
- `job:status_changed` — job status updated (broadcast to `room:dispatch:today`)
- `calendar:updated` — appointment added or modified (broadcast to `room:managers`)

Do not invent new event names without updating this file. All event payloads must be typed as interfaces in `packages/shared/src/events.ts`.

## 7. SMS Rules

- All SMS sends go through the BullMQ queue (`sms:send` job), never inline in a request handler.
- Always check `customer.smsOptedOut === false` before enqueueing an SMS job.
- Use template IDs (not inline strings) as defined in `docs/mvp-spec.md` F-04.
- Reminder jobs must store their Bull `jobId` on the `Appointment` record so they can be cancelled on reschedule.

## 8. Testing Requirements

A task is not done until tests exist that cover it. Minimum requirements:
- **Unit tests (Vitest):** Every service function has tests for the happy path, a validation failure path, and any conflict/error path. Target: ≥ 80% line coverage on `packages/api/src/services/`.
- **Integration tests:** Every API route has at least one request-level test that hits the actual Express router with a test MongoDB instance (use `@testcontainers/mongodb` or `mongodb-memory-server`).
- **AC tests:** Every acceptance criterion in `docs/mvp-spec.md` has a named test (e.g., `it("AC-03: SMS delivered within 60s", ...)`). The test must either pass or be explicitly marked `skip` with a reason.

Do not write tests after the fact. Write tests before or alongside the implementation (TDD preferred, test-alongside acceptable).

## 9. Acceptance Criteria — The Exit Gate

A feature is **done** when:
1. All acceptance criteria for that feature (from `docs/mvp-spec.md`) are passing in the test suite.
2. `pnpm lint` exits 0 with zero warnings.
3. `pnpm test` exits 0 with coverage ≥ 80% on touched service files.
4. No new TypeScript errors: `pnpm tsc --noEmit`.
5. The change renders correctly at 375 px and 412 px viewport widths.
6. No new `pnpm audit` high or critical vulnerabilities introduced.

If any of these checks fail, the task is not done. Do not mark it complete or move to the next task.

## 10. Commit Protocol

- Every commit message must include the issue reference: `feat|fix|chore|docs|refactor(scope): description (#<issue>)`.
- Each commit is atomic: one logical change, all tests passing at that commit.
- Never commit without an issue reference — if no issue exists, create one first (see §0.5).
- Never commit commented-out code, `console.log` statements, or TODO comments without a linked issue number.
- Before committing: run `git checkpoint` (MCP tool) — do not write commit messages manually.

## 11. File Creation Rules

- Do not create a new file if expanding an existing one satisfies the requirement.
- New API route files go in `packages/api/src/routes/`.
- New service files go in `packages/api/src/services/`.
- New shared schemas go in `packages/shared/src/schemas/`.
- New shared types go in `packages/shared/src/types/`.
- New UI components go in `packages/ui/src/components/`.
- New mobile screens go in `apps/mobile/src/screens/`.
- New dashboard pages go in `apps/dashboard/src/app/`.
- New marketing pages go in `apps/marketing/src/app/`.
- New database migrations: `pnpm --filter @moore/db migrate:dev -- --name <description>`.

## 12. What to Return After Any Build Task

After completing a build task, always return:
1. **Issue:** `#<number>` — link to https://github.com/RockyWearsAHat/moore-tires/issues/<number>; status `open` | `resolved` | `blocked`.
2. **Branch:** `issue-<number>-<kebab-summary>` (e.g., `issue-42-add-sms-intake`) — required in every completion output.
3. **Files changed:** list each file with its path and what changed.
4. **Tests written:** list each test and which AC it covers (or `unit` if no AC).
5. **Validation run:** confirm `pnpm lint`, `pnpm test`, and `pnpm tsc --noEmit` results.
6. **Branch pushed:** `yes` | `no` (explain why).
7. **Blockers:** any known open issues; link to spec section or AC number.
8. **Next task:** the next unfinished task from `docs/implementation-plan.md`.

**Finalization:** After validation passes, push the branch to `origin`, update the issue with a test evidence comment, and close the issue. If blocked, comment on the issue with the blocker and next action — do not close.

If you cannot provide items 1–5, do not claim the task is complete.
