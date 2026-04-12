# Moore Tires — MVP Specification

## Scope Statement
The MVP delivers three working flows end-to-end:
1. A customer submits a tire service request and receives an SMS confirmation.
2. A manager schedules the request and the assigned technician receives a push notification.
3. The technician updates job status in real time visible on the manager's dispatch board.

Everything else — payments, customer portal, analytics, fleet accounts — is Post-MVP.

---

## Users & Roles

| Role | Surface | Core Permissions |
|---|---|---|
| **Customer** | Marketing site (form), Mobile app | Submit service requests, view own appointments |
| **Technician** | Mobile app | View assigned jobs, update job status, add notes/photos |
| **Dispatcher** | Web dashboard | Assign jobs to technicians, manage schedule, view dispatch board |
| **Manager** | Web dashboard | All dispatcher permissions + user management, reports |

---

## Feature Specifications

### F-01: Service Request Intake

**Description:** Customer submits a new tire service request through either the marketing website or the mobile app.

**Form Fields:**
- Full name (required)
- Phone number (required, E.164 format validated)
- Email (optional)
- Vehicle: Year, Make, Model, License Plate (all required)
- Service type: Install, Repair, Inspection, Rotation (select, required)
- Preferred date (date picker, min = tomorrow, required)
- Preferred time window: Morning 8–12, Afternoon 12–5, Evening 5–8 (select, required)
- Notes (textarea, 500 char max, optional)
- Is this mobile service? (toggle, optional)

**Processing:**
1. Client-side Zod validation → show inline errors before submit.
2. POST `/api/v1/service-requests` with CSRF token.
3. API validates, persists `ServiceRequest` with status `PENDING`, returns 201.
4. Twilio job enqueued (Bull queue, max 3 retries) — SMS fires within 60 s.
5. Manager receives in-app toast + badge increment (Socket.io event `sr:new`).

**SMS Template (confirmation):**
> Hi [FirstName], Moore Tires received your request for [ServiceType] on [PreferredDate]. We'll confirm your appointment time shortly. Questions? Call (555) 867-5309.

**Acceptance Criteria:**
- AC-01: Form submits successfully on iOS Safari 17+, Android Chrome 124+, and desktop Chrome/Firefox/Edge.
- AC-02: Invalid phone format (not E.164) rejected with field-level error; no API call made.
- AC-03: Confirmation SMS delivered within 60 s for 99% of submissions in staging load test (100 concurrent).
- AC-04: Duplicate submission within 30 s (same phone + date) returns 409 with message "Request already received."
- AC-05: ServiceRequest row created in DB with correct status `PENDING`; `created_at` within 2 s of submit.
- AC-06: Notes field strips HTML/script tags server-side; XSS test payload stored as plain text.

---

### F-02: Appointment Scheduling

**Description:** Manager views pending service requests and schedules them as jobs with a technician and time slot.

**Dashboard Views:**
- **Inbox** — list of `PENDING` ServiceRequests, sorted by `created_at` desc.
- **Calendar** — week/day view; each technician's availability shown as a swimlane.
- **Job Detail** — full service request data + assignment form.

**Scheduling Flow:**
1. Manager opens ServiceRequest from inbox.
2. Selects technician (filtered by skill and availability on selected date).
3. Picks time slot from available 30-min blocks (occupied slots grayed out).
4. Submits → API creates `Job` with status `SCHEDULED`, `Appointment` linked.
5. ServiceRequest status → `SCHEDULED`.
6. Technician receives Expo push notification: "New job assigned: [Address], [DateTime]."
7. Customer receives SMS: "Your appointment is confirmed for [DateTime]. Technician: [FirstName]."

**Conflict Prevention:**
- API checks for overlapping `Appointment` rows for the same technician; returns 409 if conflict detected.
- Conflict check uses DB-level advisory lock to prevent race conditions.

**Acceptance Criteria:**
- AC-07: Assigning a technician who already has an overlapping appointment returns 409; no Job row created.
- AC-08: Push notification delivered to technician device within 5 s of scheduling (staging, real device).
- AC-09: Customer confirmation SMS contains correct technician first name and ISO 8601 appointment time.
- AC-10: Calendar swimlane updates in real time for all open dashboard sessions (Socket.io broadcast).
- AC-11: Manager can filter technician list by service capability tag (e.g., "Commercial", "Mobile").

---

### F-03: Dispatch Board & Job Status

**Description:** Real-time board showing all Jobs for today, grouped by status. Technician updates status from mobile.

**Job Statuses:** `SCHEDULED → EN_ROUTE → IN_PROGRESS → COMPLETE → CANCELLED`

**Dispatch Board Columns:** Scheduled | En Route | In Progress | Complete

**Technician Mobile Flow:**
1. Technician opens job from their "My Jobs" list.
2. Taps "Start Trip" → status → `EN_ROUTE`; timestamp recorded.
3. Taps "Begin Work" on arrival → status → `IN_PROGRESS`.
4. Adds notes and up to 5 inspection photos (camera or gallery).
5. Taps "Mark Complete" → status → `COMPLETE`; `completed_at` recorded.

**Manager Reassignment:**
- Manager can drag-and-drop job card to different technician column on board.
- Reassignment stores `previous_technician_id` and `reassigned_at` on Job row.
- Original technician receives push: "Job [ID] has been reassigned."

**Acceptance Criteria:**
- AC-12: Status change on technician mobile reflects on dispatch board within 2 s for all connected managers.
- AC-13: Board correctly renders 20 concurrent technicians in load test without missed events or card duplication.
- AC-14: Photos compressed to ≤ 1 MB each before upload; originals never stored on API server (go directly to R2).
- AC-15: Reassignment audit trail: `previous_technician_id`, `reassigned_by`, and `reassigned_at` persisted.
- AC-16: Cancelled job cannot be transitioned to any other status (terminal state guard at API).

---

### F-04: Customer Communication

**Description:** All outbound customer messages use Twilio SMS. No email is required for MVP.

**Message Triggers:**
| Trigger | Delay | Template ID |
|---|---|---|
| ServiceRequest created | < 60 s | `sms_receipt` |
| Appointment confirmed | Immediate | `sms_confirmed` |
| Reminder | 24 h before | `sms_reminder_24h` |
| Reminder | 2 h before | `sms_reminder_2h` |
| Technician en route | On EN_ROUTE | `sms_en_route` |
| Job complete | Immediate | `sms_complete` |

**Opt-Out:** Reply STOP to any message opts customer out. Twilio handles at carrier level; Moore Tires DB sets `sms_opted_out = true` on Customer row via Twilio webhook.

**Acceptance Criteria:**
- AC-17: No SMS sent to a customer with `sms_opted_out = true`.
- AC-18: Reminder SMS job deduplicated — if job rescheduled, old reminders cancelled (Bull job removal by job ID).
- AC-19: All message templates pass Twilio's message filtering rules (no banned words, correct opt-out footer).
- AC-20: `EN_ROUTE` SMS contains technician first name only (not last name or phone number).

---

## Non-Functional Requirements (MVP)

| Category | Requirement |
|---|---|
| Performance | API p95 response time < 300 ms for all endpoints under 50 concurrent users |
| Availability | 99.5% uptime SLA (Netlify hosting with MongoDB and auto-restart) |
| Security | OWASP Top 10 mitigations; Clerk JWT on all authenticated routes; rate-limit intake form 10 req/min per IP |
| Phone Support | All customer-facing UI tested on iPhone SE (375px width) and Pixel 6 (412px) |
| Accessibility | WCAG 2.1 AA; zero axe-core critical violations in CI |
| Data Retention | Customer PII encrypted at rest (pgcrypto); retained 7 years per auto industry standard |

---

## Out of Scope for MVP
- Online payment / Stripe
- Customer login portal
- Fleet / commercial accounts
- Tire inventory management
- Analytics dashboard
- Multi-location support
- iOS/Android App Store submission (TestFlight / internal track only for MVP)
