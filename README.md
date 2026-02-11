# 🔐 LocalAuth

A local MVP authentication provider (like Clerk / WorkOS) for development. Spin it up with Docker and use it as the auth backend while building your apps — then swap it out for a real provider when going to production.

## Quick Start

```bash
docker compose up --build
```

- **Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Example consumer app (no Docker)

There's a standalone example React app in the `example` folder that talks to the LocalAuth backend directly (no Docker for the frontend).

1. Make sure the backend is running  
   - Either via Docker (`docker compose up --build`)  
   - Or directly:
     ```bash
     cd backend
     npm install
     npm run dev
     ```

2. Configure the example app env:
   ```bash
   cd example
   cp .env.example .env
   # then edit .env and set:
   # VITE_API_URL=http://localhost:3001
   # VITE_APP_API_KEY=la_your_real_app_key_here
   ```

3. Start the example app:
   ```bash
   cd example
   npm install
   npm run dev
   ```

4. Open the example app in your browser:
   - `http://localhost:5174`

5. Use the example UI (no extra config fields needed in the browser) to exercise:
     - `POST /api/auth/signup`
     - `POST /api/auth/signin`
     - `GET /api/auth/me`
     - `PUT /api/auth/me`
     - `POST /api/auth/signout`

## How It Works

1. Open the **Dashboard** at `http://localhost:5173`
2. Create a new **App** — it gets a unique API key (e.g. `la_abc123...`)
3. Use the API key in your app's requests to register/authenticate users
4. Each app has its own **isolated SQLite database** — deleting the app deletes all its data

## Auth API (for your apps)

All auth endpoints require the `x-api-key` header with your app's API key.

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepassword",
    "fullName": "John Doe",
    "phone": "+1234567890"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

### Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3001/api/auth/me \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"fullName": "Jane Doe", "phone": "+9876543210"}'
```

## Dashboard API

No auth required (local development only).

| Method   | Endpoint                      | Description         |
|----------|-------------------------------|---------------------|
| `GET`    | `/api/apps`                   | List all apps       |
| `POST`   | `/api/apps`                   | Create an app       |
| `GET`    | `/api/apps/:id`               | Get app details     |
| `DELETE` | `/api/apps/:id`               | Delete app + data   |
| `GET`    | `/api/apps/:id/users`         | List users for app  |
| `DELETE` | `/api/apps/:id/users/:userId` | Delete a user       |

## User Fields

Each user record contains:
- `email` (required, unique per app)
- `username` (optional, unique per app)
- `password` (required, bcrypt hashed)
- `full_name`
- `phone`
- `metadata` (JSON object for custom fields)

## Architecture

- **Backend**: Express + TypeScript + better-sqlite3
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (one main db for apps, one per-app db for users)
- **Auth**: JWT tokens signed with per-app secret keys
- **Deployment**: Docker Compose
