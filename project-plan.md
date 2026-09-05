# Awaiting-Trial Case Tracking & Court Backlog Portal
### Full Project Plan — Portfolio Build (MERN Stack, Solo Dev + AI, Self-Paced — Built Right, Not Fast)

> **Status framing:** This is a concept/demo system built with realistic *synthetic* data to demonstrate product thinking, full-stack engineering, and design for a real, undersolved civic problem in Nigeria. It is explicitly not connected to real government/NGO data or systems. This framing should appear in the app footer, README, and case study — it's a feature of the project, not a limitation to hide.

---

## 1. The Problem (grounding facts to cite in your case study)

- As of Feb 2026, Nigeria's correctional population is 80,812; 51,955 (64%) are awaiting trial, not convicted.
- This is structural, not a spike: 68.9% (2023) → 66.7% (2024) → ~66% (2025) → 64% (2026).
- Legal remand limit under the 2015 Administration of Criminal Justice Act (Section 296) is 28 days. Many cases run 5–15 years past that.
- ~85% of awaiting-trial cases are for petty offenses.
- Root causes cited by officials/researchers: missing police case files, no cross-agency tracking, lack of legal representation, lost court paperwork between adjournments.
- Prior art: India's NyaayWatch (open-source court observability layer), the US National Open Courts Data Standard (NODS) — no equivalent exists for Nigeria yet. This is your defensible "gap."

---

## 2. Personas

| Persona | Role | Core need |
|---|---|---|
| **Amaka, Legal Aid Officer** | `legal_aid` | Manage her assigned caseload, update status, log hearing outcomes, see which of her cases are overdue |
| **Ibrahim, Correctional Records Officer** | `records_officer` | Update remand/custody status and physical file location, flag missing files |
| **Admin / Oversight Coordinator** | `admin` | System-wide view: backlog analytics, officer performance, state/court breakdowns |
| **Chidi, Journalist / Family Member (public)** | no login | Look up a case by **case number only** (never by name) to see status and days pending |

---

## 3. Scope (Everything — No Deadline Pressure, Build It Right)

You've said the timeline doesn't matter — quality, usability, and how outstanding it feels matter more than shipping fast. So nothing below is cut for time. Two things are still cut, but on ethical/legal grounds, not scheduling grounds (see bottom of this section).

**Foundation (build this first regardless of order below)**
1. Case profile: arrest date, remand start, current lifecycle stage, next hearing date, assigned counsel, file location, court, state, offense category
2. **4-stage case lifecycle**: Arrest → Charge & Remand → DPP Advice / Adjournment → Trial or Discharge
3. Auto-computed "days in custody" + **multi-tier alert thresholds at 28 / 90 / 180 days**, color-coded by severity (compliant → warning → critical)
4. Public lookup by **Case Hash ID** (not a guessable sequential number, no names)
5. Role-based dashboards (legal aid / records officer / admin)
6. Status update workflow with mandatory note + **stall reason** per update (e.g. "Awaiting DPP Advice," "File in Transit," "Court Adjournment")

**Core differentiators**
7. **Public Statutory Remand Clock** — a live-feeling visual counter on each public case view, showing days detained against the 28-day legal limit
8. **Agency Bottleneck Heatmap** — analytics view showing *where* cases stall, broken down by stall reason and by state/court
9. **Interactive Demo Persona Switcher** — nav-bar control letting anyone reviewing the portfolio toggle instantly between Public Observer / Legal Aid Attorney / Records Officer / Admin without separate logins
10. Audit log — every status change stamped with who/when/what changed
11. "File location" tracker with a running chain-of-custody trail
12. Anonymized CSV/JSON/PDF export for the analytics/backlog data
13. Simulated SMS/USSD lookup flow — mocked interface showing how someone without a smartphone would check a case, a real accessibility signal
14. **Pro-Bono Case Matching** — a "volunteer lawyer" demo role can filter unrepresented cases by detention duration and claim them, with a claim history log
15. Case escalation workflow when a hearing is missed or a stage stalls past a threshold

**Advanced & alluring — the features that make reviewers stop scrolling**
16. **Interactive Nigeria Map View** — an SVG/GeoJSON map of Nigerian states, color-coded by backlog severity, clickable to drill into a state's cases and stats. This is the single most visually striking feature you can build and it directly demonstrates data-viz + geographic UI skill.
17. **Real-Time Live Updates (Socket.io)** — when any officer updates a case, connected dashboards update instantly with a subtle animation/toast (e.g. "Case #A7F2 just crossed 28 days"). Turns a static CRUD app into something that feels alive, and demonstrates real-time systems skill, which most portfolio projects skip.
18. **Case Timeline Visualizer** — a horizontal stepper/timeline per case showing expected vs. actual time spent at each lifecycle stage, so a reviewer instantly sees *where* a case is stuck without reading text.
19. **Court/Agency Transparency Scorecard** — a public leaderboard-style view ranking simulated courts/states by average resolution time and compliance rate. Strong "wow" factor and reinforces the accountability angle of the whole project.
20. **"Watch This Case" subscription** — a public user can enter an email to get notified when a specific case (by hash ID) changes status. Zero PII collected about the *inmate*; only the watcher's email is stored. Great talking point on privacy-safe notification design.
21. **QR Code Case Slips** — auto-generate a printable slip with the Case Hash ID and a QR code linking to the public lookup. Bridges the physical/paper reality of the justice system with the digital tool — a small feature with an outsized "I actually thought about real usage" impression.
22. **Multi-language toggle (English / Nigerian Pidgin, minimum)** — most portfolio projects are English-only; a Pidgin toggle signals genuine cultural/contextual awareness for who'd actually use this, and is a manageable i18n scope.
23. **Historical trend analytics** — line charts of backlog and average wait time over months (seeded historical snapshots, not just current-day numbers), so the analytics dashboard tells a story over time, not just a single moment.
24. **Document/Evidence Attachment (mocked, access-controlled)** — officers can attach case documents (mock secure upload), visible only to authorized roles. Demonstrates full-stack file handling and access control together.
25. **Accessibility suite** — dark mode, adjustable font size, high-contrast mode, full keyboard navigation, screen-reader labels throughout. Genuinely important given the target users (families, low-literacy contexts) and a strong signal of engineering maturity.
26. **Bulk actions & CSV import** for officers — select multiple cases to update at once, or bulk-import a batch of cases (simulating migrating from paper records).
27. **PWA / offline-capable shell** — installable app with service-worker caching, since real users of a tool like this would often be on poor connectivity. A technically impressive, contextually appropriate addition.

**Explicitly cut — on principle, not on time**
- No real cross-agency integrations — faked via realistic seeded data, disclosed openly (no real institution would grant API access to a portfolio project, and pretending otherwise would be dishonest in the case study)
- No AI risk-scoring of defendants — ethically inappropriate and a genuine bias risk; deliberately not attempted regardless of how much time is available
- No real personal data, ever, under any circumstance

---

## 3a. Demo Mode (Persona Switcher)

Since this is a portfolio piece, reviewers won't create accounts to explore roles. Build a `demoMode` flag that:
- Shows a persistent nav-bar switcher: **Public Observer / Legal Aid Attorney / Records Officer / Admin**
- Swaps the active view instantly using pre-seeded demo user sessions (no real login required in demo mode)
- Is clearly labeled as a demo control, separate from the "real" auth flow you also build (auth still matters — it's part of the engineering story, just not required to *browse* the portfolio demo)

## 4. Tech Stack (MERN)

- **Frontend:** React + Vite, plain CSS (custom design system / CSS variables, no framework), Recharts (analytics + trend charts), React Router, Zustand (state)
- **Backend:** Node.js + Express, JWT auth, role-based middleware
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io (live dashboard updates, case-threshold-crossed events)
- **Maps:** react-simple-maps or a raw SVG Nigeria-states map + GeoJSON for the state-level heatmap/backlog view
- **QR codes:** `qrcode` (Node) or `qrcode.react` to generate the Case Hash ID slips
- **i18n:** `react-i18next` for the English/Pidgin toggle
- **File uploads (mocked):** Multer + local/mock storage, or a free-tier cloud bucket, gated by role-based access
- **PWA:** Vite PWA plugin for service-worker caching and installability
- **Deployment:** Vercel (frontend), Render or Railway (backend), MongoDB Atlas (DB)
- **Extras:** Zod or Joi for validation, bcrypt for auth, date-fns for date/duration logic, seed script for synthetic + historical data

---

## 5. Data Model (draft)

```
User
  _id, name, email, passwordHash, role (legal_aid | records_officer | admin), assignedState

Case
  _id, caseHashId (public lookup identifier, non-guessable), state, court, offenseCategory,
  arrestDate, remandStartDate, lifecycleStage (enum: arrest | charge_remand | dpp_advice_adjournment | trial_or_discharge),
  nextHearingDate, assignedCounselId (ref User), fileLocation,
  alertLevel (computed/cached: compliant | warning_28 | warning_90 | critical_180),
  createdAt, updatedAt

StatusHistory (audit log)
  _id, caseId (ref Case), updatedBy (ref User), previousStage, newStage,
  stallReason (enum: awaiting_dpp_advice | file_in_transit | court_adjournment | missing_counsel | other),
  note, timestamp

Adjournment
  _id, caseId (ref Case), scheduledDate, actualOutcome, reasonForAdjournment, timestamp

Hearing
  _id, caseId (ref Case), date, outcome, notes

WatchSubscription ("Watch This Case")
  _id, caseHashId (ref Case, not the internal _id), watcherEmail, createdAt
  // stores nothing about the case subject — only what the watcher needs to be notified

CaseDocument (mocked evidence/document attachment)
  _id, caseId (ref Case), uploadedBy (ref User), fileName, storageRef, visibleToRoles (array), uploadedAt

BacklogSnapshot (for historical trend charts)
  _id, date, state, court, avgWaitDays, totalAwaitingTrial, totalCompliant
  // populated by a periodic job (or a one-time seed generating months of history) so trend charts have something real to plot
```

`alertLevel` logic (recomputed on read or via a scheduled job):
```
days = daysSince(remandStartDate)
if lifecycleStage == 'trial_or_discharge' -> 'compliant'
else if days > 180 -> 'critical_180'
else if days > 90  -> 'warning_90'
else if days > 28  -> 'warning_28'
else -> 'compliant'
```

This `stallReason` field on `StatusHistory` is what powers the Agency Bottleneck Heatmap — aggregate by `stallReason` × `state`/`court` to show where cases actually get stuck.

---

## 6. Build Milestones (Self-Paced — No Fixed Deadline)

No calendar attached to these. Each milestone should feel *done* — tested and polished — before moving to the next, rather than racing to the end and patching later.

**Milestone 1 — Foundation**
- Finalize brand name + logo
- Wireframes: public lookup, case detail, officer dashboard, admin analytics, map view
- Repo setup, MERN boilerplate, MongoDB schema, auth + RBAC middleware
- Synthetic data seed script — realistic mock cases across several Nigerian states, plus several months of `BacklogSnapshot` history so trend charts aren't empty on day one

**Milestone 2 — Core case system**
- Case CRUD + 4-stage lifecycle + status update workflow with stall reason + audit log
- Public lookup by Case Hash ID, with the Statutory Remand Clock component
- Legal aid officer dashboard + Records officer dashboard
- Persona Switcher (demo-mode routing/sessions)

**Milestone 3 — Analytics & visualization**
- Admin analytics dashboard: backlog by state/court, avg wait time
- Agency Bottleneck Heatmap by stall reason
- Interactive Nigeria Map View
- Historical trend charts from `BacklogSnapshot`
- Court/Agency Transparency Scorecard
- Case Timeline Visualizer

**Milestone 4 — Real-time & workflows**
- Socket.io live dashboard updates
- Case escalation workflow for missed hearings / stalled stages
- Pro-Bono Case Matching (volunteer role, filtering, claiming)
- Simulated SMS/USSD lookup flow

**Milestone 5 — Trust, access & extras**
- "Watch This Case" email subscription
- QR Code Case Slips
- Document/Evidence attachment with role-gated visibility
- Bulk actions & CSV import for officers
- CSV/JSON/PDF export for analytics

**Milestone 6 — Accessibility, i18n & polish**
- English/Pidgin language toggle
- Dark mode, adjustable font size, high-contrast mode, keyboard nav, screen-reader labels
- PWA/offline shell
- Full responsive pass

**Milestone 7 — QA, deploy, launch content**
- Full testing pass (roles, edge cases, empty states, real-time race conditions)
- Deploy (Vercel + Render + Atlas)
- Write the case study (problem → decisions → tradeoffs → what you'd do with real partners)
- Record a short walkthrough video showing the map view, persona switcher, and real-time updates in action — these are the most visually persuasive parts of the build
- Publish + share

---

## 7. Testing & QA Checklist

- [ ] Role permissions enforced server-side, not just hidden in UI
- [ ] Public lookup never exposes names, only Case Hash ID + status
- [ ] Alert-level logic (28/90/180) correct across timezones/date edge cases
- [ ] Empty/error states designed (no data, case not found, etc.)
- [ ] Mobile responsive (low-bandwidth mindset)
- [ ] Full accessibility pass: contrast, keyboard nav, screen-reader labels, font scaling, dark mode
- [ ] `WatchSubscription` only ever stores the watcher's email — never leaks case-subject details beyond what the public view already shows
- [ ] Document/evidence attachments respect `visibleToRoles` server-side
- [ ] Socket.io updates don't leak data across roles (a records officer shouldn't get a legal-aid-only event)
- [ ] Map view and heatmap handle a state/court with zero cases gracefully (no divide-by-zero or broken visuals)
- [ ] Pidgin translations reviewed for accuracy, not just machine-translated and left unchecked
- [ ] PWA installs and functions with cached data when offline, degrades gracefully otherwise

---

## 8. Launch & Case Study Outline

1. The problem (with the stats above)
2. What already exists and the gap (NyaayWatch, NODS, absence of a Nigeria equivalent)
3. Design decisions and why (privacy-by-design lookup, 28-day auto-flag, audit trail)
4. What was simulated vs. real, and why
5. What you'd need to make this real (partnerships, data-sharing agreements, legal review)
6. Screenshots/demo link

---

## 9. Post-Launch & Growth Ideas

- v2 roadmap section in the case study (shows forward thinking)
- Submit to Justice Tech Catalog / awesome-civic-tech as a labeled concept project
- Optional: reach out to PRAWA or a Legal Aid Council office *only if* you want to pursue this beyond portfolio

---

## 10. Designing for Future Extensibility

GAVEL is built so new features can be added later without reworking what already exists. This isn't a task list to execute now — it's a reference to check whenever a new feature comes up down the line.

**What's safe to extend freely:**
- Adding a new function to `services/api.js` (frontend) or a new route/controller (backend) — new collections/entities reference existing ones by ID rather than reshaping them
- Adding a new role to the `role` enum, plus a new middleware check — existing roles are untouched
- Adding a new page/route — pages are isolated by folder, so a new one doesn't touch the other 44
- Adding a new shared component variant (e.g., a new button style) — as long as existing variants keep their current appearance

**What needs care, because a lot of the system reads from it:**
- The `lifecycleStage` enum (4 stages) — the Timeline component, the Bottleneck Heatmap, and the audit log all key off this. Adding a 5th stage later needs a migration plan for existing cases, not just a schema edit.
- The `alertLevel` enum and its day thresholds (28/90/180) — the RemandClock, StatusPill, and Nigeria map all render based on this. Changing the thresholds changes what every one of those components displays.

**Habits worth keeping from day one:**
- Version the API (`/api/v1/...`) so a future breaking change can live at `/v2/` without breaking what already works
- Keep a `CHANGELOG.md` in both the frontend and backend repos — cheap to maintain, and genuinely strong portfolio material showing the product evolved thoughtfully rather than shipping once and stopping
- Before changing an existing function's return shape (in `api.js` or a backend controller), check what already calls it — a *new* function is always safer than *changing* an existing one
- Feature-flag anything experimental so a half-finished feature can't break a page that's already working
