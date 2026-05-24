# YogaAI 🧘‍♀️

> An AI-powered yoga platform with real-time pose correction, big-screen Studio Mode for classes, and cloud-synced personal practice.

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-pink)](https://nishikantchandra.github.io/yoga/)
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## What is this?

YogaAI is a full-stack web application that uses your webcam + TensorFlow.js (MoveNet Thunder) to detect 17 body keypoints in real time, score your alignment against reference poses, and give you visual + voice feedback as you practice.

It runs in **three modes**:

| Mode | For | Where |
|---|---|---|
| 🏟️ **Studio Mode** | Yoga studios & instructors | Big-screen TV / projector for guided classes with auto-advancing pose sequences |
| 🧘 **Personal Practice** | Individual practitioners | Laptop / phone for self-guided sessions with detailed reports |
| 🎛️ **Instructor Dashboard** | Studio owners | (coming) class management, student rosters, analytics |

All AI inference runs **100% in the browser** — your video never leaves your device.

---

## Repository structure

This is a monorepo with two top-level apps:

```
yoga/
├── frontend root files (this folder)   ← React + Vite + TensorFlow.js app
│   ├── src/
│   │   ├── pages/             HomePage, StudioPage, PracticePage, DashboardPage
│   │   ├── components/        Studio mode + auth UI + existing yoga components
│   │   ├── services/          api/auth/session/stats clients
│   │   ├── store/             AuthContext (React)
│   │   ├── hooks/             useWebcam, usePoseDetection, useHashRoute
│   │   ├── utils/             angle math, pose definitions, drawing
│   │   └── data/              class sequence presets
│   ├── public/poses/          reference pose images
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  ← Node.js + Express + SQLite API server
│   ├── src/
│   │   ├── auth/              register / login / refresh / JWT helpers
│   │   ├── routes/            /api/users, /sessions, /stats, /achievements
│   │   ├── ws/                /ws/studio live-class WebSocket server
│   │   ├── middleware/        requireAuth, optionalAuth
│   │   ├── db.ts              SQLite schema (4 tables) + typed rows
│   │   ├── config.ts          env loader (refuses default JWT_SECRET in prod)
│   │   └── index.ts           server entry
│   ├── package.json
│   └── README.md              ← detailed API reference & deployment notes
│
├── DATASET/ TRAIN/ TEST/      original yoga pose dataset (used to train classifier)
├── train_model.py             MobileNetV2 transfer-learning script
└── TRAINING_GUIDE.md          how to train a custom model
```

---

## Quick start (local development)

### Option A — frontend only (offline mode)

The fastest way to try the app. No backend needed; uses localStorage.

```bash
git clone https://github.com/nishikantchandra/yoga.git
cd yoga
npm install
npm run dev
# → http://localhost:5173
```

### Option B — full stack (frontend + backend)

Run both servers in two terminals.

```bash
# Terminal 1: backend
cd backend
cp .env.example .env
npm install
npm run dev
# → http://localhost:3001

# Terminal 2: frontend (in repo root)
cp .env.example .env.local
echo "VITE_API_URL=http://localhost:3001" >> .env.local
npm install
npm run dev
# → http://localhost:5173
```

The `Sign in` / `Get started` buttons in the header will now create real accounts. Sessions and achievements sync to the cloud automatically.

---

## Environment variables

### Frontend (`.env.local`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | _(empty)_ | If set, the app talks to this backend. **Leave empty for fully offline mode.** |

### Backend (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | HTTP port |
| `NODE_ENV` | `development` | Switch refuses default JWT_SECRET in `production` |
| `JWT_SECRET` | dev fallback | **Required in prod.** Generate with `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Comma-separated allowed origins |
| `DATABASE_PATH` | `./data/yoga.db` | SQLite file path |

See `backend/README.md` for the full backend API reference.

---

## Available scripts

### Frontend (repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check + build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run deploy` | Deploy `dist/` to GitHub Pages (manual) |

### Backend (`cd backend`)

| Command | What it does |
|---|---|
| `npm run dev` | Hot-reload TypeScript via `tsx watch` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled JS |
| `npm run typecheck` | TypeScript only, no emit |

---

## Architecture

```
                        ┌─────────────────────────────┐
   Browser              │   Frontend (React + Vite)    │
  (Camera + AI)  ◄──────►   - Studio Mode (big screen) │
                        │   - Personal Practice         │
                        │   - Auth UI                   │
                        │   - TensorFlow.js MoveNet     │
                        └────────────┬─────────────────┘
                                     │ HTTPS / WS
                                     ▼
                        ┌─────────────────────────────┐
                        │   Backend (Express + Node)   │
                        │   - JWT auth (access+refresh)│
                        │   - Sessions / Stats / Users │
                        │   - WebSocket /ws/studio     │
                        └────────────┬─────────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────────┐
                        │   SQLite (dev)               │
                        │   PostgreSQL (prod-ready)    │
                        └─────────────────────────────┘
```

### Privacy & local-first design

- The **AI runs in the browser**: your camera feed is never uploaded.
- The frontend works **fully offline**. localStorage holds your sessions and achievements.
- When a backend is configured + you sign in, sessions sync transparently. Anything that fails to upload is queued locally and retried on next login.
- Only **aggregates and metadata** are sent to the backend — never raw images or video frames.

---

## Deployment

### Frontend → GitHub Pages (already configured)

Push to `main` → `.github/workflows/deploy.yml` builds and deploys automatically.

For other static hosts (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
# upload `dist/` to your host
```

Set `VITE_API_URL=https://your-backend.example.com` as a build-time env var.

### Backend → Railway, Render, Fly.io, or VPS

1. Point the platform at `backend/`
2. Set env vars: `JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production`
3. Build: `npm run build` · Start: `npm start`
4. SQLite file persists in `./data/`. For multi-instance deployments, swap to PostgreSQL (the schema in `db.ts` is portable).

---

## Tech stack

**Frontend** · React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · Framer Motion · Recharts · TensorFlow.js (MoveNet Thunder) · jsPDF · canvas-confetti

**Backend** · Node.js 20+ · Express 4 · TypeScript · better-sqlite3 · jsonwebtoken · bcryptjs · ws · zod

**Infra** · GitHub Pages (frontend) · Railway/Render/VPS (backend) · SQLite → PostgreSQL upgrade path

---

## Roadmap

- [x] Real-time pose detection with skeleton overlay
- [x] 15+ poses with per-joint angle ranges
- [x] Voice corrections + auto-capture
- [x] Streak / achievement / progress system
- [x] Studio Mode with auto-advancing class sequences
- [x] Backend API + JWT auth + cloud sync
- [x] WebSocket scaffolding for live-class sync
- [ ] Instructor dashboard (class scheduling, roster, analytics)
- [ ] Student devices joining class via QR code
- [ ] Stripe subscriptions (Free / Personal / Studio / Enterprise)
- [ ] Custom pose builder
- [ ] Mobile app (React Native)

---

## License

MIT
