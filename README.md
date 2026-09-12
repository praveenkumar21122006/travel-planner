# Travel Planner

A self-contained React/Vite travel planner with local trip saving, route previews,
safety advisories, attractions, and itinerary tools. It runs without PostgreSQL,
API keys, or a separate backend process.

## Architecture

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # User, Trip, Activity models
│   ├── src/
│   │   ├── app.ts                # Express app + middleware
│   │   ├── index.ts              # Server entry point
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification middleware
│   │   │   └── error.ts          # HttpError, asyncHandler, errorHandler
│   │   ├── routes/
│   │   │   ├── auth.ts           # Register, Login, Validate Token
│   │   │   ├── trips.ts          # CRUD trips (authenticated)
│   │   │   ├── activities.ts     # CRUD activities per trip
│   │   │   ├── weather.ts        # OpenWeatherMap 5-day forecast proxy
│   │   │   └── cities.ts         # City autocomplete (Amadeus → GeoNames → embedded)
│   │   ├── services/
│   │   │   ├── auth.service.ts   # Password hashing + JWT sign/verify
│   │   │   ├── weather.service.ts# OpenWeatherMap API integration
│   │   │   └── city.service.ts   # Amadeus/GeoNames/embedded city search
│   │   └── types/
│   │       ├── index.ts          # Shared backend types
│   │       └── weather.ts        # Weather + CitySuggestion interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # App bootstrap
│   │   ├── App.tsx               # Route definitions
│   │   ├── index.css             # Tailwind v4 import
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state + login/register/logout
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx # Hero search + trip cards grid
│   │   │   └── ItineraryPage.tsx # Split-pane itinerary builder
│   │   ├── components/
│   │   │   ├── Sidebar.tsx       # Desktop navigation
│   │   │   ├── CitySearch.tsx    # Debounced autocomplete
│   │   │   ├── TripCard.tsx      # Trip preview card
│   │   │   ├── WeatherBadge.tsx  # Live 5-day forecast badge
│   │   │   ├── NewTripModal.tsx  # Create trip form
│   │   │   ├── DaySection.tsx    # Day timeline with time slots
│   │   │   ├── ActivityCard.tsx  # Single activity card
│   │   │   ├── ActivityFormModal.tsx # Add/edit activity
│   │   │   └── MapPanel.tsx      # Interactive route map placeholder
│   │   ├── services/
│   │   │   └── api.ts            # Authenticated API client
│   │   ├── hooks/
│   │   │   └── useDebouncedValue.ts
│   │   └── types/
│   │       └── index.ts          # Shared frontend types
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts            # Vite + Tailwind v4 plugin + API proxy
│   ├── index.html
│   └── .env.example
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Node.js | ≥ 18 | Runtime |

---

## Quick Start

### 1. Database

Create the PostgreSQL database, then run Prisma migrations:

```bash
cd backend

# Create the database (run as postgres user)
The Vite dev server proxies `/api/*` requests to `http://localhost:3001`.
npm install --prefix frontend

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|

The root scripts proxy to the frontend package. Trips are stored in browser
localStorage, so the app is usable immediately after startup.
| POST | `/api/auth/validate` | ✅ | Validate token |
| GET | `/api/trips` | ✅ | List user's trips |
| GET | `/api/trips/:id` | ✅ | Get trip with activities |
| POST | `/api/trips` | ✅ | Create trip |
| PATCH | `/api/trips/:id` | ✅ | Update trip |
| DELETE | `/api/trips/:id` | ✅ | Delete trip |
| GET | `/api/trips/:id/activities` | ✅ | List activities |
| POST | `/api/trips/:id/activities` | ✅ | Add activity |
| PATCH | `/api/trips/:id/activities/:aid` | ✅ | Update activity |
| DELETE | `/api/trips/:id/activities/:aid` | ✅ | Delete activity |
| GET | `/api/weather/forecast?city=X&days=5` | ✅ | 5-day weather forecast |
| GET | `/api/cities/autocomplete?q=X` | ✅ | City search suggestions |

---

## Database Schema

```prisma
User ──< Trip ──< Activity

User      id, email, passwordHash, createdAt
Trip      id, userId (FK → User), destinationCity, country, startDate, endDate, createdAt
Activity  id, tripId (FK → Trip), dayNumber, timeSlot, title, description, createdAt
```

All foreign keys use `onDelete: Cascade` — deleting a user removes their trips, and deleting a trip removes its activities.

---

## Production Build

```bash
cd backend
npm run build
npm start          # runs dist/index.js

cd frontend
npm run build      # outputs to frontend/dist/
```

Serve `frontend/dist/` with any static file server. Update the Vite proxy or configure a reverse proxy (nginx) to route `/api` requests to the Express backend.
