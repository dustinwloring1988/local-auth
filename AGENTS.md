# AGENTS.md

## Project
LocalAuth - local MVP auth provider (like Clerk/WorkOS) for development.

## Structure
- `backend/` - Express + TypeScript + better-sqlite3 API server (port 3001)
- `frontend/` - React + TypeScript + Vite dashboard (port 5173)
- `example/` - Standalone React example app consuming the auth API (port 5174)

## Dev
- Full stack: `docker compose up --build`
- Backend only: `cd backend && npm install && npm run dev`
- Frontend only: `cd frontend && npm install && npm run dev`
- Example app: `cd example && npm install && npm run dev`

## Build
- Frontend: `tsc && vite build`

## Key Details
- SQLite: one main DB for apps, one per-app DB for users
- Auth endpoints require `x-api-key` header
- JWT tokens signed with per-app secrets
- Dashboard API has no auth (local dev only)
