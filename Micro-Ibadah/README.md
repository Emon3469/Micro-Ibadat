# Micro-Ibadah (MVP)

Tagline: **Busy schedule. Small deeds. Big consistency.**

## Stack
- **Frontend:** React + Vite + Tailwind CSS v4 + shadcn-style UI components
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose

## Implemented MVP Modules
- Daily routine slot selection (2/5/10 minute blocks)
- Qur'an reading calculator with completion estimate and pace text
- Smart dua list (short Arabic + meaning)
- Progress check-in + streak-based consistency score
- Basic leaderboard (consistency-first)

## Project Structure
- `client/` React frontend
- `server/` Express + Mongo API

## Run Locally
### 1) Backend
```bash
cd server
cp .env.example .env
# set MONGO_URI if needed
npm install
npm run dev
```

### 2) Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Docker (PM2 + Nginx)

This project is dockerized with:
- `server/` on Node + **PM2 runtime**
- `client/` built by Vite and served by **Nginx**

### 1) Prepare server env
Create `server/.env` (if missing):

```bash
cd server
cp .env.example .env
```

Make sure `MONGO_URI` is valid.

### 2) Build and run all services
From project root:

```bash
docker compose up --build -d
```

### 3) Access
- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:5000/api/health`

### 4) Logs / stop
```bash
docker compose logs -f
docker compose down
```

## Deployment Recommendation

### Best fit: **Render + MongoDB Atlas**
- Easy Docker deploy for both frontend and backend.
- Good balance of simplicity, reliability, and team onboarding.
- Keep MongoDB on Atlas (managed, secure, production-ready).

### Suggested setup
- Deploy `server` as a Render Web Service (Docker from `server/Dockerfile`).
- Deploy `client` as a separate Render Web Service (Docker from `client/Dockerfile`) or Static Site.
- Set `CLIENT_URL` on backend to your frontend domain.
- Keep `MONGO_URI` only in platform environment variables.

## API Endpoints
- `POST /api/auth/student`
- `PUT /api/routines/:userId`
- `GET /api/routines/:userId`
- `POST /api/quran/calculate`
- `GET /api/duas`
- `POST /api/progress/check-in/:userId`
- `GET /api/progress/dashboard/:userId`
- `GET /api/leaderboard`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
