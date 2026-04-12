# Moore Tires — Product Roadmap

## Vision
Become the operating system for independent and regional tire-service businesses: every job dispatched, every customer notified, every appointment confirmed — from a single cross-platform app.

---

## Phase 1 — MVP (Months 1–3)
**Theme:** Core intake, scheduling, and basic communication working end-to-end.

### Milestone 1.1 — Foundation (Weeks 1–4)
- [ ] Monorepo scaffold (pnpm workspaces, shared TS config, ESLint, Vitest)
- [ ] MongoDB schema: Customer, Vehicle, ServiceRequest, Job, Technician, Appointment
- [ ] Auth (Clerk) wired to Vite frontend and serverless backend
- [ ] CI pipeline: lint → test → build on every PR (GitHub Actions)

### Milestone 1.2 — Service Request Intake (Weeks 3–6)
- [ ] Customer-facing intake form: service type, vehicle details, preferred time window
- [ ] Form accessible on marketing site (embedded) and mobile app
- [ ] ServiceRequest stored with status `PENDING`; manager receives in-app alert
- [ ] Auto-reply SMS via Twilio confirming receipt within 60 seconds
- **Acceptance Criteria:**
  - Customer submits request → SMS confirmation delivered < 60 s in 99% of cases
  - Form renders correctly on iOS Safari 17, Android Chrome 124, and desktop Chrome
  - Required fields validated client-side (Zod) and server-side; partial saves rejected

### Milestone 1.3 — Scheduling (Weeks 5–8)
- [ ] Appointment calendar (week/day view) in dashboard
- [ ] Manager assigns technician and time slot to a ServiceRequest → Job created
- [ ] Technician receives Expo push notification for new Job assignment
- [ ] Customer receives SMS with appointment date/time and technician name
- [ ] Appointment reminder SMS fires 24 h and 2 h before scheduled time
- **Acceptance Criteria:**
  - Double-booking a technician is blocked at the API layer with a 409 response
  - Push notification delivered to technician device < 5 s of assignment in staging
  - Reminder SMS tested with Twilio sandbox; no duplicate sends on retry

### Milestone 1.4 — Basic Dispatch Board (Weeks 7–10)
- [ ] Real-time dispatch board (Socket.io) showing Jobs by status: PENDING → IN_PROGRESS → COMPLETE
- [ ] Technician mobile screen: view assigned jobs, tap to start/complete
- [ ] Manager can reassign a job from the board
- **Acceptance Criteria:**
  - Status change on mobile reflects on dispatch board < 2 s without refresh
  - Board handles 20 concurrent technicians in load test without message loss
  - Reassignment logs previous technician and timestamp (audit trail)

### Milestone 1.5 — MVP Marketing Site (Weeks 8–12)
- [ ] Home, Services, About, Contact pages
- [ ] "Book an Appointment" CTA routes to intake form
- [ ] Google Analytics 4 + Meta Pixel installed
- [ ] Lighthouse score ≥ 90 on mobile for all pages
- **Acceptance Criteria:**
  - Booking CTA conversion funnel tracked in GA4 (form_start → form_submit events)
  - Site passes WCAG 2.1 AA audit (axe-core, zero critical violations)
  - Core Web Vitals: LCP < 2.5 s, CLS < 0.1, INP < 200 ms on mobile 4G (simulated)

---

## Phase 2 — Growth (Months 4–6)
**Theme:** Customer portal, optimized dispatch, payment, and review capture.

### Milestone 2.1 — Customer Portal (Weeks 13–16)
- [ ] Customer login (Clerk, magic link)
- [ ] View service history, upcoming appointments, invoices
- [ ] Cancel or reschedule appointment (up to 4 h before)
- **Acceptance Criteria:**
  - Cancellation triggers manager notification and frees the technician time slot
  - Invoice PDF generated via Puppeteer and stored in R2; sharable link

### Milestone 2.2 — Dispatch Optimization (Weeks 15–20)
- [ ] Technician territory / zip-code routing
- [ ] Auto-suggest nearest available technician when assigning a job
- [ ] ETA calculation (Google Maps Distance Matrix API)
- [ ] Customer receives ETA SMS when technician departs
- **Acceptance Criteria:**
  - Auto-suggest correct technician in ≥ 85% of test cases (validated against sample data set)
  - ETA SMS delivered before technician arrives in staging end-to-end test

### Milestone 2.3 — Payments & Invoicing (Weeks 17–22)
- [ ] Stripe integration: collect card on file at booking
- [ ] Technician marks job complete → invoice auto-generated
- [ ] Customer charged or sent payment link; receipt emailed
- **Acceptance Criteria:**
  - Stripe webhook idempotency: duplicate webhook replay does not double-charge
  - PCI compliance: card data never touches Moore Tires servers (Stripe Elements only)
  - Invoice line items match job type + parts recorded by technician

### Milestone 2.4 — Review Capture (Weeks 21–24)
- [ ] Post-service SMS with Google/Yelp review link (24 h after job complete)
- [ ] Internal satisfaction rating (1–5) stored per job
- **Acceptance Criteria:**
  - Review SMS opt-out honored; no re-send after opt-out
  - Internal rating visible on customer profile and aggregated on manager dashboard

---

## Phase 3 — Scale (Months 7–12)
**Theme:** Analytics, integrations, fleet/commercial accounts, multi-location.

### Milestone 3.1 — Manager Analytics Dashboard
- [ ] Revenue by technician, service type, time period (recharts)
- [ ] Job completion rate, average time-to-complete
- [ ] Lead source attribution from marketing site

### Milestone 3.2 — Fleet & Commercial Accounts
- [ ] Account model: Company with many Vehicles and Contacts
- [ ] Bulk scheduling for fleet jobs
- [ ] Net-30 invoicing with QuickBooks Online export

### Milestone 3.3 — Multi-Location Support
- [ ] Location model; technicians and appointments scoped to location
- [ ] Manager role scoped to one or all locations

### Milestone 3.4 — Integrations
- [ ] Tire inventory sync (TireHub or text-file import)
- [ ] CRM export (HubSpot)
- [ ] Zapier webhook triggers for new ServiceRequest and completed Job

---

## Risks & Dependencies
| Risk | Likelihood | Mitigation |
|---|---|---|
| Twilio SMS deliverability issues | Medium | Fallback to email; monitor delivery rate dashboard |
| Expo push reliability on Android | Medium | FCM fallback; test on real Android 12+ devices |
| Stripe webhook failures | Low | Idempotency key + retry queue (Bull) |
| Google Maps API cost overrun | Medium | Cache ETA results per route; set billing alert at $50/mo |
| WCAG audit failures on mobile | Low | Run axe-core in CI; block merge on critical violations |
