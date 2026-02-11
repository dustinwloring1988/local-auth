
<img width="1382" height="656" alt="cover" src="https://github.com/user-attachments/assets/d0ffea4a-a149-4a3a-8344-0e1c7b871109" />

# 🔐 LocalAuth

A local MVP authentication provider (like Clerk / WorkOS) for development. Spin it up with Docker and use it as the auth backend while building your apps — then swap it out for a real provider when going to production.

## Quick Start

```bash
docker compose up --build
```

- **Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Example Applications

Two example applications are included to demonstrate different approaches:

### 1. vite-with-sdk (Port 5173)

Demonstrates using the official LocalAuth SDK with React. Best for quick integration.

```bash
cd example/vite-with-sdk
npm install
npm run dev
```

Features:
- `LocalAuthProvider` wrapper
- `useAuth` hook for authentication state
- Login/Register forms
- Protected dashboard

### 2. vite-no-sdk (Port 5174)

Demonstrates direct API integration without the SDK. Useful for understanding how the API works or when you need custom authentication logic.

```bash
cd example/vite-no-sdk
npm install
npm run dev
```

Features:
- Custom `AuthContext` implementation
- Direct API calls using fetch
- React Router protected routes
- Login/Register/Dashboard pages

### Configuration

Both examples use environment variables. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_APP_API_KEY` | Your LocalAuth app API key |

Create an app via the Dashboard to get an API key.

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

## SDK

LocalAuth provides an official SDK for TypeScript/JavaScript applications, including React support.

### Installation

```bash
npm install localauth-sdk
```

### Client SDK

Use the `LocalAuthClient` for vanilla JS/TS applications:

```typescript
import { LocalAuthClient } from 'localauth-sdk';

const auth = new LocalAuthClient({
  apiKey: 'your_api_key',
  apiUrl: 'http://localhost:3001'
});

// Sign up
await auth.signUp({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'securepassword',
  fullName: 'John Doe'
});

// Sign in
await auth.signIn({
  email: 'user@example.com',
  password: 'securepassword'
});

// Get current user
const { user } = await auth.getMe();

// Update user
await auth.updateMe({ fullName: 'Jane Doe' });

// Sign out
await auth.signOut();

// Access user state
console.log(auth.user);      // Current user or null
console.log(auth.token);     // JWT token or null
console.log(auth.isAuthenticated); // boolean
```

### React SDK

Wrap your app with `LocalAuthProvider` and use the `useAuth` hook:

```tsx
import { LocalAuthProvider, useAuth } from 'localauth-sdk/react';

function App() {
  return (
    <LocalAuthProvider config={{ apiKey: 'your_api_key' }}>
      <YourApp />
    </LocalAuthProvider>
  );
}

function LoginForm() {
  const { signIn, user, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn({ email: 'user@example.com', password: 'password' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error.message}</div>}
      {user ? (
        <p>Welcome, {user.full_name}!</p>
      ) : (
        <button type="submit">Sign In</button>
      )}
    </form>
  );
}
```

#### useAuth Hook

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `isLoading` | `boolean` | Initial loading state |
| `error` | `LocalAuthError \| null` | Any auth error |
| `signUp(params)` | `Promise<void>` | Register new user |
| `signIn(params)` | `Promise<void>` | Sign in user |
| `signOut()` | `Promise<void>` | Sign out user |
| `updateMe(params)` | `Promise<void>` | Update user profile |
| `clearError()` | `void` | Clear error state |

## Architecture

- **Backend**: Express + TypeScript + better-sqlite3
- **Frontend**: React + TypeScript + Vite
- **SDK**: TypeScript with React support
- **Database**: SQLite (one main db for apps, one per-app db for users)
- **Auth**: JWT tokens signed with per-app secret keys
- **Deployment**: Docker Compose
