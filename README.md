# Micro-Ibadah

Busy schedule. Small deeds. Big consistency.

Micro-Ibadah is an open-source Ramadan companion focused on tiny, repeatable spiritual habits: routines, Qur'an tracking, dua, dhikr, journaling, challenges, group accountability, and gamified progress.

---

## 1) Tech Stack

### Frontend (`client/`)
- React 19 + Vite
- React Router
- Tailwind CSS v4 + daisyUI
- Framer Motion
- Axios

### Backend (`server/`)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Modular route-based API

### Deployment
- Docker + Docker Compose
- Nginx (client container)
- PM2 runtime options included for production workflows

---

## 2) Monorepo Structure (At a Glance)

```text
Micro-Ibadah/
├─ client/                         # React app (UI)
│  ├─ src/
│  │  ├─ components/               # Shared UI + feature components
│  │  ├─ context/                  # Auth context
│  │  ├─ pages/                    # Route pages (Dashboard, Dua, Quran, etc.)
│  │  ├─ services/api.js           # Central API layer
│  │  ├─ App.jsx                   # Routes + guards
│  │  └─ index.css                 # Global styles + themes
│  ├─ Dockerfile
│  └─ package.json
├─ server/                         # Express API
│  ├─ src/
│  │  ├─ config/                   # DB connection
│  │  ├─ data/                     # Static seed-like data (e.g., duas)
│  │  ├─ middleware/               # Auth middleware
│  │  ├─ models/                   # Mongoose models
│  │  ├─ routes/                   # API route modules
│  │  ├─ app.js                    # Express app + route wiring
│  │  └─ server.js                 # App bootstrap
│  ├─ Dockerfile
│  └─ package.json
├─ docker-compose.yml              # Local multi-service setup
└─ README.md
```

---

## 3) Core Product Modules

- Auth + onboarding
- Dashboard + daily check-ins
- Adaptive routine slots
- Qur'an calculator + tracker
- Dua library + community dua board
- Dhikr/tasbih tracking
- Ramadan map + progress visualizations
- Challenges + group circles
- RPG/gamification (XP, levels, badges)
- Journal/reflections
- Admin controls (settings, prayer times, broadcast content)

---

## 4) Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)

### Step A: Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set valid values (especially `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Step B: Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Build Checks

```bash
cd client && npm run build
cd ../server && npm start
```

---

## 5) Environment Variables

### Server (`server/.env`)

Minimum expected keys:

```dotenv
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<strong-random-secret>
CLIENT_URL=http://localhost:5173
```

### Client

Optional:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

If not provided, client defaults to `http://localhost:5000/api`.

---

## 6) API Surface (High-Level)

This is a route-group index for contributors. See route files in `server/src/routes/` for full contracts.

- `/api/auth` → register/login/me/onboarding
- `/api/progress` → dashboard, check-in, tasbih, reflections, taraweeh, shawwal, eid-card
- `/api/quran` → calculator + tracker
- `/api/duas` → dua library
- `/api/dua-board` → community anonymous dua board (with TTL)
- `/api/routines` → routine CRUD
- `/api/groups` → group create/join/details/user groups
- `/api/challenges` → challenge lifecycle/progress
- `/api/rpg` → profile + badge logic
- `/api/journal` → prompts + entries
- `/api/ai-coach` → adaptive suggestions/chat responses
- `/api/admin` → settings and admin-facing controls

Health check:

- `GET /api/health`

---

## 7) Docker Setup

From repo root:

```bash
docker compose up --build -d
```

Services:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

Useful commands:

```bash
docker compose logs -f
docker compose down
```

---

## 8) Contribution Guide (Open Source)

We welcome contributors of all levels.

### Workflow
1. Fork the repository.
2. Create a feature branch:
   - `feat/<short-description>`
   - `fix/<short-description>`
3. Make focused, minimal changes.
4. Run local checks (`client` build at minimum).
5. Open a PR with:
   - Clear summary
   - Screenshots/GIF for UI changes
   - Testing notes
   - Any migration or env-var changes

### Coding Expectations
- Keep changes scoped and readable.
- Preserve existing naming/style patterns.
- Avoid unrelated refactors in the same PR.
- Update docs when behavior or setup changes.

### Suggested PR Checklist
- [ ] Feature/fix works locally
- [ ] `client` builds successfully
- [ ] No obvious runtime errors in console/server logs
- [ ] README/docs updated if needed
- [ ] API changes documented in PR description

---

## 9) Where to Start as a New Contributor

- UI issues: start in `client/src/pages` and `client/src/components`
- API issues: start in `server/src/routes` and `server/src/models`
- Auth/session bugs: `client/src/context/AuthContext.jsx` + `server/src/routes/authRoutes.js`
- Theme/UX bugs: `client/src/index.css` + layout/page wrappers

Good first contribution ideas:
- Improve loading/error states
- Add small tests and validation guards
- Tighten accessibility (labels, contrast, keyboard flow)
- Improve mobile responsiveness on complex pages

---

## 10) Security Note

Never commit real credentials or production secrets to the repository.

If sensitive values were ever committed previously, rotate them immediately and replace with placeholders in tracked files.

---

## 11) License

Add your project license here (for example, MIT) to clarify open-source usage rights.
