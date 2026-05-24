# YogaAI Backend

Node.js + Express + SQLite + JWT API for the YogaAI platform.

## Features

- **Auth** — register / login / token refresh / logout (JWT access + refresh tokens, bcrypt password hashing)
- **Sessions** — save and retrieve yoga session records per user
- **Stats** — aggregate progress (totals, weekly buckets, per-pose breakdown)
- **Achievements** — track unlocked achievements per user
- **Live classes (WebSocket)** — `/ws/studio` for studio displays + student devices to sync in real time
- **SQLite** — zero-config persistence; swap to PostgreSQL later by changing one file

## Quick Start

```bash
cd backend
cp .env.example .env
# (edit .env – at minimum set a strong JWT_SECRET in production)

npm install
npm run dev
# → http://localhost:3001
```

The SQLite file is created automatically at `./data/yoga.db` on first run.

## Environment Variables

| Name | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port |
| `NODE_ENV` | `development` | `development` or `production` |
| `JWT_SECRET` | dev-only fallback | **Required in production.** Generate with `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime (zeit/ms format) |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Comma-separated allowed origins |
| `DATABASE_PATH` | `./data/yoga.db` | SQLite file location |

## API Reference

### Auth

```
POST /api/auth/register           { email, password, name }
POST /api/auth/login              { email, password }
POST /api/auth/refresh            { refreshToken }
POST /api/auth/logout             { refreshToken }
```

All return `{ user, accessToken, refreshToken }` (login + register) or `{ accessToken, refreshToken }` (refresh).

### User

```
GET    /api/users/me              auth required
PATCH  /api/users/me              { name?, avatar? }
DELETE /api/users/me              cascades all user data + tokens
```

### Sessions

```
POST   /api/sessions              save a finished session
GET    /api/sessions?limit=20&offset=0&pose=Downdog
GET    /api/sessions/:id
DELETE /api/sessions/:id
```

`POST` body shape:

```json
{
  "pose": "Downdog",
  "startedAt": 1716567890000,
  "endedAt":   1716567950000,
  "avgScore": 78,
  "maxScore": 92,
  "minScore": 45,
  "totalFrames": 600,
  "perfectFrames": 80,
  "goodFrames": 240,
  "captureCount": 5,
  "metadata": { "captures": [...] }
}
```

### Stats

```
GET /api/stats                    summary { totalSessions, totalPracticeSec, avgScore, maxScore, ... }
GET /api/stats/weekly             { days: [{ date, sessions, avgScore }] x 7 }
GET /api/stats/poses              { poses: [{ pose, sessions, avgScore, maxScore, totalSec }] }
```

### Achievements

```
GET  /api/achievements            { achievements: [{ achievementId, unlockedAt }] }
POST /api/achievements/unlock     { achievementId }   idempotent
```

### WebSocket — Live Class

```
ws://localhost:3001/ws/studio?classId=ABC123&role=host&token=<jwt>&name=Studio
ws://localhost:3001/ws/studio?classId=ABC123&role=student&name=Anika
```

Server -> client events: `room:snapshot`, `participant:joined`, `participant:left`, `class:start`, `class:pose`, `class:pause`, `class:resume`, `class:end`, `student:score`, `celebration`.

Client -> server events (host only for class control): same shapes, see `src/ws/studio.ts`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Hot-reload TypeScript via `tsx watch` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled JS (production) |
| `npm run typecheck` | TypeScript only, no emit |

## Deployment

The simplest path:

1. **Railway / Render / Fly.io** — point at this folder, set env vars, done. Each gives you a public URL.
2. **VPS (DigitalOcean droplet, EC2)** — `npm run build && npm start` behind nginx + systemd.
3. **Database upgrade** — when ready, replace better-sqlite3 with `pg` (PostgreSQL) and the supported managed services (Supabase, Neon, RDS). Schema in `db.ts` is portable.

## Project Structure

```
backend/
├── src/
│   ├── index.ts            Express app entry + WS attach
│   ├── config.ts           env vars (refuses default JWT_SECRET in production)
│   ├── db.ts               SQLite schema + typed row interfaces
│   ├── auth/
│   │   ├── jwt.ts          access + refresh token helpers
│   │   └── routes.ts       register / login / refresh / logout
│   ├── middleware/
│   │   └── auth.ts         requireAuth + optionalAuth
│   ├── routes/
│   │   ├── users.ts        /api/users/me CRUD
│   │   ├── sessions.ts     /api/sessions CRUD
│   │   ├── stats.ts        /api/stats aggregates
│   │   └── achievements.ts /api/achievements
│   └── ws/
│       └── studio.ts       /ws/studio live-class server
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```
