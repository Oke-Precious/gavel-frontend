# GAVEL Frontend

GAVEL is a civic-tech portfolio project for tracking awaiting-trial detention and court backlog patterns in Nigeria. The product is designed around privacy, dignity, and accountability: public users can follow case progress through a Case Hash ID, while authorized officers and administrators can manage case records, status updates, documents, analytics, and user access without exposing unnecessary personal data.

This repository contains the React frontend only. The backend is built and deployed separately, and all API calls are made through `src/services/api.js`.

## Project Purpose

Nigeria's awaiting-trial detention crisis is a structural justice problem: many people remain in custody for long periods before conviction, often because of missing files, delayed advice, adjournments, or lack of legal representation. GAVEL presents a privacy-safe interface for observing case delay, updating custody records, identifying bottlenecks, and helping volunteer lawyers find pro-bono cases.

The project uses realistic synthetic/demo data. It is not connected to real correctional, court, police, NGO, or government systems.

## Core Personas

- Public Observer: looks up a case by Case Hash ID and can watch a case for status changes.
- Volunteer Lawyer: registers publicly, browses available pro-bono cases, and claims representation opportunities.
- Legal Aid Officer: manages assigned caseloads and updates case progress.
- Records Officer: manages custody status, file location, documents, and case intake.
- Admin: reviews system-wide analytics, users, reports, heatmaps, trends, and contact messages.
- Super Admin: manages platform-level oversight, privileged user actions, and stricter user deletion flows.

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Lucide React icons
- Plain CSS
- Oxlint

Project rules:

- JavaScript only: `.js` and `.jsx` files.
- No TypeScript.
- Plain CSS only.
- No Tailwind.
- No CSS-in-JS.
- Frontend only. Do not add backend/server code to this repository.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then set the frontend API base URL in `.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain.example.com/api/v1
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview a production build:

```bash
npm run preview
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

## API Integration

All API helper functions live in:

```text
src/services/api.js
```

The shared Axios client lives in:

```text
src/services/axiosClient.js
```

Expected API response shape:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Error response shape:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

The frontend uses the backend prefix:

```text
/api/v1
```

Frontend env variables must be prefixed with `VITE_`, which means they are exposed to the browser bundle. Do not put credentials, private tokens, SMTP secrets, database URLs, JWT secrets, Brevo keys, or personal account passwords in this README, `.env.example`, or any committed source file.

## Main Routes

Public routes:

- `/` - Landing page
- `/about` - About / how it works
- `/faq` - FAQ
- `/privacy` - Privacy policy
- `/terms` - Terms of use
- `/contact` - Contact / report issue
- `/lookup` - Public Case Hash ID lookup
- `/lookup/:caseHashId` - Public case status detail
- `/lookup/:caseHashId/watch-confirmation` - Watch confirmation
- `/scorecard` - Transparency scorecard
- `/backlog-map` and `/map` - National backlog map

Auth routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/reset-password/:token`
- `/verify-email`
- `/verify-email/:token`
- `/email-verified`
- `/otp-verification`

Authenticated routes:

- `/dashboard` - Role-aware dashboard
- `/records-dashboard` - Records Officer dashboard
- `/cases` - Case list / all cases
- `/cases/new` - Add new case
- `/cases/bulk-import` - Bulk import cases
- `/cases/:id` - Internal case detail
- `/cases/:id/update-status` - Update case status
- `/cases/:id/documents` - Documents manager
- `/heatmap` and `/analytics` - Bottleneck heatmap
- `/trends` - Historical trends
- `/pro-bono` - Pro-bono case browser
- `/users` - User management
- `/contact-messages` - Admin contact inbox
- `/notifications` - Notifications center
- `/profile-settings` - Profile and settings
- `/super-admin` - Super Admin dashboard

## Feature Areas

- Public Case Hash ID lookup
- Public remand clock and case status view
- Watch This Case email subscription flow
- Volunteer lawyer registration
- Role-based dashboards
- Case list with filters
- Add, update, and audit case workflows
- Bulk CSV import
- Document manager
- Admin analytics overview
- Bottleneck heatmap
- Historical trends
- User management with suspend/reactivate flows
- Contact/report issue form and admin inbox
- Super Admin governance controls
- Responsive layouts for desktop, tablet, and mobile
- Keyboard-accessible forms, modals, and navigation

## Design System

The UI follows the locked design brief in `ui-ux-design-brief.md`.

Important design rules:

- Use the existing colors, spacing, typography, and components.
- Use Lucide line icons only.
- Reuse shared components before creating new ones.
- Preserve exact project terminology such as Case Hash ID, lifecycle stages, alert levels, and stall reasons.
- Keep screens calm, readable, and respectful of the subject matter.

## Privacy And Safety Notes

GAVEL is designed to avoid exposing personal case data publicly.

- Public lookup uses Case Hash ID, not names.
- Public views should show limited case status information.
- Watch subscriptions store only the watcher email and case reference needed for notifications.
- Demo content should remain synthetic.
- No real detainee, court, police, legal aid, or correctional data should be committed to the repo.

## Development Notes

When adding or changing pages:

- Build one page or feature at a time.
- Use existing shared components where possible.
- Add real network loading, success, empty, and error states.
- Keep role access aligned with `src/App.jsx`.
- Route all API work through `src/services/api.js`.
- Run `npm run lint` and `npm run build` before handoff when practical.
- Do not rename backend fields, lifecycle stages, alert labels, or stall reasons without updating the backend contract and documentation.

## Key Files

- `src/App.jsx` - route definitions and role guards
- `src/services/api.js` - API helper functions
- `src/services/axiosClient.js` - Axios configuration and auth refresh handling
- `src/context/AuthContext.jsx` - auth state
- `src/context/ToastContext.jsx` - toast notifications
- `src/layouts/PublicLayout.jsx` - public page shell
- `src/layouts/InternalLayout.jsx` - authenticated dashboard shell
- `project-plan.md` - product mission, personas, scope, and rationale
- `ui-ux-design-brief.md` - locked UI/UX system and page list
- `API_DOCUMENTATION.md` - backend API contract

## Status

This frontend is actively evolving as a portfolio-grade product. Some advanced roadmap items may be partially implemented or represented with synthetic/demo data until the backend contract supports the full workflow.
