# TutorCRM

A full-stack CRM and Lead Management System for a home tuition agency based in Lucknow, India. Designed for agencies that source tutors, manage parent enquiries, schedule demos, and track payments — all from one place.

---

## Live Demo

**URL:** Deployed via Replit  
**Default login:** `admin@tutors.in` / `admin123`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tutors.in | admin123 |
| Parent Success Executive | priya@tutors.in | priya123 |
| Tutor Acquisition Executive | rahul@tutors.in | rahul123 |

---

## Features

### Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Live KPIs — total leads, active requirements, demos, revenue. Charts: lead sources, monthly revenue, pipeline funnel |
| **Lead Pipeline** | Kanban board with 7 stages: New → Contacted → Qualified → Demo Scheduled → Demo Done → Converted → Lost |
| **Parents / Leads** | Searchable parent directory with lead source tracking, status history, and executive assignment |
| **Tutors** | Full tutor database — qualifications, subjects, preferred areas, grades, teaching mode, availability status |
| **Requirements Board** | Tuition requests posted by parents; matched with tutors via applications |
| **Applications** | Tutors apply to open requirements; admins track application stage |
| **Demo Tracker** | Schedule, manage, and record feedback on demo sessions between tutors and parents |
| **Payments** | Record and track registration fees and monthly tuition payments; auto-converts leads on payment |
| **Staff Management** | Admin-only — create staff accounts with role assignment |
| **Public Board** | `/board` — public-facing tuition requirements listing for tutors to browse and apply |

### Role-Based Access Control

| Feature | Admin | Parent Success Exec | Tutor Acquisition Exec |
|---------|:-----:|:-------------------:|:----------------------:|
| Dashboard | ✅ | ✅ | ✅ |
| Lead Pipeline | ✅ | ✅ | ❌ |
| Parents | ✅ | ✅ | ❌ |
| Tutors | ✅ | ❌ | ✅ |
| Requirements | ✅ | ✅ | ✅ |
| Demos | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ❌ |
| Staff | ✅ | ❌ | ❌ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Animations | Framer Motion |
| Routing | Wouter |
| Data Fetching | TanStack Query (React Query) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (via `drizzle-zod` + Orval codegen) |
| API Contract | OpenAPI 3.0 → Orval (auto-generates React hooks + Zod schemas) |
| Logging | Pino |
| Package Manager | pnpm workspaces (monorepo) |

---

## Project Structure

```
tutorcrm/
├── artifacts/
│   ├── tutor-crm/          # React frontend (Vite)
│   │   └── src/
│   │       ├── pages/      # All page components
│   │       ├── components/ # Shared UI components
│   │       └── hooks/      # Custom hooks
│   └── api-server/         # Express REST API
│       └── src/
│           ├── routes/     # Route handlers (auth, parents, tutors, etc.)
│           └── index.ts    # Server entry point
├── lib/
│   ├── db/                 # Drizzle ORM schema + migrations
│   │   └── src/schema/     # Table definitions
│   ├── api-spec/           # OpenAPI spec (source of truth)
│   │   └── openapi.yaml
│   ├── api-client-react/   # Generated React Query hooks (do not edit)
│   └── api-zod/            # Generated Zod schemas (do not edit)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Database Schema

| Table | Key Fields |
|-------|-----------|
| `staff` | id, name, email, password_hash, role |
| `parents` | id, name, phone, email, area, city, lead_source, status, assigned_to, notes |
| `tutors` | id, name, phone, qualifications, subjects[], areas[], grades[], teaching_mode, status |
| `requirements` | id, parent_id, subject, grade, area, budget, teaching_mode, status |
| `applications` | id, tutor_id, requirement_id, status, message |
| `demos` | id, tutor_id, parent_id, requirement_id, scheduled_at, status, feedback |
| `payments` | id, parent_id, tutor_id, type, amount, status, paid_at |

---

## API Endpoints

All routes are prefixed with `/api`.

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/stats
GET    /api/dashboard/lead-sources
GET    /api/dashboard/revenue
GET    /api/dashboard/pipeline

GET    /api/leads
PATCH  /api/leads/:id/status
GET    /api/parents
POST   /api/parents
PATCH  /api/parents/:id

GET    /api/tutors
POST   /api/tutors
GET    /api/tutors/:id
PATCH  /api/tutors/:id

GET    /api/requirements
POST   /api/requirements
GET    /api/requirements/:id
PATCH  /api/requirements/:id
GET    /api/requirements/:id/applications

POST   /api/applications

GET    /api/demos
POST   /api/demos
PATCH  /api/demos/:id

GET    /api/payments
POST   /api/payments
PATCH  /api/payments/:id

GET    /api/staff
POST   /api/staff
```

---

## Getting Started (Local / Replit)

### Prerequisites
- Node.js 24+
- pnpm 10+
- PostgreSQL (auto-provisioned on Replit)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session signing |

### Commands

```bash
# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (auto-assigned port)
pnpm --filter @workspace/tutor-crm run dev

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Regenerate API hooks + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Full typecheck
pnpm run typecheck

# Build all packages
pnpm run build
```

### Seeded Sample Data

After running `push`, seed sample data to explore the system:

- **3 staff accounts** (1 admin, 1 PSE, 1 TAE)
- **8 parents** across Lucknow areas (Gomti Nagar, Hazratganj, Aliganj, Indira Nagar, etc.)
- **5 tutors** with various subjects and grades
- **3 open requirements**

---

## Development Notes

- **OpenAPI is the source of truth** — edit `lib/api-spec/openapi.yaml`, then run `codegen` to regenerate hooks and schemas. Never hand-edit files under `lib/api-client-react/` or `lib/api-zod/`.
- **Import hooks only from the package root** — `import { useListParents } from "@workspace/api-client-react"`. Never import from deep subpaths like `.../src/generated/...`.
- **Never use `console.log` in server code** — use `req.log` in route handlers and the `logger` singleton elsewhere (Pino).
- **Auth token** — stored in `localStorage` as `tutorcrm_user`. Format: `base64(id:role)`.
- **DB push vs migrate** — `pnpm --filter @workspace/db run push` is for development only. Use proper migrations for production.

---

## Roadmap / Planned Features

- [ ] WhatsApp / SMS notifications on demo scheduling and lead status changes
- [ ] Tutor–parent matching engine based on subject, area, and budget
- [ ] Bulk CSV import for parents and tutors
- [ ] Invoice generation for monthly fee payments
- [ ] Mobile-responsive admin app (Expo / React Native)
- [ ] Audit log for all status changes
