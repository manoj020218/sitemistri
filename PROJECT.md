# SiteMitra — Project Master Document

> **Last Updated:** 2026-06-09 (Session 5)
> **Status:** Fully deployed & running — Backend ✅ · React frontend ✅ · Marketing page ✅
> **Live URL:** https://sitemitra.iotsoft.in
> **VPS:** 154.61.69.200 (Ubuntu 24 LTS)
> **Developer:** Jenix (contact: support@iotsoft.com)

---

## Table of Contents

1. [What Is SiteMitra](#1-what-is-sitemitra)
2. [Tech Stack](#2-tech-stack)
3. [Project Directory Structure](#3-project-directory-structure)
4. [VPS Deployment — Full State](#4-vps-deployment--full-state)
5. [Backend — Architecture & APIs](#5-backend--architecture--apis)
6. [Database Models](#6-database-models)
7. [Frontend React App — Status](#7-frontend-react-app--status)
8. [Static Web Pages — Status](#8-static-web-pages--status)
9. [Environment Variables](#9-environment-variables)
10. [Credentials Needed (Pending)](#10-credentials-needed-pending)
11. [Known Issues & Fixes Applied](#11-known-issues--fixes-applied)
12. [Complete Progress Checklist](#12-complete-progress-checklist)
13. [How to Deploy (Step-by-Step)](#13-how-to-deploy-step-by-step)
14. [Business Rules (Do Not Break)](#14-business-rules-do-not-break)

---

## 1. What Is SiteMitra

SiteMitra is a **free, mobile-first Progressive Web App (PWA)** that connects:

- **CCTV field technicians** — who want to find nearby site work, build a verified work history, and receive job alerts
- **System Integrators (SIs)** — who need to find available, verified field technicians near any job site on demand

**Key decisions:**
- No payment gateway (all payments are offline between SI and technician)
- No OTP — Google Sign-In only
- No Google Maps paid API — uses free OpenStreetMap / Nominatim
- No self-assignment (platform enforced)
- Location collected ONLY when technician sets availability — never background
- Proof photos auto-deleted after 7 days
- MVP Phase 1 — minimal infra cost is priority

**Product:** by **Jenix** — a technology company building software for India's IoT, security, and field service sectors.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | Node.js 20+ / Express 4 | Deployed on PM2 (fork mode) |
| Database | MongoDB (local on VPS) | Auth enabled; dedicated user `sitemitra_app` |
| ORM | Mongoose 8 | All read queries use `.lean()` |
| Auth | Google OAuth 2.0 + JWT | No passwords, no OTP |
| Push Notifications | Firebase Cloud Messaging (FCM) | Web + Android — credentials NOT yet set |
| Image Processing | sharp (lazy-loaded) | Only on proof photo upload |
| Scheduled Jobs | node-cron | Proof photo cleanup daily at 2AM |
| Process Manager | PM2 | Fork mode, 400MB restart limit |
| Web Server | Nginx | Reverse proxy + static files |
| SSL | Let's Encrypt (certbot) | Auto-renews |
| Frontend | React 18 + Vite 5 | Built & deployed ✅ |
| UI Routing | React Router 6 | |
| Geocoding | Nominatim (OpenStreetMap) | Free, no API key — used for search + reverse geocode |
| Frontend Build | Vite PWA Plugin (Workbox) | generateSW mode |
| Landing Page | Vanilla HTML/CSS/JS | Deployed ✅ — served at `/` |
| Install Page | Vanilla HTML/CSS/JS | Deployed ✅ (`/join`) |
| VPS OS | Ubuntu 24 LTS | |
| Deploy Script | `deploy.bat` (Windows batch) | Uses PuTTY plink + pscp |

---

## 3. Project Directory Structure

```
D:\IOT Device\SiteMistri\SiteMitra\
│
├── PROJECT.md                          ← THIS FILE (single source of truth)
├── deploy.bat                          ← One-click deploy script (Windows, uses PuTTY)
├── gen-icons.js                        ← Icon generator (uses sharp — run locally)
├── nginx-sitemitra.conf                ← Nginx config template
│
├── sitework/                           ← Main application code
│   ├── ecosystem.config.js             ← PM2 config (deployed to VPS)
│   │
│   ├── backend/                        ← Node.js/Express API
│   │   ├── package.json
│   │   ├── .env.example
│   │   ├── .env.production             ← Local copy of VPS .env (DO NOT COMMIT)
│   │   └── src/
│   │       ├── server.js               ← Entry point
│   │       ├── app.js                  ← Express app setup
│   │       ├── config/
│   │       │   ├── db.js               ← MongoDB connection (maxPoolSize: 2)
│   │       │   └── firebase.js         ← Firebase Admin SDK (graceful fallback)
│   │       ├── models/
│   │       │   ├── User.model.js
│   │       │   ├── TechnicianProfile.model.js
│   │       │   ├── SIProfile.model.js        ← Added: businessAddress, customPhotoUrl (Session 4)
│   │       │   ├── SiteWork.model.js
│   │       │   ├── TechnicianPool.model.js
│   │       │   └── NotificationToken.model.js
│   │       ├── routes/
│   │       │   ├── auth.routes.js
│   │       │   ├── technician.routes.js
│   │       │   ├── si.routes.js              ← Updated (Session 4): PUT /, POST /photo, GET /site-works, GET /technician-pool
│   │       │   ├── discovery.routes.js
│   │       │   ├── sitework.routes.js
│   │       │   ├── public.routes.js
│   │       │   └── admin.routes.js
│   │       ├── controllers/
│   │       │   ├── auth.controller.js
│   │       │   ├── technician.controller.js
│   │       │   ├── sitework.controller.js
│   │       │   ├── discovery.controller.js
│   │       │   ├── public.controller.js
│   │       │   └── admin.controller.js
│   │       ├── middleware/
│   │       │   ├── auth.middleware.js         ← JWT verify + .lean() user fetch
│   │       │   └── upload.middleware.js       ← Multer config (proof photos + SI photos)
│   │       ├── services/
│   │       │   ├── google.auth.service.js
│   │       │   ├── jwt.service.js
│   │       │   ├── discovery.service.js       ← Geospatial scoring algorithm
│   │       │   ├── fcm.service.js
│   │       │   ├── profileText.service.js     ← Auto-bio generator (Hindi + English)
│   │       │   └── proofCleanup.service.js
│   │       ├── jobs/
│   │       │   └── proofPhotoCleanup.job.js   ← Daily cron at 2AM
│   │       └── utils/
│   │           ├── constants.js
│   │           └── response.js               ← { ok, err } helpers → { success, message, data }
│   │
│   └── frontend/                       ← React 18 PWA app
│       ├── index.html                  ← Vite entry HTML
│       ├── package.json
│       ├── .env                        ← VITE_API_URL + VITE_GOOGLE_CLIENT_ID (set ✅)
│       ├── vite.config.js              ← Updated (Session 4): navigateFallbackDenylist for root /
│       ├── public/icons/
│       └── src/
│           ├── main.jsx
│           ├── App.jsx                 ← Router + RequireAuth + route definitions
│           ├── context/
│           │   └── AuthContext.jsx     ← Auth state + loginWithGoogle + refreshUser + logout (r.data fix Session 5)
│           ├── pages/
│           │   ├── AdminPanel.jsx
│           │   ├── Onboarding.jsx      ← Full 6-step flow wired to API ✅
│           │   ├── SIDashboard.jsx     ← FULLY wired to real API (Session 4) ✅
│           │   ├── SiteWorkDetail.jsx  ← ⚠️ Still uses mock data
│           │   ├── TechDashboard.jsx   ← Fully wired to real API (Session 3) ✅
│           │   └── WhatsAppTemplates.jsx
│           ├── services/
│           │   └── api.js              ← Axios instance with JWT interceptor
│           └── utils/
│               └── whatsapp.js
│
└── sitemitra-web/                      ← Static marketing & install pages
    ├── index.html                      ← Marketing landing page (served at / on VPS)
    ├── manifest.json
    ├── sw.js
    ├── icon.svg
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable.png
    └── join/
        └── index.html                  ← PWA install page (/join)
```

---

## 4. VPS Deployment — Full State

### Server Details
| Item | Value |
|---|---|
| IP | **154.61.69.200** ← NEVER use any other IP |
| OS | Ubuntu 24 LTS |
| SSH User | root |
| SSH Password | `<stored privately — ask Manoj>` |
| Domain | sitemitra.iotsoft.in |
| Web root | `/root/projects/SiteMitra/web/` |
| Backend dir | `/root/projects/SiteMitra/backend/` |
| PM2 app name | `sitemitra-api` (port 3100) |
| PuTTY plink | `"C:\Program Files\PuTTY\plink.exe"` |
| PuTTY pscp | `"C:\Program Files\PuTTY\pscp.exe"` |
| Deploy script | `D:\IOT Device\SiteMistri\SiteMitra\deploy.bat` |

### deploy.bat Commands
```
deploy.bat frontend   — npm build + upload dist/ + re-upload marketing page
deploy.bat dist       — upload existing dist/ only (skip build)
deploy.bat backend    — upload backend src/ + pm2 restart
deploy.bat restart    — pm2 restart only
deploy.bat logs       — last 80 lines of PM2 logs
deploy.bat status     — PM2 status + disk + memory
deploy.bat ssh        — open PuTTY SSH session
```

> **Note:** `deploy.bat` must be run with `cmd.exe`, not PowerShell directly.
> From PowerShell: `Start-Process cmd.exe -ArgumentList '/c "D:\IOT Device\SiteMistri\SiteMitra\deploy.bat" dist' -Wait -NoNewWindow`
> Or use pscp/plink directly (see Section 13).

### VPS Directory Layout
```
/root/projects/SiteMitra/
├── backend/
│   ├── src/
│   ├── node_modules/
│   ├── .env                  ← Production env file
│   └── package.json
├── web/                      ← Static files served by Nginx
│   ├── index-landing.html    ← Marketing page (served at /) ← SESSION 4 CHANGE
│   ├── index.html            ← React SPA entry (served for /onboarding, /si, /tech, etc.)
│   ├── assets/               ← Vite JS/CSS bundles
│   ├── manifest.webmanifest  ← PWA manifest (from Vite build)
│   ├── sw.js                 ← Service worker (Workbox, from Vite build)
│   ├── workbox-*.js
│   ├── registerSW.js
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.png
│   ├── icon.svg
│   ├── icons/
│   ├── join/
│   │   └── index.html        ← PWA install page
│   └── landing/              ← Old location (no longer used for /)
│       └── index.html
├── logs/
│   ├── out.log
│   └── error.log
└── ecosystem.config.js
```

### Nginx Config (live on VPS at `/etc/nginx/sites-enabled/sitemitra`)
```nginx
server {
    listen 443 ssl;
    server_name sitemitra.iotsoft.in;

    ssl_certificate     /etc/letsencrypt/live/sitemitra.iotsoft.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sitemitra.iotsoft.in/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root  /root/projects/SiteMitra/web;
    index index-landing.html index.html;   ← Marketing page first (Session 4 change)

    location / {
        try_files $uri $uri/ /index.html;  ← React SPA fallback for app routes
    }

    location /api/ {
        proxy_pass         http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 1m;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name sitemitra.iotsoft.in;
    return 301 https://$host$request_uri;
}
```

**How `/` vs app routes work:**
- Request for `/` → nginx `index` directive → tries `index-landing.html` first → serves marketing page
- Request for `/onboarding`, `/si`, `/tech` → no file found → falls back to `index.html` → React SPA handles routing
- Request for `/join/` → real directory with its own `index.html` → served directly
- Service worker: `navigateFallbackDenylist: [/^\//]` prevents SW from intercepting `/` so marketing page is always fresh from server

### PM2
- App name: `sitemitra-api` (id: 20)
- Port: 3100
- 13 other apps on same VPS — ONLY ever restart `sitemitra-api`
- MongoDB user: `sitemitra_app` / password: `<stored privately>`
- MONGODB_URI: `mongodb://sitemitra_app:<password>@localhost:27017/sitemitra?authSource=admin`

### SSL
```bash
# Renew test
certbot renew --dry-run
# NEVER use certbot --nginx plugin (UnicodeDecodeError on this VPS)
# Always use: certbot certonly --webroot -w /root/projects/SiteMitra/web -d sitemitra.iotsoft.in
```

---

## 5. Backend — Architecture & APIs

### Response Envelope
All API responses use `{ success: bool, message: string, data: any }`.
Frontend reads `response.data` (Axios) → then `.data` property for the payload.

### API Endpoints

#### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/google` | No | Google credential → JWT + user object |
| GET | `/me` | Yes | Current user profile |
| POST | `/accept-terms` | Yes | Record T&C acceptance (version + IP + UA) |
| POST | `/mobile` | Yes | Register phone number |
| POST | `/roles` | Yes | Set TECHNICIAN / SI / both |
| POST | `/fcm-token` | Yes | Register Firebase push token |
| DELETE | `/fcm-token` | Yes | Remove push token on logout |

#### Technician (`/api/technician`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile` | Yes | Get own technician profile |
| PUT | `/profile` | Yes | Update profile (skills, city, tools, vehicle, experience, etc.) |
| PUT | `/availability` | Yes | Set availability status |
| POST | `/location` | Yes | Update GPS coordinates |
| POST | `/photo` | Yes | Upload profile photo (multer) |

#### SI (`/api/si`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get own SI profile (returns null if not set up yet) |
| POST | `/` | Yes | Create SI profile (upsert) |
| PUT | `/` | Yes | Update SI profile |
| POST | `/photo` | Yes | Upload SI/company photo (multer) → saves to `customPhotoUrl` |
| GET | `/site-works` | Yes | List own site works (limit 100, populated `technicianUserId.name`) |
| GET | `/technician-pool` | Yes | List technician pool (populated `technicianUserId: {name, mobile}`) |

**Photo URL pattern:** stored as `/uploads/filename.jpg` in DB. Frontend displays as `${API_URL}/uploads/filename.jpg` = `https://sitemitra.iotsoft.in/api/uploads/filename.jpg`.

#### Discovery (`/api/discovery`)
| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/nearby` | Yes | 30/min | Find technicians near lat/lng |

**Request body:** `{ siteLocation: {lat, lng}, radiusKm, requiredSkills: [skill_ids], workType }`

**Discovery scoring algorithm** (higher = ranked first):
- +40 pts — Available Now
- +20 pts — Location updated recently
- +5 pts per skill match
- +15 pts — Within 2 km
- +1.5 pts per completed job
- −10 pts — Has overdue/open work

#### Site Work (`/api/site-work`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | SI | Create new work order |
| GET | `/` | Yes | List own work orders |
| GET | `/:id` | Yes | Work detail |
| POST | `/:id/accept` | Tech | Accept job |
| POST | `/:id/reject` | Tech | Reject job |
| POST | `/:id/start-travel` | Tech | On the way |
| POST | `/:id/reached` | Tech | Arrived at site |
| POST | `/:id/start-work` | Tech | Work started |
| POST | `/:id/complete` | Tech | Mark completed (→ `COMPLETED_BY_TECH`) |
| POST | `/:id/proof-photo` | Tech | Upload proof photo (multer) |
| POST | `/:id/close` | SI | Close job + optional rating |
| POST | `/:id/cancel` | Both | Cancel job |
| POST | `/:id/report-issue` | Tech | Report a problem |

#### Public (`/api/public`) — No auth
| Method | Path | Description |
|---|---|---|
| GET | `/tech/:slug` | Public technician profile page |
| GET | `/si/:slug` | Public SI page |

#### Admin (`/api/admin`) — Admin email required
| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users |
| GET | `/site-works` | All site works |
| POST | `/block/:userId` | Block user |
| DELETE | `/user/:userId` | Delete user |

#### Health
```
GET /health  →  { status: 'ok', version: '1.0.0' }
```

### SiteWork Status Machine
```
DRAFT → PENDING_ACCEPTANCE → ACCEPTED → ON_THE_WAY → REACHED → WORK_STARTED
                                                                      ↓
                                                              COMPLETED_BY_TECH
                                                                      ↓
                                                                   CLOSED ✓

Other terminals: CANCELLED_BY_SI, CANCELLED_BY_TECH, DISPUTED, OVERDUE
```

### Memory Optimization
- All read queries use `.lean()` (50% less RAM vs full Mongoose docs)
- MongoDB `maxPoolSize: 2`
- `express.json({ limit: '100kb' })`
- `sharp` lazy-loaded — only `require()`d inside `uploadProof()`
- PM2 `--max-old-space-size=512` + `max_memory_restart: '400M'`
- Pagination on list endpoints (default 20, max 50)

---

## 6. Database Models

### User
```js
{ googleId, email, emailVerified, name, photoUrl, mobile,
  mobileStatus: enum[SELF_ADDED, SI_CALL_VERIFIED, WORK_VERIFIED, MULTI_SI_VERIFIED],
  roles: [enum: TECHNICIAN, SI], language: enum[hi, en],
  termsAccepted, termsVersion, privacyVersion, acceptedAt, acceptedIp, acceptedUserAgent,
  isBlocked, blockedReason, lastActiveAt }
```

### TechnicianProfile
```js
{ userId (ref User, unique), city, workingAreas, skills, workTypes,
  experienceLevel: enum[NEW,1_PLUS,3_PLUS,5_PLUS,10_PLUS],
  tools, vehicle: enum[BIKE,SCOOTER,CAR,NONE],
  availability: enum[AVAILABLE_NOW,AVAILABLE_TODAY,AVAILABLE_TOMORROW,BUSY,OFFLINE],
  currentLocation: { type:'Point', coordinates:[lng,lat], accuracy, updatedAt },  // 2dsphere indexed
  generatedBioHi, generatedBioEn, profileSlug (unique), profileStrength,
  trustStats: { completedSiteWork, uniqueSIs, repeatSIWork, noShow,
                cancelledAfterAccept, overdueOpenWork, averageRating, totalRatings } }
// Indexes: currentLocation (2dsphere), availability+skills
```

### SIProfile
```js
{ userId (ref User, unique),
  businessName, city, workingAreas,
  businessType: enum[SI,CONTRACTOR,DEALER,SERVICE_PROVIDER],
  workCategories: [String],
  businessAddress: String,       ← Added Session 4
  customPhotoUrl: String,        ← Added Session 4 — stored as /uploads/filename.jpg
  siSlug (unique, sparse) }
```

### SiteWork
```js
{ siUserId, technicianUserId (ref User),
  clientName, clientMobile, siteAddress, siteLocation (GeoJSON),
  workType, requiredSkills, description, preferredVisitTime,
  agreedVisitCharge, materialIncluded, paymentBy, paymentMode,
  status (enum — see state machine above),
  proof: { photoUploaded, photoPath, uploadedAt, storageStatus, sha256Hash },
  ratingBySI: { stars, reachedOnTime, skillMatch, workCompleted, behaviourGood, comment, ratedAt },
  privateIssueByTechnician: { hasIssue, reason, comment, reportedAt },
  // Timestamps: assignedAt, acceptedAt, travelStartedAt, reachedAt,
  //             workStartedAt, completedByTechAt, siClosedAt, cancelledAt }
```

### TechnicianPool
```js
{ siUserId (ref User), technicianUserId (ref User), addedAt }
// Populated fields: technicianUserId → { name, mobile }
```

### NotificationToken
```js
{ userId (ref User), token, platform: enum[web,android,ios], createdAt }
```

---

## 7. Frontend React App — Status

### Current Live State
| URL | What it serves |
|---|---|
| `https://sitemitra.iotsoft.in/` | **Marketing landing page** (`index-landing.html`) — Hindi default |
| `https://sitemitra.iotsoft.in/onboarding` | React SPA — 6-step onboarding |
| `https://sitemitra.iotsoft.in/tech` | React SPA — Technician dashboard |
| `https://sitemitra.iotsoft.in/si` | React SPA — SI dashboard |
| `https://sitemitra.iotsoft.in/join` | PWA install page (static HTML) |

### App Router (`App.jsx`)
- **`RequireAuth({ role })`** — Checks: logged in → termsAccepted → mobile set → has role. Redirects to `/onboarding` if any check fails.
- **`HomeRouter`** — Sends users to correct dashboard. Dual-role users use `localStorage('sm_last_dash')`.
- **`OnboardingRoute`** — If fully onboarded, redirects to `/`.
- Routes: `/` HomeRouter · `/onboarding` · `/tech` (TECHNICIAN) · `/si` (SI) · `/work/:id` · `/admin` · `*` → `/`

### Onboarding Step Detection (6 steps)
Step 1: Terms → Step 2: Mobile → Step 3: Role → Step 4: Tech/SI profile → Step 5: Profile review → Step 6: Complete

### Vite Config (`vite.config.js`)
```js
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    navigateFallbackDenylist: [/^\//],   // ← Added Session 4: prevents SW from intercepting root /
  },
  manifest: { ... }
})
```

---

### TechDashboard.jsx ✅ FULLY WIRED (Session 3, 2026-06-08)
- Loads `GET /api/technician/profile` + `GET /api/technician/site-works`
- Profile edit: skills (10), tools (7), experience slider, age stepper, vehicle, city, permanent address
- Profile photo upload → `POST /api/technician/photo`
- Availability toggle → `POST /api/technician/availability`
- Location permission → `navigator.geolocation` → `POST /api/technician/location` (only when going Available)
- Proof photo upload → `POST /api/site-work/:id/proof-photo`
- Active work: next-action buttons wired (`/start-travel`, `/reached`, `/start-work`, `/complete`)
- Active work: "Open in Google Maps" link
- History: month-wise grouped with monthly earnings/count summary
- History item click: slide-up detail modal (SI name, address, payment, rating, date)
- Logout button in ProfileScreen view mode
- Auto-generated bio (Hindi + English) displayed

---

### SIDashboard.jsx ✅ FULLY WIRED (Session 4, 2026-06-09)

#### Root component
- Loads on mount: `GET /api/si/` + `GET /api/si/site-works` + `GET /api/si/technician-pool` (parallel)
- Passes `user`, `siProfile`, `siteWorks`, `pool` as props to all screens

#### HomeScreen
- Shows real stats: active count, pending review count, closed count from `siteWorks`
- Recent 3 site works with real technician names (`technicianUserId.name`)
- Pending review alert banner (COMPLETED_BY_TECH status)
- Profile setup prompt if no `businessName`
- Profile photo from `siProfile.customPhotoUrl` or `user.photoUrl`

#### SearchScreen (Technician Discovery)
- "Use Current Location" → `navigator.geolocation` → Nominatim reverse geocode fills address
- "Search" → forward geocode via Nominatim if no GPS coords → `POST /api/discovery/nearby`
- `normalizeTech()` helper normalizes API results (name, skills labels, vehicle emoji, exp, location age, distanceKm)
- Results displayed in `ResultsScreen` with real data

#### AssignScreen
- Submits `POST /api/site-work` with: technicianUserId, clientName, clientMobile, siteAddress, workType, description, preferredVisitTime, agreedVisitCharge, paymentMode, materialIncluded
- Success state with "View My Works" button

#### MyWorksScreen
- Filters: All / Active / Review / Closed
- Active = `[ACCEPTED, ON_THE_WAY, REACHED, WORK_STARTED]`
- Review = `COMPLETED_BY_TECH`
- Shows real tech names, addresses, charges, dates from API

#### PoolScreen
- Shows real pool technicians (`technicianUserId.name + mobile`)
- Real Call/WhatsApp links using actual mobile number
- "Assign Work" from pool sets selectedTech and navigates to AssignScreen
- "Invite Technicians" with WhatsApp share + clipboard copy of invite link

#### SIProfileScreen ✅ NEW (Session 4)
**Edit mode:**
- Company/profile photo upload → `POST /api/si/photo`
- Business name, city, business address (textarea)
- Business type selector: SI / CONTRACTOR / DEALER / SERVICE_PROVIDER
- Services offered: 12 category chips (CCTV, Access Control, Networking, Fire Alarm, etc.)
- Save → `PUT /api/si/`

**View mode:**
- Shows photo, business name, type, city, address, service tags, mobile
- **Visiting Card Share**: Canvas-drawn PNG (900×500px) — dark blue gradient, company name, services, address, phone, SiteMitra watermark. Shared via `navigator.share({ files: [png] })` or downloaded as fallback.
- Edit profile button
- **Logout** button

#### BottomNav
- 4 tabs: Home 🏠 · Search 🔍 · Works 📋 · **Profile 👤** (was Pool in Session 3)
- Pool accessible from Profile screen (via "My Technician Pool" section — currently separate screen `/pool`)
- Badge on Works tab shows `COMPLETED_BY_TECH` count

---

### SiteWorkDetail.jsx ⚠️ STILL MOCK DATA
- Needs wiring to `GET /api/site-work/:id`
- Needs real status transition buttons for SI (close + rate)

---

## 8. Static Web Pages — Status

### Marketing Landing Page ✅ LIVE at `sitemitra.iotsoft.in/`
- **Local:** `sitemitra-web/index.html`
- **VPS:** `/root/projects/SiteMitra/web/index-landing.html`
- **Hindi as default language** (changed Session 4 — was English)
- **Language switcher:** EN ↔ हिंदी (JS-based, localStorage persists)
- **CTAs:**
  - 🚀 "Try Now — Free" → `/onboarding`
  - 📲 "Add to Phone" blinking button — `beforeinstallprompt` on Android/Chrome; iOS Safari instructions fallback
- **Content:** Hero, Stats, Problem, Features, For Technicians, For SI, Trust & Safety, About, Terms & Conditions (18 clauses), Privacy Policy (11 sections), Footer
- **PWA:** manifest linked, service worker registered

### PWA Install Page ✅ LIVE at `/join`
- **Local:** `sitemitra-web/join/index.html`
- **VPS:** `/root/projects/SiteMitra/web/join/index.html`
- `beforeinstallprompt` → native install button (Android Chrome)
- Android / iOS tabs with manual install instructions
- Standalone mode detection → "Already installed!" banner
- QR code, native share API, copy link

### Uploads (SI + Technician Photos)
- Served at `/api/uploads/filename.jpg` (through Nginx → Node proxy)
- Stored on VPS at `/root/projects/SiteMitra/backend/uploads/`
- Proof photos auto-deleted after 7 days by cron job

---

## 9. Environment Variables

### Backend `.env` (VPS: `/root/projects/SiteMitra/backend/.env`)
```env
NODE_ENV=production
PORT=3100

MONGODB_URI=mongodb://sitemitra_app:<password>@localhost:27017/sitemitra?authSource=admin

JWT_SECRET=<SET ✅ — 64-char hex>
JWT_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=<see VPS /root/projects/SiteMitra/backend/.env>
GOOGLE_CLIENT_SECRET=<see VPS /root/projects/SiteMitra/backend/.env>

# Firebase FCM — NOT YET SET
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=

TEMP_UPLOAD_DIR=uploads
PROOF_PHOTO_MAX_SIZE_KB=400
PROOF_PHOTO_AUTO_DELETE_DAYS=7

TERMS_VERSION=1.0
PRIVACY_VERSION=1.0

ADMIN_EMAILS=manoj020218@gmail.com

FRONTEND_URL=https://sitemitra.iotsoft.in
APP_BASE_URL=https://sitemitra.iotsoft.in
```

### Frontend `.env` (`sitework/frontend/.env`)
```env
VITE_API_URL=https://sitemitra.iotsoft.in/api
VITE_GOOGLE_CLIENT_ID=<same as backend GOOGLE_CLIENT_ID>

# Firebase — NOT YET SET
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_VAPID_KEY=
```

---

## 10. Credentials Needed (Pending)

### ✅ Google OAuth — DONE
- Client ID + Secret set in both `.env` files
- Authorized origins: `https://sitemitra.iotsoft.in` + `http://localhost:5173`

### ✅ JWT Secret — DONE (64-char hex)

### ✅ MongoDB Auth — DONE
- User: `sitemitra_app` / Password: `<stored privately>`
- MONGODB_URI set in backend `.env`

### ✅ 2dsphere Index — DONE (Session 2)
- Index on `technicianprofiles.currentLocation`

### 🟡 Firebase (Push Notifications)
1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Extract: `project_id`, `client_email`, `private_key`
3. Update VPS `.env` with these three values
4. Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
5. Copy VAPID public key → `VITE_VAPID_KEY` in frontend `.env`
6. Rebuild frontend + redeploy after adding VAPID key

---

## 11. Known Issues & Fixes Applied

| Issue | Fix Applied | File |
|---|---|---|
| `.env` file 0 bytes via heredoc | Use pscp to upload local file | — |
| PM2 cwd wrong path | Hardcoded `/root/projects/SiteMitra/backend` | `ecosystem.config.js` |
| MongoDB createIndexes requires auth | Wrapped in try/catch, non-fatal | `db.js` |
| Firebase crash before app.listen | Guard check + graceful fallback | `firebase.js` |
| Certbot nginx plugin UnicodeDecodeError | Use `certbot certonly --webroot` | VPS |
| DNS was `.iotsoft.com` not `.iotsoft.in` | Updated all configs | nginx, ecosystem, .env |
| pnpm workspace root ignoring backend | `pnpm install --ignore-workspace` | — |
| sharp requires Node ^18.17.0, VPS has 18.14.0 | Used `rsvg-convert` for icons on VPS | — |
| Google `useGoogleLogin` returns access_token | Backend detects token type; access tokens → userinfo endpoint | `google.auth.service.js` |
| React SPA conflicts with marketing page at `/` | Marketing page at `index-landing.html`; nginx `index` directive serves it first | nginx |
| MongoDB command find requires auth | Created `sitemitra_app` user; updated MONGODB_URI | VPS `.env` |
| Auth middleware blocked accept-terms | Removed `termsAccepted` check from `protect` | `auth.middleware.js` |
| AuthContext stored "undefined" as JWT | Fixed to read `r.data.token` and `r.data.user` | `AuthContext.jsx` |
| Login role pills not interactive | Changed to `<button>` with `preRole` state | `Onboarding.jsx` |
| Uploads not accessible via URL | Changed static mount to `/api/uploads/` | `app.js` |
| `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` | Added `app.set('trust proxy', 1)` | `app.js` |
| "Use Current Location" on SI search did nothing | Wired geolocation + Nominatim reverse geocode | `SIDashboard.jsx` |
| SI search used fake setTimeout + mock data | Wired to `POST /api/discovery/nearby` | `SIDashboard.jsx` |
| AssignScreen submit was fake | Wired to `POST /api/site-work` | `SIDashboard.jsx` |
| SI dashboard still showing dummy data | Rewrote all screens to use real API (Session 4) | `SIDashboard.jsx` |
| Service worker serves cached React app at `/` | Added `navigateFallbackDenylist: [/^\//]` to Vite PWA config | `vite.config.js` |
| deploy.bat failing from PowerShell | Must use `cmd.exe` or call pscp/plink directly | `deploy.bat` / Section 13 |
| Wrong VPS IP (89.116.235.213) hallucinated | Correct IP is always **154.61.69.200** — read this file before any deploy | — |
| `r.data` bug — api.js interceptor returns `{success,message,data}` envelope; callers using `r.token`, `r.user`, `r.results`, `r` directly got `undefined` | Fixed all call sites: `AuthContext.jsx` (loginWithGoogle + refreshUser), `TechDashboard.jsx` (loadAll + refreshProfile), `SIDashboard.jsx` (discovery + profile save + photo save + root loadAll). Rule: always use `r.data` for payload after `await api.*()` | `AuthContext.jsx`, `TechDashboard.jsx`, `SIDashboard.jsx` |

---

## 12. Complete Progress Checklist

### Infrastructure ✅
- [x] VPS provisioned (154.61.69.200)
- [x] Nginx installed and configured
- [x] SSL certificate (Let's Encrypt, auto-renews)
- [x] DNS pointing to VPS
- [x] PM2 ecosystem config
- [x] MongoDB running + auth user `sitemitra_app` created
- [x] 2dsphere geospatial index on `technicianprofiles`

### Backend ✅
- [x] All 6 models defined (User, TechProfile, SIProfile, SiteWork, TechPool, NotifToken)
- [x] All 7 route files (auth, technician, si, discovery, sitework, public, admin)
- [x] All controllers, middleware, services written
- [x] Memory optimization applied (lean, pool size, body limit, lazy sharp)
- [x] Deployed to VPS + PM2 running
- [x] Google OAuth credentials set
- [x] JWT_SECRET set
- [x] MongoDB auth URI set
- [x] SIProfile model: added `businessAddress` + `customPhotoUrl` fields (Session 4)
- [x] SI routes: added `PUT /`, `POST /photo`, `GET /site-works`, `GET /technician-pool` (Session 4)
- [ ] Firebase credentials in `.env` (push notifications)
- [ ] End-to-end backend smoke test (login → profile → assign work → complete → close)

### Static Web Pages ✅
- [x] Marketing landing page — full marketing + T&C + Privacy
- [x] Hindi as default language on landing page (Session 4)
- [x] "Try Now — Free" CTA → `/onboarding` (Session 4)
- [x] "Add to Phone" blinking PWA install button (Session 4)
- [x] PWA install page (`/join`)
- [x] PWA manifest, service worker, icons
- [x] All static files deployed to VPS

### React Frontend ✅
- [x] Project scaffolded, AuthContext, api.js, App.jsx, main.jsx
- [x] Onboarding.jsx — all 6 steps, real Google OAuth
- [x] TechDashboard.jsx — fully wired to real API (Session 3)
  - [x] Profile edit (skills, tools, experience, age, vehicle, city, address)
  - [x] Photo upload
  - [x] Availability + location permission
  - [x] Active work + next-action buttons
  - [x] Proof photo upload
  - [x] History (month-wise + detail modal)
  - [x] Logout button
  - [x] Google Maps link
- [x] SIDashboard.jsx — fully wired to real API (Session 4)
  - [x] HomeScreen (real stats, recent works, profile setup prompt)
  - [x] SearchScreen (geolocation + Nominatim geocoding + discovery API)
  - [x] ResultsScreen (real tech cards)
  - [x] AssignScreen (real POST /site-work)
  - [x] MyWorksScreen (real siteWorks with filters)
  - [x] PoolScreen (real pool with Call/WhatsApp/Assign)
  - [x] SIProfileScreen (edit mode + view mode + visiting card share + logout) ← NEW Session 4
- [x] Service worker `navigateFallbackDenylist` fix (Session 4)
- [x] **r.data bug fixed** — AuthContext.jsx, TechDashboard.jsx, SIDashboard.jsx all fixed (Session 5)
- [x] Frontend built and deployed (Session 5)
- [ ] **SiteWorkDetail.jsx** — wire to real API (`GET /api/site-work/:id` + close/rate)
- [ ] Push notifications (`useFCM` hook + Firebase config in `.env`)
- [ ] Public profile pages (`/tech/:slug`, `/si/:slug`) — use public.routes.js

---

## 13. How to Deploy (Step-by-Step)

### Quick Reference (PowerShell — direct pscp/plink)
```powershell
# Upload a single file
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" "D:\local\file.js" "root@154.61.69.200:/remote/path/file.js"

# Upload a directory recursively
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" -r "D:\local\dir\*" "root@154.61.69.200:/remote/path/"

# Run a command on VPS
& "C:\Program Files\PuTTY\plink.exe" -pw "<VPS_PASSWORD>" -batch "root@154.61.69.200" "COMMAND_HERE"
```

### Deploy React frontend (full)
```powershell
# 1. Build locally
cd "D:\IOT Device\SiteMistri\SiteMitra\sitework\frontend"
npm run build

# 2. Upload dist/ to VPS
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" -r "D:\IOT Device\SiteMistri\SiteMitra\sitework\frontend\dist\*" "root@154.61.69.200:/root/projects/SiteMitra/web/"

# 3. Re-upload marketing page (build may have overwritten index-landing.html)
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" "D:\IOT Device\SiteMistri\SiteMitra\sitemitra-web\index.html" "root@154.61.69.200:/root/projects/SiteMitra/web/index-landing.html"
```

### Deploy backend (after code changes)
```powershell
# Upload changed backend files
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" -r "D:\IOT Device\SiteMistri\SiteMatra\sitework\backend\src\*" "root@154.61.69.200:/root/projects/SiteMitra/backend/src/"

# Restart PM2
& "C:\Program Files\PuTTY\plink.exe" -pw "<VPS_PASSWORD>" -batch "root@154.61.69.200" "pm2 restart sitemitra-api"
```

### Deploy marketing landing page only
```powershell
& "C:\Program Files\PuTTY\pscp.exe" -pw "<VPS_PASSWORD>" "D:\IOT Device\SiteMistri\SiteMitra\sitemitra-web\index.html" "root@154.61.69.200:/root/projects/SiteMitra/web/index-landing.html"
```

### Check PM2 logs
```powershell
& "C:\Program Files\PuTTY\plink.exe" -pw "<VPS_PASSWORD>" -batch "root@154.61.69.200" "pm2 logs sitemitra-api --lines 80 --nostream"
```

### Reload nginx after config change
```powershell
& "C:\Program Files\PuTTY\plink.exe" -pw "<VPS_PASSWORD>" -batch "root@154.61.69.200" "nginx -t && nginx -s reload"
```

> ⚠️ **NEVER restart any PM2 app other than `sitemitra-api` (id: 20).** There are 13 apps on this VPS.
> ⚠️ **VPS IP is ALWAYS 154.61.69.200** — never use any other IP.

---

## 14. Business Rules (Do Not Break)

1. **No payment** — Platform never handles money. All financial terms are between SI and technician.
2. **No self-assignment** — `siUserId !== technicianUserId` enforced at creation.
3. **Location only on availability set** — GPS collected only when user explicitly sets "Available Now/Today/Tomorrow". Never background.
4. **Exact location hidden until accept** — `currentLocation` NOT returned in discovery. Only post-acceptance.
5. **One proof photo per work** — Strictly one. Auto-deleted after 7 days OR when SI closes.
6. **Free forever** — No subscription, no commission, no ads.
7. **Google login only** — No OTP, no email+password.
8. **Both roles allowed** — User can be both TECHNICIAN and SI; self-assignment still blocked.
9. **2dsphere index required** — Without it, `$near` queries fail. Discovery won't work.
10. **Proof photo hash retained** — `sha256Hash` stays in DB even after deletion (audit/dispute).
11. **Response envelope** — All API responses: `{ success, message, data }`. Frontend reads `response.data` (Axios) then `.data` for payload.
12. **Photo URL pattern** — Photos stored as `/uploads/filename.jpg`. Frontend prepends `VITE_API_URL` to get full URL.

---

*This document is the single source of truth for the SiteMitra project. Read it at the start of every session before making any changes. Update it when any significant change is made — deployment, new credentials, features completed, or architecture changed.*
