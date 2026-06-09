# Site Work Network — MVP Phase 1

> Free field-service discovery app for System Integrators and CCTV field technicians.

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env      # Fill in all values
npm install
npm run dev               # Development (nodemon)
npm start                 # Production
```

### Frontend
```bash
cd frontend
cp .env.example .env      # Set VITE_API_URL
npm install
npm run dev               # Development
npm run build             # Production build → dist/
```

## Stack
- **Frontend:** React 18 + Vite + PWA (vite-plugin-pwa) + React Router 6
- **Backend:**  Node.js + Express + Mongoose
- **Database:** MongoDB 7+ with 2dsphere index
- **Auth:**     Google OAuth (one-click) + JWT
- **Push:**     Firebase Cloud Messaging (FCM)
- **Maps:**     Leaflet.js + OpenStreetMap (no paid APIs)

## Project Structure
See `sitework-architecture.md` for the complete directory map,
all API endpoints, MongoDB schemas, and deployment checklist.

## Frontend Screens (already built — in this package)
| File | Screen |
|---|---|
| sitework-landing.html            | Marketing landing page |
| sitework-onboarding.jsx          | Onboarding (login → T&C → profile) |
| sitework-technician-dashboard.jsx| Technician dashboard |
| sitework-si-dashboard.jsx        | SI dashboard + nearby search |
| sitework-detail-close.jsx        | Site Work detail + close flow |
| sitework-admin-panel.jsx         | Admin panel |
| sitework-whatsapp-templates.jsx  | WhatsApp share templates |

## Key Rules
- No payment gateway, no wallet, no escrow
- No OTP (Google login only)
- Max 1 proof photo per Site Work (auto-deleted after SI closes)
- Exact location only shown after Site Work accepted
- No self-assignment (siUserId !== technicianUserId)
- All payments between SI and technician directly
