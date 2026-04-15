# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Elden Ring fan site (TFC — Trabajo Final de Ciclo). Spanish-language educational project.

- **Backend**: CodeIgniter 4 REST API (`elden_ring_backend/`)
- **Frontend**: Angular 20 SPA (`elden_ring_tfc/`)
- **Database**: MySQL (`elden_ring_web` schema in `elden_ring_web.sql`)

## Commands

### Backend (CodeIgniter 4)

```bash
cd elden_ring_backend
composer install          # Install PHP dependencies
php spark serve           # Dev server at http://localhost:8080
composer test             # Run PHPUnit tests
```

The backend is also served via XAMPP at:
`http://localhost/tfc-elden-ring/elden_ring_backend/public/`

### Frontend (Angular)

```bash
cd elden_ring_tfc
npm install               # Install dependencies
npm start                 # Dev server at http://localhost:4200
npm run build             # Production build → dist/
npm test                  # Unit tests (Karma + Jasmine)
npm run watch             # Build in watch mode
```

### Database

Import `elden_ring_web.sql` into MySQL to create the `elden_ring_web` database and `users` table.

## Architecture

### Backend

REST API following CodeIgniter 4 conventions:

- **Routes**: `app/Config/Routes.php` — all endpoints defined here
- **Controllers**: `app/Controllers/Auth.php` handles register/login/profile
- **Models**: `app/Models/UserModel.php` — Active Record pattern
- **Auth middleware**: `app/Filters/JwtFilter.php` validates JWT on protected routes
- **JWT config**: `app/Config/Jwt.php` — 24-hour token expiration

Key routes:
```
POST /register            → Auth::register
POST /login               → Auth::login  (returns JWT)
GET  /profile   [jwt]     → Auth::profile
GET  /test-auth [jwt]     → Auth::testAuth
OPTIONS (:any)            → CORS preflight
```

### Frontend

Standalone Angular components (no NgModules):

- **Entry**: `src/main.ts` → `app.ts` (root component)
- **Routing**: `src/app/app.routes.ts` — route definitions with guards
- **State**: `AuthService` manages logged-in user via `BehaviorSubject<User | null>`, persists to `localStorage`
- **HTTP auth**: `JwtInterceptor` (`src/app/interceptors/`) auto-injects `Authorization: Bearer <token>` header
- **Guards**: `authGuard` (requires login), `guestGuard` (blocks logged-in users from auth pages)

Component structure:
```
App
├── Navbar (hidden on /start)
├── RouterOutlet
│   ├── /start         → StartComponent (full-screen intro)
│   ├── /home          → HomeComponent (shows AuthModal if not logged in)
│   ├── /npc-page      → NPCsPageComponent
│   └── /profile       → ProfileComponent [authGuard]
└── Footer (hidden on /start)
```

The `Home` component conditionally renders an `AuthModal` (containing Login/Register child components) when no user is authenticated.

### Authentication Flow

1. Register/Login form → POST to backend
2. Backend validates, bcrypt-hashes password, returns JWT
3. Frontend stores token + user object in `localStorage`
4. `JwtInterceptor` attaches token to all subsequent requests
5. Protected routes validated server-side by `JwtFilter`

### Database Schema

Single `users` table:
`id_user`, `name`, `surnames`, `birth_date`, `email` (unique), `username` (unique), `password` (bcrypt), `avatar` (default: `default.png`), `role` (enum: `user`/`admin`), `created_at`, `updated_at`

## Notes

- UI text, error messages, and code comments are in **Spanish**
- Backend `.env` contains DB credentials and JWT secret — not committed
- Prettier is configured for the Angular project (`package.json`)
