# GAVEL — UI/UX Design Brief & Google Stitch Prompt Kit

> Replace every instance of **GAVEL** with your final chosen name before using any prompt below. Consistency starts with never letting that placeholder slip through.

---

## Part 1 — Full Page List (nothing skipped)

### A. Public Pages (no login required)
1. Landing Page
2. About / How It Works
3. Public Case Lookup (search by Case Hash ID)
4. Case Not Found (empty/error state for a bad lookup)
5. Public Case Status Detail (Remand Clock + timeline)
6. Transparency Scorecard (court/state rankings)
7. National Backlog Map (interactive Nigeria map)
8. Pro-Bono / Volunteer Lawyer Interest Page
9. "Watch This Case" Subscribe Confirmation
10. FAQ
11. Privacy Policy
12. Terms of Use
13. Contact / Report an Issue

### B. Auth Pages
14. Login
15. Register (Volunteer Lawyer sign-up)
16. Forgot Password
17. Reset Password
18. Verify Email
19. Two-Factor / OTP Verification

### C. Officer / Internal Dashboard Pages
20. Legal Aid Officer Dashboard (My Caseload)
21. Records Officer Dashboard (File Tracking)
22. Case List / All Cases (filterable table, role-scoped)
23. Case Detail — Internal View (full record, audit log, documents, timeline)
24. Add New Case (form)
25. Update Case Status (form/modal)
26. Bulk Import Cases (CSV upload)
27. Documents / Evidence Manager
28. Notifications Center (in-app)
29. Profile / Account Settings

### D. Admin-Only Pages
30. Admin Overview Dashboard (system-wide KPIs)
31. Agency Bottleneck Heatmap
32. Historical Trends
33. User Management (manage officer/volunteer accounts)
34. Export Reports (CSV/JSON/PDF)
35. System-Wide Audit Log

### E. Volunteer Lawyer Pages
36. Pro-Bono Case Browser (filter unrepresented cases)
37. My Claimed Cases

### F. Demo Mode
38. Demo Mode Landing (explains the Persona Switcher, entry point for reviewers)

### G. System / Utility Pages
39. 404 — Page Not Found
40. 403 — Access Denied / Unauthorized
41. 500 — Server Error
42. Offline Page (PWA fallback)
43. Maintenance Page
44. QR Code Case Slip (printable view)

**44 screens total.** Build in the milestone order from the project plan — Milestone 1–2 pages first (A, B, part of C), then work outward.

---

## Part 2 — Design System (lock this before generating a single screen)

### Brand Personality
Calm authority. Trustworthy, not bureaucratic. Transparent, not cold. Humane — this system represents real people's liberty, so nothing should feel clinical or punitive in tone, even in "critical" states.

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary (brand, nav, headers) | Deep Navy | `#0F172A` |
| Primary Accent (links, active states, primary buttons) | Indigo | `#4F46E5` |
| Background (light) | Off-White | `#F8FAFC` |
| Surface / Card | White | `#FFFFFF` |
| Body Text | Slate | `#1E293B` |
| Muted / Secondary Text | Slate Gray | `#64748B` |
| Border / Divider | Light Slate | `#E2E8F0` |
| Status: Compliant | Emerald | `#10B981` |
| Status: Warning (29–90 days) | Amber | `#F59E0B` |
| Status: Severe Warning (91–180 days) | Orange | `#F97316` |
| Status: Critical (180+ days) | Crimson | `#EF4444` |
| Dark Mode Background | Near-Black Navy | `#0B1120` |
| Dark Mode Surface | Dark Slate | `#1E293B` |
| Dark Mode Text | Off-White | `#F1F5F9` |

### Typography
- **Font family:** Inter (fallback: system UI sans-serif)
- H1: 32px / Bold
- H2: 24px / Semi-bold
- H3: 20px / Semi-bold
- H4: 16px / Semi-bold
- Body: 16px / Regular, line-height 1.5
- Small/Caption: 14px / 12px Regular
- Never use more than one font family anywhere in the product

### Iconography
- **Lucide Icons** exclusively — 24px, line-style, 1.5–2px stroke, rounded caps
- No mixing icon styles (no filled icons alongside line icons)

### Spacing & Grid
- 8px base spacing unit (use 8/16/24/32/48/64 only)
- 12-column grid, max content width 1280px
- Card corner radius: 12px. Button corner radius: 8px. Input corner radius: 8px.
- Generous whitespace — this is a civic trust product, not a dense enterprise tool

### Core Components (must look identical everywhere they appear)
- **Buttons:** Primary (filled Indigo), Secondary (outline Navy), Danger (filled Crimson), Ghost (text-only)
- **Status Pill/Badge:** rounded-full, colored background + icon + label, one for each of the four alert levels: Compliant / Warning / Severe Warning / Critical
- **Case Card:** white surface, 12px radius, subtle shadow, status pill top-right
- **Stat Card:** large number, label, small trend indicator
- **Data Table:** sortable headers, filter bar above, pagination below, status pill per row
- **Timeline/Stepper:** horizontal, 4 stages, filled circles for completed stages, connecting line changes color if a stage overran expected time
- **Remand Clock:** circular progress ring, four-tier color ramp Emerald → Amber → Orange → Crimson as days increase, large day-count in center
- **Public Navbar:** logo left, links (About, Look Up a Case, Transparency, Volunteer), Login button right
- **Internal Sidebar:** collapsible, role-scoped menu items, active item highlighted in Indigo
- **Modal/Dialog:** centered, white surface, dimmed backdrop, clear primary/secondary actions
- **Toast Notification:** top-right, color-coded left border matching alert type, auto-dismiss
- **Map Component:** Nigeria states, choropleth fill by backlog severity using the same four-tier severity colors, hover tooltip, click to drill down
- **Charts:** Recharts-style bar/line/heatmap, using only palette colors above, never introduce new chart colors
- **Forms:** consistent label-above-input pattern, clear error state in Crimson, helper text in muted gray
- **Empty States:** simple line-icon illustration + one-line message + a clear next action
- **QR Block:** QR code + Case Hash ID printed below in monospace font

### Breakpoints (use these exact values everywhere)
- **Mobile:** up to 640px
- **Tablet:** 641px – 1024px
- **Desktop:** 1025px and above

Design mobile-first: define the small-screen layout first, then enhance for tablet/desktop — not the reverse.

### How Each Component Must Adapt (this is what "responsive" actually means here — not just "doesn't break")

| Component | Mobile behavior | Tablet behavior | Desktop behavior |
|---|---|---|---|
| Public Navbar | Logo + hamburger icon only; links open in a full-screen slide-in menu | Logo + hamburger, same as mobile | Full horizontal nav, all links visible |
| Internal Sidebar | Hidden by default; opens as a full-screen off-canvas drawer via a menu icon in the top bar | Collapses to an icon-only rail (labels on hover/tap) | Full labeled sidebar, always visible |
| Data Table | Transforms into a stacked card per row (label: value pairs) — never a horizontally-scrolling table | Horizontally scrollable table with sticky first column | Full table, all columns visible |
| Filter Bar (above tables) | Collapses into a single "Filters" button that opens a bottom sheet | Inline filters, may wrap to 2 rows | Full inline filter row |
| Stat Card Row | 2-column grid | 3-column grid | 4-column grid |
| Timeline/Stepper | Vertical stacked stepper (stages top to bottom) | Horizontal, condensed spacing | Full horizontal stepper |
| Remand Clock | Scales down proportionally, stays centered, minimum 120px diameter | Medium size | Full size as designed |
| National Backlog Map | Full-width map; tapping a state opens its stats as a bottom sheet that slides up | Map + stats panel below (stacked) | Map with side-by-side stats panel |
| Modal/Dialog | Full-screen takeover, not a floating centered card | Centered card, ~80% width | Centered card, fixed max-width |
| Forms | Always single column, full-width inputs | Single column, may pair short fields (e.g. state/court) side by side | Single or two-column depending on form length |
| Charts (line/heatmap) | Horizontally scrollable container with a visible scroll hint | Fits width, may simplify tick labels | Full chart as designed |

### User-Friendliness Rules (non-negotiable, not just nice-to-haves)
- **Touch targets are at least 44×44px** on any interactive element — buttons, table row actions, nav items. This matters even more here than on a typical app, since real users of a tool like this would often be on lower-end Android devices.
- **Color is never the only signal.** Every status pill pairs its color with an icon and a text label — never rely on color alone (accessibility, colorblind users, and grayscale printing of the QR slip).
- **One primary action per screen**, visually dominant (the primary button color/weight) — every other action is secondary or ghost.
- **Destructive actions require a confirmation modal** — deleting a case, removing a user, discarding an unsaved status update.
- **Inline validation, not just on-submit.** A form should tell someone a field is wrong as they leave it, not only after they hit submit and lose their place.
- **Loading states use skeleton placeholders that match the final layout shape**, not a generic spinner — this makes perceived load time feel faster and avoids layout jump when data arrives.
- **Every empty state includes a next action.** Never just "No results" — always paired with a button or link (e.g., "Try a different Case Hash ID," "Add your first case").
- **Public-facing pages assume low bandwidth.** No autoplaying animations, lazy-load the map/chart assets, keep initial page weight light — a family checking a case status may be on a slow connection.
- **Officer-facing pages assume daily repeat use.** Forms should submit on Enter where sensible, tab order should follow visual order, and frequently-used actions shouldn't be buried more than one click deep.
- **Font size never drops below 14px for body text on mobile**, and the dark mode/larger-text toggle (already in scope for Profile/Settings) should genuinely scale text, not just tweak one page.

---

## Part 3 — Content & Copy Bible (the exact vocabulary every page must use)

This is what makes Stitch generate pages you can actually build on top of, instead of generic placeholder UI. Every prompt from here on embeds this vocabulary directly — never let Stitch invent its own labels, field names, or sample data.

### Exact Terminology (never rename these)
- Case identifier: **"Case Hash ID"** — format `LA-2026-0483` (State code – Year – 4-digit sequence)
- Roles: **Legal Aid Officer, Records Officer, Admin, Volunteer Lawyer, Public Observer**
- Lifecycle stages (exactly 4, in this order): **Arrest → Charge & Remand → DPP Advice / Adjournment → Trial or Discharge**
- Alert levels (exactly 4, in this order): **Compliant (0–28 days) → Warning (29–90 days) → Severe Warning (91–180 days) → Critical (180+ days)**
- Stall reasons (exact list, used in dropdowns and the heatmap): **Awaiting DPP Advice, File in Transit, Court Adjournment, Missing Counsel, Other**

### Sample Data to Use in Every Mockup (so screens look real, not templated)
- **States:** Lagos, Kano, Rivers, Enugu, Kaduna, Ogun
- **Courts:** Lagos High Court, Ikeja Magistrate Court, Kano State High Court, Port Harcourt Magistrate Court, Enugu State High Court, Kaduna Magistrate Court
- **Offense categories** (skew toward petty offenses, matching real-world data): Theft, Assault, Drug Possession, Public Disturbance, Fraud, Armed Robbery
- **Sample Case Hash IDs:** `LA-2026-0483`, `KN-2025-1187`, `RV-2026-0092`, `EN-2024-2201`
- **Key context stats** (use these real, cited figures wherever the product shows headline numbers): "64% of Nigeria's prison population is awaiting trial", "51,955+ people held awaiting trial nationwide", "28-day legal remand limit under the 2015 ACJA"

### Exact Button/CTA Text Standards
- Primary lookup action: **"Look Up a Case"**
- Secondary landing CTA: **"See the National Backlog"**
- Auth: **"Sign In" / "Create an Account" / "Send Reset Link" / "Back to Login"**
- Case actions: **"Update Status" / "Claim Case" / "View Case" / "Add New Case"**
- Data actions: **"Generate Report" / "Export CSV" / "Import Cases"**

### Exact Navigation Labels
- Public navbar: **About · Look Up a Case · Transparency · Volunteer · Login**
- Internal sidebar (role-dependent): **Dashboard · My Cases · Documents · Notifications · Profile · Logout** (Admin adds: **Heatmap · Trends · Users · Reports · Audit Log**; Volunteer Lawyer shows: **Browse Cases · My Claimed Cases** instead of My Cases)

---

## Part 4 — The Consistency Preamble (paste this before EVERY page prompt)

```
You are designing screens for "GAVEL," a civic-tech web platform that tracks
awaiting-trial court cases in Nigeria to reduce unlawful pre-trial detention.
The tone is calm, trustworthy, humane, and transparent — never clinical or cold.

STRICT DESIGN SYSTEM — apply identically across every screen, no exceptions or drift:

Colors:
- Primary/brand: Deep Navy #0F172A
- Primary accent/CTAs: Indigo #4F46E5
- Background: Off-white #F8FAFC, Surface/cards: White #FFFFFF
- Body text: #1E293B, Muted text: #64748B, Borders: #E2E8F0
- Status colors (use ONLY for case alert levels, nowhere else):
  Compliant = Emerald #10B981, Warning = Amber #F59E0B, Critical = Crimson #EF4444

Typography: Inter font family only. H1 32px Bold, H2 24px Semi-bold, H3 20px Semi-bold,
Body 16px Regular, Caption 14px/12px Regular.

Icons: Lucide icon set only, 24px, line-style, 1.5-2px stroke, rounded caps.

Spacing: 8px base unit grid (8/16/24/32/48/64 only). 12-column layout, max width 1280px.
Card radius 12px, button/input radius 8px. Generous whitespace, not dense.

Components to reuse exactly as previously defined: primary/secondary/danger/ghost buttons,
status pill badges, case cards, stat cards, data tables with filter+pagination, horizontal
timeline/stepper, circular Remand Clock progress ring, public navbar, internal collapsible
sidebar, modal dialogs, toast notifications, empty states with a line-icon + message + action.

Do not introduce new colors, fonts, icon styles, or component shapes not listed above.

RESPONSIVE & USABILITY RULES — apply to every screen, mobile-first:
- Breakpoints: Mobile up to 640px, Tablet 641-1024px, Desktop 1025px+
- On mobile: sidebar/navbar become a hamburger-triggered drawer, data tables
  become stacked cards (never horizontal scroll), timelines become vertical,
  modals become full-screen takeovers, forms stay single-column
- Every interactive element has a minimum 44x44px touch target
- Status is never shown by color alone — always pair color with an icon and
  a text label
- One visually dominant primary action per screen; destructive actions
  require a confirmation step
- Every empty state includes a next action, never a dead end
- Loading states use skeleton placeholders shaped like the final content,
  not a generic spinner

CONTENT & TERMINOLOGY — use these exact labels and sample data, never invent your own:
- Case identifier field is always labeled "Case Hash ID", format like "LA-2026-0483"
- The 4 lifecycle stages, always in this order: Arrest, Charge & Remand,
  DPP Advice / Adjournment, Trial or Discharge
- The 4 alert levels, always in this order: Compliant (Emerald), Warning (Amber),
  Severe Warning (Orange), Critical (Crimson)
- Stall reasons dropdown options: Awaiting DPP Advice, File in Transit, Court
  Adjournment, Missing Counsel, Other
- Sample states to use: Lagos, Kano, Rivers, Enugu, Kaduna, Ogun
- Sample courts to use: Lagos High Court, Ikeja Magistrate Court, Kano State High
  Court, Port Harcourt Magistrate Court, Enugu State High Court, Kaduna Magistrate Court
- Sample offense categories: Theft, Assault, Drug Possession, Public Disturbance,
  Fraud, Armed Robbery
- Sample Case Hash IDs to populate mockups: LA-2026-0483, KN-2025-1187, RV-2026-0092,
  EN-2024-2201
- Roles are always labeled: Legal Aid Officer, Records Officer, Admin, Volunteer
  Lawyer, Public Observer
```

---

## Part 5 — Worked Example Prompts (flagship pages, ready to paste)

### 1. Landing Page
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the PUBLIC LANDING PAGE for GAVEL.

Navbar: logo left, links exactly "About · Look Up a Case · Transparency · Volunteer",
"Login" button right.

Hero section:
- H1: "No case should wait past the law."
- Subheading: "Track awaiting-trial cases across Nigeria's courts and correctional
  centers — transparently, and without exposing anyone's identity."
- Primary button: "Look Up a Case"
- Secondary ghost button: "See the National Backlog"

Stat strip (3 stat cards, use these exact numbers):
- "64%" — "of Nigeria's prison population is awaiting trial"
- "51,955+" — "people currently held awaiting trial nationwide"
- "28 Days" — "the legal remand limit under the 2015 ACJA — routinely exceeded"

"How It Works" 3-step section, exact copy:
1. "Look up a case" — search by Case Hash ID, never by name
2. "See where it's stuck" — view the current lifecycle stage and stall reason
3. "Track accountability" — every status change is logged and auditable

Backlog Map preview card: static preview of the Nigeria choropleth map (Lagos, Kano,
Rivers, Enugu, Kaduna, Ogun visible), caption "See the full national picture",
links to the map page.

Footer: links "About · Privacy Policy · Terms of Use · Contact", plus this exact
disclaimer line in muted small text: "This is a concept platform built with synthetic
data for demonstration purposes. It is not connected to any government or NGO system."
```

### 2. Public Case Lookup
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the PUBLIC CASE LOOKUP page for GAVEL.

Navbar identical to landing page.

Centered search card:
- H2: "Check a Case Status"
- Input labeled "Enter Case Hash ID", placeholder text "e.g. LA-2026-0483"
- Primary button: "Search"
- Helper text below input: "We never show names. Only the case number is needed to
  protect the privacy of everyone involved."

Below the fold: a small demo hint box reading "Try a sample case: LA-2026-0483" as a
clickable chip, so reviewers can test the flow without needing real data.
```

### 3. Public Case Status Detail (Remand Clock)
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the PUBLIC CASE STATUS DETAIL page for GAVEL, populated with this
exact sample case:
- Case Hash ID: LA-2026-0483
- State: Lagos, Court: Ikeja Magistrate Court
- Offense category: Theft
- Days in custody: 142 → Alert level: Severe Warning (Orange)
- Current stage: DPP Advice / Adjournment

Structure:
- Navbar identical to other public pages
- Case Hash ID "LA-2026-0483" displayed prominently at top with an Orange
  "Severe Warning" status pill
- Large centered Remand Clock: circular ring in Orange, "142" as the large center
  number, caption below: "days in custody — legal limit is 28 days"
- Horizontal 4-stage Timeline: Arrest (done) → Charge & Remand (done) →
  DPP Advice / Adjournment (current, highlighted) → Trial or Discharge (upcoming)
- Metadata card: State: Lagos, Court: Ikeja Magistrate Court, Offense: Theft
  (no names, no other personal details, ever)
- Secondary button: "Watch This Case" opening a small modal with a single email
  input and text "We'll email you if this case's status changes. We store nothing
  else about you or this case."
- Footer disclaimer identical to landing page
```

### 4. Login Page
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the LOGIN page for GAVEL.

Structure:
- Centered card on a full-bleed Deep Navy (#0F172A) background
- Logo at top of card
- H2: "Sign In"
- Input labeled "Email", placeholder "you@example.com"
- Input labeled "Password", with a "Forgot password?" link right-aligned beneath it
- Primary button, full width: "Sign In"
- Divider text: "New volunteer lawyer?"
- Ghost button: "Create an Account"
- Footer links: "Privacy Policy · Terms of Use"
```

### 5. Forgot Password Page
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the FORGOT PASSWORD page for GAVEL. Must match the Login page's
card width, radius, spacing, and button styling exactly.

Structure:
- Same centered card layout and navy background as Login
- H2: "Reset Your Password"
- Instruction text: "Enter the email linked to your account and we'll send you a
  reset link."
- Input labeled "Email"
- Primary button, full width: "Send Reset Link"
- Ghost link below: "Back to Login"
- After-submit success state (same card, content swapped): checkmark icon
  (Lucide "CheckCircle", Emerald), H2 "Check Your Email", text "We've sent a
  reset link to your inbox."
```

### 6. Internal Dashboard — Legal Aid Officer
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the LEGAL AID OFFICER DASHBOARD (internal, logged-in) for GAVEL,
for officer "Amaka Eze".

Structure:
- Internal Sidebar: "Dashboard · My Cases · Documents · Notifications · Profile ·
  Logout" — Dashboard highlighted active in Indigo
- Top bar: page title "My Caseload", "Amaka Eze" name + avatar top-right, a visible
  Persona Switcher control (labeled "Viewing as: Legal Aid Officer ▾") in the top bar
- Stat card row, exact labels: "Total Cases: 24", "Warning: 9", "Severe Warning: 5",
  "Critical: 2"
- Filter bar above table: dropdowns for "Stage" and "Alert Level", search input
  placeholder "Search by Case Hash ID"
- Data table, exact columns: Case Hash ID | Offense | Stage | Days in Custody |
  Alert Level | Next Hearing | Action. Populate 4 sample rows using:
  LA-2026-0483 / Theft / DPP Advice-Adjournment / 142 days / Severe Warning / Mar 12,
  2026 / "View"
  KN-2025-1187 / Assault / Charge & Remand / 31 days / Warning / Feb 20, 2026 / "View"
  RV-2026-0092 / Drug Possession / Arrest / 6 days / Compliant / Feb 28, 2026 / "View"
  EN-2024-2201 / Fraud / DPP Advice-Adjournment / 210 days / Critical / — / "View"
```

### 7. Internal Case Detail (full record)
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the INTERNAL CASE DETAIL page for GAVEL (officer/admin view),
showing sample case LA-2026-0483.

Structure:
- Sidebar + top bar identical to the dashboard
- Case header: "LA-2026-0483" with an Orange "Severe Warning" pill, subtitle
  "Lagos · Ikeja Magistrate Court", primary button top-right: "Update Status"
- Horizontal Timeline: Arrest (Jan 5, 2026 - done) → Charge & Remand
  (Jan 19, 2026 - done) → DPP Advice / Adjournment (current, 84 days in this
  stage vs. 30-day expected) → Trial or Discharge (pending)
- Two-column layout:
  Left column — case detail fields: "Arrest Date: Jan 5, 2026", "Remand Start:
  Jan 19, 2026", "Offense Category: Theft", "Assigned Counsel: Unassigned",
  "File Location: Ikeja Records Office"
  Right column — "Documents" panel with an "Upload" button and one sample file
  row "Arrest Report.pdf"; below it an "Audit Log" panel with 2 sample entries:
  "Ibrahim Musa changed stage to DPP Advice / Adjournment — Jan 19, 2026",
  "System flagged case as Severe Warning — Apr 12, 2026"
```

### 8. 404 Error Page
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the 404 — PAGE NOT FOUND error page for GAVEL.

Structure:
- Full-page centered layout on Off-white (#F8FAFC)
- Lucide "SearchX" icon, large, Slate Gray
- H1: "404"
- H3: "This page doesn't exist"
- Body text: "The page you're looking for may have moved, or the link might be
  outdated."
- Primary button: "Back to Home"
- Ghost button: "Look Up a Case"
```

### 9. 403 Access Denied Page
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the 403 — ACCESS DENIED page for GAVEL. Must match the 404 page's
spacing, icon size, and button styling exactly.

Structure:
- Same centered layout as 404
- Lucide "ShieldOff" icon
- H1: "403"
- H3: "You don't have access to this page"
- Body text: "This area is restricted to authorized roles. If you believe this is
  a mistake, contact your administrator."
- Primary button: "Back to Dashboard" (logged in) or "Back to Home" (public)
```

### 10. National Backlog Map
```
[PASTE CONSISTENCY PREAMBLE ABOVE]

Design the NATIONAL BACKLOG MAP page for GAVEL.

Structure:
- Navbar identical to landing page
- H2: "National Backlog Overview"
- Subheading: "Each state's color reflects the average alert severity of its
  awaiting-trial cases."
- Large interactive Nigeria states map, choropleth using the four-tier color ramp
  (Emerald/Amber/Orange/Crimson). Show Lagos as Orange, Kano as Amber, Rivers as
  Emerald, Enugu as Crimson, Kaduna as Amber, Ogun as Emerald, other states as
  neutral gray (no data)
- Legend below the map with all four tiers labeled exactly: Compliant, Warning,
  Severe Warning, Critical
- Side panel example when Lagos is selected: stat card "Lagos" — "Total Cases: 312",
  "Average Wait Time: 96 days", "Top Stall Reason: Court Adjournment", link
  "View Lagos Cases"
```

---

## Part 6 — Remaining Pages: Prompt Table with Real Content

For every other page: paste the Consistency Preamble, name the page, then paste both the "Structure" and "Content to include" notes below as your instructions. Every row gives real labels and sample data — nothing generic.

| # | Page | Structure & Content to include |
|---|---|---|
| 2 | About / How It Works | Same navbar/footer as landing. H1 "How GAVEL Works". 4-stage lifecycle graphic using exact stage names. Section "Why This Matters" citing: "64% of Nigeria's prison population is awaiting trial, some for over a decade, against a 28-day legal limit." |
| 4 | Case Not Found | Same empty-state pattern as 404. Lucide "FileX" icon. H3 "No case found with that ID". Text: "Double-check the Case Hash ID and try again." Button "Try Again". |
| 6 | Transparency Scorecard | H2 "Court & State Transparency Scorecard". Table columns: Rank, Court/State, Cases Tracked, Avg. Resolution Time, Compliance Rate. Sample rows: "1. Rivers State — 89 cases — 24 days avg — 91% compliant"; "2. Ogun State — 143 cases — 38 days avg — 78%"; "6. Lagos State — 312 cases — 96 days avg — 41%". Use status pill colors per compliance band. |
| 8 | Pro-Bono Interest Page | Landing-style, same navbar. H1 "Volunteer as Pro-Bono Counsel". Stat card: "312 unrepresented cases currently tracked". CTA "Create an Account". Section "How Matching Works" explaining filter-by-detention-duration + claim flow. |
| 9 | Watch This Case Confirmation | Small centered card. Emerald checkmark icon. H3 "You're Watching This Case". Text: "We'll email you if Case LA-2026-0483 changes status. We store nothing else." Button "Done". |
| 10 | FAQ | Accordion list, same navbar/footer. Sample questions: "Is any of this real data?", "How is privacy protected?", "What does 'Severe Warning' mean?", "Can I volunteer as a lawyer?" |
| 11 | Privacy Policy | Long-form text, sidebar table of contents: "What We Collect", "What We Never Collect", "Case Hash IDs vs. Personal Data", "Contact". |
| 12 | Terms of Use | Same layout as Privacy Policy. Sections: "Purpose of This Platform", "Synthetic Data Disclosure", "Acceptable Use". |
| 13 | Contact/Report Issue | Form fields: "Name (optional)", "Email", "Message". Button "Send Message". |
| 15 | Register (Volunteer) | Same card as Login. Fields: "Full Name", "Email", "Password", "Bar Credential Number". Button "Create Account". |
| 17 | Reset Password | Same card as Forgot Password. Fields: "New Password", "Confirm Password". Button "Reset Password". |
| 18 | Verify Email | Same success-state card. H3 "Verify Your Email". Text: "Check your inbox for a verification link." |
| 19 | 2FA/OTP Verification | Same card. H3 "Enter Verification Code". 6 individual digit boxes. Link "Resend Code". |
| 21 | Records Officer Dashboard | Same shell as Legal Aid Dashboard, officer "Ibrahim Musa". Table columns: Case Hash ID, File Location, Custody Status, Days Since Last Update, Action. Sample row: "LA-2026-0483 / Ikeja Records Office / In Custody / 3 days / Update". |
| 22 | Case List / All Cases | Same table pattern as dashboard, full-page. Filters: Stage, Alert Level, State, Court. Column set identical to dashboard table. |
| 24 | Add New Case | Form fields matching the data model exactly: Case Hash ID (auto-generated preview), State (dropdown), Court (dropdown), Offense Category (dropdown), Arrest Date, Remand Start Date, Assigned Counsel (optional), File Location. Button "Create Case". |
| 25 | Update Case Status | Modal. Fields: "New Stage" (dropdown of the 4 stages), "Stall Reason" (required dropdown, the 5 exact options), "Note" (textarea, required). Button "Save Update". |
| 26 | Bulk Import Cases | Dashed drop-zone, Lucide "UploadCloud" icon, text "Drag a CSV file here or click to browse". Preview table showing 3 sample parsed rows before confirming. Button "Import Cases". |
| 27 | Documents Manager | Grid of file cards. Sample files: "Arrest Report.pdf", "Bail Application.pdf". Each card shows a "Visible to: Legal Aid, Admin" tag. Button "Upload Document". |
| 28 | Notifications Center | Vertical list. Sample items: "Case LA-2026-0483 just crossed 90 days — 2 hours ago", "New document uploaded to KN-2025-1187 — Yesterday". Unread items highlighted with an Indigo dot. |
| 29 | Profile/Settings | Sidebar shell. Fields: "Full Name", "Email", "Change Password". Toggle switches: "Dark Mode", "Larger Text". |
| 30 | Admin Overview | Sidebar shell (Admin nav: Dashboard · Heatmap · Trends · Users · Reports · Audit Log). Stat cards: "Total Cases: 1,204", "Critical: 87", "Avg. Wait Time: 112 days". Embedded map + trend chart previews. |
| 31 | Bottleneck Heatmap | H2 "Where Cases Stall". Grid: rows = the 6 sample states, columns = the 5 stall reasons, cell color intensity uses the severity ramp. |
| 32 | Historical Trends | H2 "Backlog Over Time". Two line charts: "Total Awaiting-Trial Cases (last 12 months)" and "Average Wait Time (days, last 12 months)". |
| 33 | User Management | Table columns: Name, Email, Role, State, Status, Action. Role shown as a colored badge. Button "Invite User". |
| 34 | Export Reports | Form: "Data Range" (dropdown), "Format" (CSV / JSON / PDF radio buttons), "Scope" (dropdown: All States / Single State). Button "Generate Report". |
| 35 | System Audit Log | Table columns: Timestamp, User, Case Hash ID, Action, Note. Filter by user/case/date range. |
| 36 | Pro-Bono Case Browser | Sidebar shell (Volunteer nav: Browse Cases · My Claimed Cases). Card grid, each card shows Case Hash ID, Offense, Days Unrepresented, button "Claim Case". |
| 37 | My Claimed Cases | Same table pattern as officer dashboard, filtered to cases claimed by the current volunteer. |
| 38 | Demo Mode Landing | Landing-style page. H1 "Try the Demo". 4 role cards: "Public Observer", "Legal Aid Officer", "Records Officer", "Admin" — each with a one-line description and an "Enter as [Role]" button. |
| 40 | 500 Server Error | Same layout as 404. Lucide "ServerCrash" icon. H1 "500". H3 "Something went wrong on our end". Button "Back to Home". |
| 41 | Offline Page | Same layout as 404. Lucide "WifiOff" icon. H3 "You're offline". Text "Showing the last cached data where available." |
| 42 | Maintenance Page | Same layout as 404. Lucide "Wrench" icon. H3 "We'll be back shortly". Text "GAVEL is undergoing scheduled maintenance." |
| 43 | QR Code Case Slip | Print-friendly, minimal chrome. Large QR code centered, "LA-2026-0483" printed below in monospace, small text "Scan to check case status at GAVEL". |

---

## How to use this in Google Stitch — recommended flow

1. Generate the **Landing Page** first — this anchors the whole visual system in Stitch's memory for that project.
2. Generate **Login → Forgot Password → 404 → 403** next, in the same Stitch project/thread — these are your simplest consistency tests (matching centered-card and empty-state patterns).
3. Move to the **Public Case Lookup → Case Status Detail → National Backlog Map** — the emotional/visual core of the product.
4. Then the **internal dashboard shell** (Legal Aid Dashboard) once, since every other internal page reuses that same sidebar + top bar shell.
5. Work through the rest of Part 6's table in the order they appear in your build milestones, always pasting the Consistency Preamble first.
6. If Stitch ever produces a screen that drifts (wrong color, different icon style), don't accept it — regenerate with the preamble restated, rather than patching it, so drift doesn't compound across 44 screens.
