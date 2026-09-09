# DRIVE — Vehicle Rental Management System

A full-stack vehicle rental platform: customers browse available cars and bikes,
book rentals for a date range, and staff manage the fleet, pickups, returns
(with damage/fuel checks), branches, and reports. The public landing page is a
cinematic black × orange experience; the app itself is a role-based dashboard.

## Team Details

| # | Name | Roll No | Department | Owned Modules |
|---|------|---------|------------|----------------|
| M1 | Annmarie Vinish | 2462041 | ADSE | Auth, Branches, Fleet, Availability Search |
| M2 | Anush Jowin A | 2462044 | ADSE | Booking, Pickup/Return Inspections, Status Flow |
| M3 | Avrel Leandra Pinto | 2462053 | ADSE | Pricing/Add-ons, Cancellation, History, Reports, RBAC |
| M4 | Aryan Sharma | 2462047 | ADSE | Schema sign-off, Postman, README, landing UI |

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js + Express.js 4 |
| Database | MongoDB with Mongoose ODM (or zero-config in-memory MongoDB, see below) |
| Auth     | JWT (`Authorization: Bearer <token>`) + bcrypt password hashing |
| Validation | express-validator, central `validate` middleware |
| Frontend | Vanilla HTML + CSS + JS, no build step, no framework |
| Fonts    | Plus Jakarta Sans (display) + Inter (body), via Google Fonts |

## Quick Start

```bash
npm install
npm start        # http://localhost:5000  (serves API + frontend)
```

`npm run dev` runs with `node --watch` for auto-reload during development.

On boot the server connects to MongoDB, serves `frontend/` statically, serves
`frontend/landing.html` at `/`, and opens the landing page in your browser.

### Environment (`.env`)

| Variable         | Example                                 | Notes |
|------------------|-----------------------------------------|-------|
| `PORT`           | `5000`                                  | API + frontend port |
| `MONGODB_URI`    | `memory` (default)                      | Use `memory` for an embedded DB with no setup, or a real URI like `mongodb://localhost:27017/vehicle_rental` |
| `JWT_SECRET`     | any long random string                  | Required for real deployments |
| `JWT_EXPIRES_IN` | `7d`                                    | Token lifetime |

Copy `.env.example` to `.env` and adjust. A `postman_collection.json`
(API base `http://localhost:5000/api`, with customer/staff/admin token
variables) is included for manual API testing.

---

## Backend

### Project Structure

```
server.js                 # Express app, static frontend, route mounting
config/db.js              # Mongoose connect (real URI or in-memory MongoDB)
middleware/auth.js        # JWT authentication (authenticate)
middleware/authorize.js   # Role check (authorize("admin", ...))
middleware/validate.js    # express-validator error handling
middleware/errorHandler.js# Central error formatter
utils/token.js            # JWT sign/verify helpers
routes/                   # auth, branches, vehicles, search, bookings, reports
controllers/              # Business logic per domain
models/                   # User, Branch, Vehicle, Booking, Inspection
frontend/                 # Static app (served by Express, no separate server)
```

### Roles & Access

| Role | Capabilities |
|------|--------------|
| `customer` | Register, browse/search, book, view own bookings, cancel, profile |
| `staff` | All fleet ops: vehicles CRUD (except delete), pickup/return inspections, reports |
| `admin` | Everything, plus vehicle delete, branch CRUD, all reports |

### API Endpoints

Base: `http://localhost:5000/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register (`name, email, password, role?`) | None |
| POST | `/auth/login` | Login, returns JWT + user | None |
| GET | `/auth/profile` | Current user profile | JWT |
| GET | `/branches` | List branches | None |
| GET | `/branches/:id` | Branch detail | None |
| POST | `/branches` | Create branch | Admin |
| PUT | `/branches/:id` | Update branch | Admin |
| DELETE | `/branches/:id` | Delete branch | Admin |
| GET | `/vehicles` | List vehicles | None |
| GET | `/vehicles/:id` | Vehicle detail | None |
| POST | `/vehicles` | Add vehicle | Admin/Staff |
| PUT | `/vehicles/:id` | Update vehicle | Admin/Staff |
| DELETE | `/vehicles/:id` | Delete vehicle | Admin |
| GET | `/vehicles/search` | Search available vehicles (date range, type, branch) | None |
| POST | `/bookings` | Create booking (`vehicleId, startDate, endDate, addOns?`) | Customer |
| GET | `/bookings/customer/:id` | Rental history | JWT |
| GET | `/bookings/:id` | Booking detail | JWT |
| POST | `/bookings/:id/pickup` | Record pickup (`odometer, fuelLevel`) | Staff/Admin |
| POST | `/bookings/:id/return` | Record return (`odometer, fuelLevel, damage?`) | Staff/Admin |
| POST | `/bookings/:id/cancel` | Cancel booking (policy engine applies) | JWT |
| GET | `/admin/reports/utilization` | Branch fleet utilization | Admin/Staff |
| GET | `/admin/reports/revenue` | Revenue by date range | Admin/Staff |

Unknown routes return `{ success: false, message: "Route not found", errorCode: "NOT_FOUND" }`.

### Database Schema

- **users** — `name, email, passwordHash, role (customer|staff|admin), branchId?`
- **branches** — `name, city, address, phone`
- **vehicles** — `branchId, type (car|bike), brand, model, year, licensePlate,
  perDayRate, status (available|booked|maintenance), fuelType
  (petrol|diesel|electric|hybrid), transmission (manual|automatic), seats`
- **bookings** — `customerId, vehicleId, branchId, startDate, endDate, status,
  baseRate, totalDays, addOns (insurance|driver|gps), totalAmount,
  cancellationCharge?`
- **inspections** — `bookingId, stage (pickup|return), odometer, fuelLevel,
  damageNotes, inspectedBy`

### Entity Relationships

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  users   │      │ branches │      │ vehicles │
│customer/ │──┐   │name, city│──┐   │type,model│
│staff/    │  │   └──────────┘  │   │rate,     │
│admin     │  │                 │   │status    │
└──────────┘  │   ┌──────────┐  │   └──────────┘
  │           ├──▶│ bookings │◀─┘         ▲
  │           │   │dates,    │◀───────────┘
  │           │   │status,   │
  │           │   │amount    │
  │           │   └──────────┘
  │           │         │
  │           │         ▼
  │           │   ┌──────────────┐
  │           └──▶│ inspections  │
  └──────────────▶│pickup/return │
     inspectedBy  └──────────────┘
```

- One **branch** has many **vehicles** and many **bookings** (one-to-many).
- One **user** (customer) has many **bookings**; one **booking** belongs to one
  customer, one vehicle, one branch (many-to-one).
- One **booking** has up to two **inspections** (pickup + return, one-to-many).
- Staff link in via `inspectedBy` and optional `branchId` (many-to-one).

### Reference vs Embed Decisions

Rule followed: embed data always read with its parent and rarely updated alone;
reference data shared across documents or updated independently.

| Decision | Reasoning |
|----------|-----------|
| `addOns[]` **embedded** in Booking | Add-ons are only ever read as part of the booking price breakdown and are snapshotted at booking time (price changes later must not rewrite history) |
| Everything else **referenced** (ObjectIds) | Users, branches, and vehicles are shared across many bookings and updated independently (e.g. vehicle status flips `available ↔ booked`); embedding would duplicate and stale them |
| No `$lookup` chains in hot paths | Reads use Mongoose `populate` on single refs; the only aggregations (`$lookup` ×2 in reports) are confined to the admin reporting controller |

### Booking Status Flow

```
reserved → picked_up → returned
reserved → cancelled
```

### Cancellation Policy

- More than 48 hours before pickup: no charge
- 24–48 hours before pickup: 25% charge
- Less than 24 hours before pickup: 50% charge
- After pickup: 50% charge

---

## Frontend

No build step — Express serves `frontend/` statically, and every page talks to
the API above via `fetch`. Open `http://localhost:5000/` for the landing page.

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| `landing.html` | `/` | Cinematic marketing + booking search entry (public) |
| `index.html` | `/index.html` | Login (JWT issued, stored in `localStorage`) |
| `register.html` | `/register.html` | Customer/staff registration |
| `dashboard.html` | `/dashboard.html` | Role-based home (stats, shortcuts) |
| `vehicles.html` | `/vehicles.html` | Browse + filter fleet (`?startDate=&endDate=&type=&city=`) |
| `booking.html` | `/booking.html?vehicleId=&start=&end=` | Confirm booking (add-ons, price breakdown) |
| `my-bookings.html` | `/my-bookings.html` | Customer rental history + cancel |
| `booking-detail.html` | `/booking-detail.html?id=` | Single booking timeline + actions |
| `manage-vehicles.html` | `/manage-vehicles.html` | Fleet CRUD (staff/admin) |
| `pickup.html` | `/pickup.html` | Pickup inspection: odometer + fuel (staff/admin) |
| `return.html` | `/return.html` | Return inspection: odometer + fuel + damage (staff/admin) |
| `branches.html` | `/branches.html` | Branch CRUD (admin) |
| `reports.html` | `/reports.html` | Utilization + revenue reports (staff/admin) |
| `profile.html` | `/profile.html` | View/update own profile |

Every app page guards itself: unauthenticated users are sent to `index.html`,
and `requireRole(...)` redirects users without the right role to the dashboard.

### Shared Frontend Modules (`frontend/js/`)

| File | Provides |
|------|----------|
| `api.js` | `API_BASE`, `getToken/setToken`, `getUser/setUser`, `isAuthenticated`, `requireAuth`, `requireRole`, `apiFetch` (auto JWT header, 401 → logout), `showAlert`, `formatDate`, `formatCurrency` |
| `navbar.js` | `buildLayout(activePage)` sidebar + topbar, role-based nav items, `handleLogout` |
| `utils.js` | `showToast`, `animateCounter`, `initRevealAnimations`, skeleton generators |
| `landing.js` | Landing-page engine (see below) |

Auth state lives in `localStorage` (`drive_token`, `drive_user`); the landing
search persists its last query in `drive_search` and reuses it for booking links.

### Page → API Mapping (key flows)

- Landing featured fleet → `GET /vehicles` (available first, demo fallback offline)
- Landing locations → `GET /branches` grouped by city
- Search widget → validates city + date range → guests to login, users to
  `vehicles.html?startDate=&endDate=[&type=]`
- Vehicle search → `GET /vehicles/search`
- Booking confirm → `POST /bookings` → detail page
- Pickup/Return → `POST /bookings/:id/pickup|return`
- Reports → `GET /admin/reports/utilization|revenue`

### Landing Design System (`css/landing.css`, ~45 KB)

- **Theme:** deep black `#050505 / #0D0D0D`, surfaces `#151515 / #1C1C1C`,
  accent `#FF5A1F → #FF6B2C`, text `#FFFFFF`, muted `#A1A1AA`,
  borders `rgba(255,255,255,0.08)`. Orange is reserved for CTAs, active
  states, key numbers, and indicators — never whole surfaces.
- **Type:** Plus Jakarta Sans 800, uppercase, tight tracking for display;
  Inter for body. Massive hero (`clamp(3rem, 9vw, 6.8rem)`).
- **Signature moments:** 1.2s loader (black → brand → orange line → hero
  reveal), line-by-line hero typography, glass booking widget, scroll-driven
  horizontal showcase, scroll-filled How-It-Works timeline, parallax cinematic
  banner, always-on ambient canvas (drifting amber glow, headlight streaks,
  embers), custom cursor with `VIEW RIDE` state on vehicle cards, magnetic
  CTAs, film grain, 430ms page-transition sweep.
- **Accessibility & performance:** visible focus rings, semantic landmarks,
  `prefers-reduced-motion` disables all heavy motion, cursor/parallax gated to
  fine pointers, transforms + opacity + `IntersectionObserver` only, lazy
  images, no animation libraries.

---

## Known Limitations

- Single currency (INR) and single time zone; no multi-locale support.
- Payments, SMS/email, and maps are out of scope (no payment gateway
  integration — booking confirmation is the purchase record).
- Damage charge is a flat ₹500 + fuel-difference top-up, not a workshop estimate.
- No automated tests; verification is via the Postman collection and the demo flow.
- In-memory (`MONGODB_URI=memory`) data does not persist across restarts — use a
  real MongoDB URI for persistent deployments.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `MongoDB connection error` | Set `MONGODB_URI=memory` for embedded DB, or start local MongoDB / use Atlas URI |
| Landing shows demo vehicles | API unreachable — check the server is running on `PORT` (frontend calls `http://localhost:5000/api`) |
| Redirected to login on every page | Token expired/cleared — log in again; check `JWT_SECRET` is stable across restarts |
| Port in use | Change `PORT` in `.env` (and `API_BASE` in `frontend/js/api.js` must match) |
