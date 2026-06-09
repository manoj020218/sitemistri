# Site Work Network — Complete Project Architecture
## For Claude Code: Backend Implementation Guide

---

## 1. PROJECT OVERVIEW

**Product:** Free field-service discovery app for System Integrators (SI) and CCTV field technicians  
**Stack:** React PWA + Node.js/Express + MongoDB  
**Phase:** MVP Phase 1  
**Key constraint:** No payment gateway, no OTP, no Google Maps paid APIs

---

## 2. DIRECTORY STRUCTURE

```
sitework-network/
├── frontend/                          # React PWA
│   ├── public/
│   │   ├── manifest.json              # PWA manifest
│   │   ├── sw.js                      # Service worker
│   │   └── icons/                     # PWA icons (192, 512)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                    # Root router
│   │   ├── pages/
│   │   │   ├── Landing.jsx            # ← sitework-landing.html (convert to JSX)
│   │   │   ├── Onboarding.jsx         # ← sitework-onboarding.jsx
│   │   │   ├── TechDashboard.jsx      # ← sitework-technician-dashboard.jsx
│   │   │   ├── SIDashboard.jsx        # ← sitework-si-dashboard.jsx
│   │   │   ├── SiteWorkDetail.jsx     # ← sitework-detail-close.jsx
│   │   │   ├── WhatsAppTemplates.jsx  # ← sitework-whatsapp-templates.jsx
│   │   │   ├── AdminPanel.jsx         # ← sitework-admin-panel.jsx
│   │   │   ├── PublicTechProfile.jsx  # Public profile page /t/:slug
│   │   │   ├── PublicSIHiring.jsx     # Public SI hiring page /si/:slug
│   │   │   ├── TermsPage.jsx
│   │   │   └── PrivacyPage.jsx
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Tag.jsx
│   │   │   │   ├── Btn.jsx
│   │   │   │   ├── Chip.jsx
│   │   │   │   ├── Stars.jsx
│   │   │   │   ├── AvailDot.jsx
│   │   │   │   ├── Timeline.jsx
│   │   │   │   ├── ProfileStrengthBar.jsx
│   │   │   │   └── BottomNav.jsx
│   │   │   ├── auth/
│   │   │   │   ├── GoogleLoginBtn.jsx
│   │   │   │   └── TermsGate.jsx
│   │   │   ├── technician/
│   │   │   │   ├── AvailToggle.jsx
│   │   │   │   ├── TechProfileBuilder.jsx
│   │   │   │   └── TrustScoreCard.jsx
│   │   │   ├── si/
│   │   │   │   ├── SiteSearchForm.jsx
│   │   │   │   ├── TechResultCard.jsx
│   │   │   │   ├── AssignWorkForm.jsx
│   │   │   │   └── TechnicianPool.jsx
│   │   │   └── sitework/
│   │   │       ├── StatusBadge.jsx
│   │   │       ├── ProofPhotoUpload.jsx
│   │   │       └── RatingForm.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useLocation.js
│   │   │   └── useFCM.js
│   │   ├── services/
│   │   │   ├── api.js                 # Axios base + interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── technician.service.js
│   │   │   ├── si.service.js
│   │   │   ├── discovery.service.js
│   │   │   ├── sitework.service.js
│   │   │   └── fcm.service.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── whatsapp.js            # WA message builders
│   │   │   ├── profileText.js         # Auto-generate Hindi/EN bio
│   │   │   └── constants.js
│   │   └── tokens.js                  # Design tokens (shared with all JSX files)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                           # Node.js API
│   ├── src/
│   │   ├── app.js                     # Express app setup
│   │   ├── server.js                  # HTTP server start
│   │   ├── config/
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   ├── firebase.js            # FCM admin SDK init
│   │   │   └── env.js                 # Env validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── technician.routes.js
│   │   │   ├── si.routes.js
│   │   │   ├── discovery.routes.js
│   │   │   ├── sitework.routes.js
│   │   │   ├── public.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── fcm.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── technician.controller.js
│   │   │   ├── si.controller.js
│   │   │   ├── discovery.controller.js
│   │   │   ├── sitework.controller.js
│   │   │   ├── public.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── TechnicianProfile.model.js
│   │   │   ├── SIProfile.model.js
│   │   │   ├── SiteWork.model.js
│   │   │   ├── TechnicianPool.model.js
│   │   │   └── NotificationToken.model.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # JWT verify
│   │   │   ├── admin.middleware.js     # Admin role check
│   │   │   ├── rateLimiter.js
│   │   │   ├── upload.middleware.js    # Multer proof photo
│   │   │   └── validate.middleware.js
│   │   ├── services/
│   │   │   ├── google.auth.service.js # Google token verify
│   │   │   ├── jwt.service.js
│   │   │   ├── fcm.service.js
│   │   │   ├── discovery.service.js   # Geospatial + ranking
│   │   │   ├── profileText.service.js # Auto-gen bio
│   │   │   └── proofCleanup.service.js# Cron job
│   │   ├── jobs/
│   │   │   └── proofPhotoCleanup.job.js # node-cron daily
│   │   └── utils/
│   │       ├── response.js            # Standard API response
│   │       ├── constants.js
│   │       └── geoUtils.js
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── PROJECT_DOCUMENT.md            # Original spec
│   ├── API_REFERENCE.md               # All endpoints
│   └── DEPLOYMENT.md
│
└── docker-compose.yml                 # Optional: MongoDB + app
```

---

## 3. ENVIRONMENT VARIABLES (.env)

```env
# Server
NODE_ENV=production
PORT=3000
APP_BASE_URL=https://yourdomain.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sitework

# Auth
JWT_SECRET=change_me_to_long_random_string
JWT_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase FCM
FCM_PROJECT_ID=your_firebase_project_id
FCM_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# File Storage
TEMP_UPLOAD_DIR=/var/app/uploads/temp
PROOF_PHOTO_MAX_SIZE_KB=400
PROOF_PHOTO_AUTO_DELETE_DAYS=7

# Terms
TERMS_VERSION=v1.0
PRIVACY_VERSION=v1.0

# Admin
ADMIN_EMAILS=admin@yourdomain.com
```

---

## 4. MONGODB MODELS

### 4.1 users
```js
{
  _id: ObjectId,
  googleId: String (unique, required),
  email: String (unique, required),
  emailVerified: Boolean,
  name: String,
  photoUrl: String,
  mobile: String,
  mobileStatus: {
    type: String,
    enum: ['SELF_ADDED','SI_CALL_VERIFIED','WORK_VERIFIED','MULTI_SI_VERIFIED'],
    default: 'SELF_ADDED'
  },
  roles: [{ type: String, enum: ['TECHNICIAN','SI'] }],
  language: { type: String, enum: ['hi','en'], default: 'hi' },
  termsAccepted: Boolean,
  termsVersion: String,
  privacyVersion: String,
  acceptedAt: Date,
  acceptedIp: String,
  acceptedUserAgent: String,
  isBlocked: { type: Boolean, default: false },
  blockedReason: String,
  createdAt: Date,
  lastActiveAt: Date,
}
// Indexes: googleId, email, mobile, isBlocked
```

### 4.2 technicianProfiles
```js
{
  userId: ObjectId (ref: users, unique),
  city: String,
  workingAreas: [String],
  skills: [{
    type: String,
    enum: ['CCTV_INSTALLATION','CAMERA_SERVICE','DVR_NVR','IP_CAMERA',
           'LAN_CABLING','WIFI_BRIDGE','BIOMETRIC','ACCESS_CONTROL',
           'ALARM_SYSTEM','EDGEYE_SETUP','NETWORKING','OTHER']
  }],
  workTypes: [String],
  experienceLevel: {
    type: String,
    enum: ['NEW','1_PLUS','3_PLUS','5_PLUS','10_PLUS']
  },
  tools: [String],
  vehicle: { type: String, enum: ['BIKE','SCOOTER','CAR','NONE'] },
  availability: {
    type: String,
    enum: ['AVAILABLE_NOW','AVAILABLE_TODAY','AVAILABLE_TOMORROW','BUSY','OFFLINE'],
    default: 'OFFLINE'
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],  // [lng, lat]
    accuracy: Number,
    updatedAt: Date,
  },
  generatedBioHi: String,
  generatedBioEn: String,
  profileSlug: String (unique),
  profileStrength: { type: Number, default: 0 },
  trustStats: {
    completedSiteWork: { type: Number, default: 0 },
    uniqueSIs: { type: Number, default: 0 },
    repeatSIWork: { type: Number, default: 0 },
    noShow: { type: Number, default: 0 },
    cancelledAfterAccept: { type: Number, default: 0 },
    overdueOpenWork: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  createdAt: Date,
  updatedAt: Date,
}
// CRITICAL INDEX:
// db.technicianProfiles.createIndex({ currentLocation: "2dsphere" })
// Additional: userId, profileSlug, availability, skills
```

### 4.3 siProfiles
```js
{
  userId: ObjectId (ref: users, unique),
  businessName: String,
  city: String,
  workingAreas: [String],
  businessType: {
    type: String,
    enum: ['SI','CONTRACTOR','DEALER','SERVICE_PROVIDER']
  },
  workCategories: [String],
  siSlug: String (unique),
  createdAt: Date,
  updatedAt: Date,
}
```

### 4.4 siteWorks
```js
{
  _id: ObjectId,
  siUserId: ObjectId (ref: users, required),
  technicianUserId: ObjectId (ref: users, required),
  clientName: String,
  clientMobile: String,
  siteAddress: String,
  siteLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],  // [lng, lat]
  },
  workType: String,
  requiredSkills: [String],
  description: String,
  preferredVisitTime: Date,
  agreedVisitCharge: Number,
  materialIncluded: { type: String, enum: ['YES','NO','NOT_SURE'] },
  paymentBy: { type: String, enum: ['SI','CLIENT','OTHER'] },
  paymentMode: { type: String, enum: ['CASH','UPI','LATER','DIRECT'] },
  status: {
    type: String,
    enum: ['DRAFT','PENDING_ACCEPTANCE','ACCEPTED','REJECTED',
           'ON_THE_WAY','REACHED','WORK_STARTED','COMPLETED',
           'CLOSED','CANCELLED_BY_SI','CANCELLED_BY_TECH',
           'DISPUTED','OVERDUE'],
    default: 'PENDING_ACCEPTANCE'
  },
  timestamps: {
    createdAt: Date,
    assignedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    travelStartedAt: Date,
    reachedAt: Date,
    workStartedAt: Date,
    technicianCompletedAt: Date,
    siClosedAt: Date,
    cancelledAt: Date,
  },
  proof: {
    photoUploaded: { type: Boolean, default: false },
    photoPath: String,
    uploadedAt: Date,
    acceptedAt: Date,
    deletedAt: Date,
    storageStatus: {
      type: String,
      enum: ['NONE','TEMP_STORED','DELETED','EXPIRED'],
      default: 'NONE'
    },
    sha256Hash: String,
  },
  ratingBySI: {
    stars: Number,
    reachedOnTime: Boolean,
    skillMatch: Boolean,
    workCompleted: Boolean,
    behaviourGood: Boolean,
    comment: String,
    ratedAt: Date,
  },
  privateIssueByTechnician: {
    hasIssue: { type: Boolean, default: false },
    reason: String,
    comment: String,
    reportedAt: Date,
  },
  createdAt: Date,
  updatedAt: Date,
}
// Indexes: siUserId, technicianUserId, status, createdAt
// Compound: { technicianUserId: 1, status: 1 }
// Compound: { siUserId: 1, status: 1 }
```

### 4.5 technicianPool
```js
{
  siUserId: ObjectId (ref: users),
  technicianUserId: ObjectId (ref: users),
  source: {
    type: String,
    enum: ['SI_LINK','CALLED','ASSIGNED','COMPLETED_WORK']
  },
  status: {
    type: String,
    enum: ['NEW_CONNECTION','CALL_VERIFIED','FIRST_WORK_DONE','TRUSTED_BY_SI'],
    default: 'NEW_CONNECTION'
  },
  createdAt: Date,
  updatedAt: Date,
}
// Unique compound index: { siUserId: 1, technicianUserId: 1 }
```

### 4.6 notificationTokens
```js
{
  userId: ObjectId (ref: users),
  fcmToken: String,
  platform: { type: String, enum: ['web','android','ios'] },
  createdAt: Date,
  lastUsedAt: Date,
}
// Index: userId, fcmToken (unique)
```

---

## 5. ALL API ENDPOINTS

### AUTH
```
POST   /api/auth/google               # Verify Google token, create/get user, return JWT
GET    /api/auth/me                   # Get current user (JWT required)
POST   /api/auth/accept-terms         # Accept T&C + Privacy Policy
POST   /api/auth/mobile               # Set mobile number
POST   /api/auth/roles                # Set roles [TECHNICIAN, SI, both]
POST   /api/auth/fcm-token            # Register FCM token
DELETE /api/auth/fcm-token            # Remove FCM token on logout
```

### TECHNICIAN
```
POST   /api/technician/profile        # Create profile
GET    /api/technician/profile        # Get own profile
PATCH  /api/technician/profile        # Update profile
POST   /api/technician/availability   # Update availability status
POST   /api/technician/location       # Update current location { lat, lng, accuracy }
GET    /api/technician/site-works     # My site works (as technician)
GET    /api/technician/trust-stats    # Own trust stats
```

### SI
```
POST   /api/si/profile                # Create SI profile
GET    /api/si/profile                # Get own SI profile
PATCH  /api/si/profile                # Update SI profile
GET    /api/si/site-works             # My site works (as SI)
GET    /api/si/technician-pool        # My technician pool
POST   /api/si/technician-pool        # Add to pool manually
GET    /api/si/hiring-link            # Get/generate SI hiring link
```

### DISCOVERY
```
POST   /api/discovery/nearby          # Search nearby technicians
# Body: { siteLocation: {lat, lng}, radiusKm, requiredSkills[], workType }
# Response: ranked technician list with distance, availability, trust stats
```

### SITE WORK
```
POST   /api/site-work                         # SI creates and assigns
GET    /api/site-work/:id                     # Get single site work
GET    /api/site-work                         # List (mine — SI or Tech view)
POST   /api/site-work/:id/accept              # Technician accepts
POST   /api/site-work/:id/reject              # Technician rejects
POST   /api/site-work/:id/start-travel        # Technician: on the way
POST   /api/site-work/:id/reached             # Technician: reached site
POST   /api/site-work/:id/start-work          # Technician: work started
POST   /api/site-work/:id/complete            # Technician: marks complete
POST   /api/site-work/:id/proof-photo         # Technician: upload proof (multipart)
POST   /api/site-work/:id/close               # SI: closes after review + rating
POST   /api/site-work/:id/cancel              # SI or Tech: cancel
POST   /api/site-work/:id/report-issue        # Technician: private issue report
```

### PUBLIC (no auth)
```
GET    /api/public/technician/:slug    # Public technician profile
GET    /api/public/si/:slug            # Public SI hiring page data
```

### ADMIN (admin role only)
```
GET    /api/admin/users                # List users (search, filter, paginate)
GET    /api/admin/users/:id            # Get user detail
POST   /api/admin/users/:id/block      # Block/unblock user
GET    /api/admin/site-works           # List all site works
GET    /api/admin/stats                # Platform overview stats
GET    /api/admin/city-stats           # City-wise breakdown
GET    /api/admin/proof-photos         # Proof photo cleanup list
POST   /api/admin/proof-photos/:id/force-delete  # Force delete proof photo
GET    /api/admin/terms-config         # Get terms versions
POST   /api/admin/terms-config         # Update terms versions
```

---

## 6. DISCOVERY SERVICE — RANKING ALGORITHM

```js
// POST /api/discovery/nearby
// MongoDB $geoNear + application-level scoring

async function rankTechnicians(results, requiredSkills, workType) {
  return results
    .map(tech => {
      let score = 0;

      // 1. Availability (highest weight)
      if (tech.availability === 'AVAILABLE_NOW')      score += 40;
      if (tech.availability === 'AVAILABLE_TODAY')    score += 20;
      if (tech.availability === 'AVAILABLE_TOMORROW') score += 5;

      // 2. Location freshness
      const ageMin = (Date.now() - tech.currentLocation.updatedAt) / 60000;
      if (ageMin < 5)   score += 20;
      if (ageMin < 15)  score += 15;
      if (ageMin < 30)  score += 10;
      if (ageMin < 60)  score += 5;

      // 3. Skill match
      const matched = (requiredSkills || []).filter(s => tech.skills.includes(s)).length;
      score += matched * 5;

      // 4. Distance (inverse — closer = higher)
      const km = tech.distanceKm;
      if (km < 2)  score += 15;
      if (km < 5)  score += 10;
      if (km < 10) score += 5;

      // 5. Trust (completed work)
      score += Math.min(tech.trustStats.completedSiteWork * 1.5, 15);
      score += Math.min(tech.trustStats.uniqueSIs * 2, 10);

      // 6. Penalise open/overdue work
      score -= tech.trustStats.overdueOpenWork * 10;

      return { ...tech, score };
    })
    .sort((a, b) => b.score - a.score);
}
```

---

## 7. PROOF PHOTO CRON JOB

```js
// backend/src/jobs/proofPhotoCleanup.job.js
// Runs daily at 2 AM

const cron = require('node-cron');

cron.schedule('0 2 * * *', async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const works = await SiteWork.find({
    'proof.storageStatus': 'TEMP_STORED',
    'proof.uploadedAt': { $lt: cutoff },
  });

  for (const work of works) {
    await deleteFile(work.proof.photoPath);
    await SiteWork.updateOne(
      { _id: work._id },
      {
        'proof.photoPath': null,
        'proof.storageStatus': 'EXPIRED',
        'proof.deletedAt': new Date(),
      }
    );
  }
});
```

---

## 8. FCM NOTIFICATION EVENTS

```js
// Trigger FCM for each of these events:
const FCM_EVENTS = {
  SITE_WORK_ASSIGNED:     'New Site Work request for you',
  TECH_ACCEPTED:          'Technician accepted your Site Work',
  TECH_REJECTED:          'Technician rejected your Site Work',
  TECH_ON_THE_WAY:        'Technician is on the way',
  TECH_REACHED:           'Technician has reached the site',
  TECH_COMPLETED:         'Technician marked work complete — review now',
  SI_CLOSED:              'SI has closed the Site Work',
  WORK_OVERDUE_REMINDER:  'Site Work is overdue — please update status',
  CLOSE_REMINDER:         'You have a pending Site Work to close',
};

// FCM payload structure:
{
  notification: { title, body },
  data: { siteWorkId, type: FCM_EVENT_KEY },
  token: recipientFcmToken,
}
```

---

## 9. AUTO-GENERATED PROFILE TEXT SERVICE

```js
// backend/src/services/profileText.service.js

function generateBio(profile, lang = 'hi') {
  const { name, city, skills, experienceLevel, tools, vehicle } = profile;

  const expMap = {
    hi: { NEW:'नए', '1_PLUS':'1+ साल', '3_PLUS':'3+ साल', '5_PLUS':'5+ साल', '10_PLUS':'10+ साल' },
    en: { NEW:'new', '1_PLUS':'1+ year', '3_PLUS':'3+ years', '5_PLUS':'5+ years', '10_PLUS':'10+ years' },
  };

  const skillStr = skills.slice(0, 4).join(', ');
  const exp = expMap[lang][experienceLevel] || '';
  const hasTools = tools?.length > 0;

  if (lang === 'hi') {
    return `${name} ${city} में CCTV / IP Camera technician हैं। इन्हें ${exp} का अनुभव है। इनके पास ${skillStr} का काम आता है।${hasTools ? ' इनके पास field work के tools हैं।' : ''} ये nearby client site पर काम के लिए उपलब्ध हैं।`;
  }
  return `${name} is a CCTV / IP Camera technician in ${city} with ${exp} of field experience. Available for ${skillStr} work.${hasTools ? ' Has field tools available.' : ''} Can visit nearby client sites.`;
}
```

---

## 10. SECURITY CHECKLIST

```
☐ Google OAuth client ID restricted to your domain
☐ All inputs sanitized (express-validator)
☐ JWT secret is long random string (min 64 chars)
☐ Rate limit: /api/discovery/nearby → 30/min per IP
☐ Rate limit: /api/public/* → 60/min per IP
☐ Rate limit: /api/auth/google → 10/min per IP
☐ Proof photo size limit: 400 KB max (Multer)
☐ Proof photo converted to WebP (sharp)
☐ Self-assignment prevented: siUserId !== technicianUserId
☐ Exact location NOT returned before site work accepted
☐ Admin routes behind admin middleware (email whitelist)
☐ Blocked users rejected at auth middleware
☐ MongoDB injection: use Mongoose schema validation
☐ CORS: restrict to your frontend domain in production
☐ Helmet.js: HTTP security headers
☐ HTTPS only in production
☐ .env never committed (add to .gitignore)
```

---

## 11. FRONTEND IMPLEMENTATION NOTES

### Connecting existing JSX screens to real API:

| Screen File | Key API Calls |
|---|---|
| `Onboarding.jsx` | `POST /api/auth/google` → `POST /api/auth/accept-terms` → `POST /api/auth/mobile` → `POST /api/auth/roles` → `POST /api/technician/profile` or `/api/si/profile` |
| `TechDashboard.jsx` | `POST /api/technician/availability` · `POST /api/technician/location` · `GET /api/technician/site-works` · `POST /api/site-work/:id/accept` |
| `SIDashboard.jsx` | `POST /api/discovery/nearby` · `GET /api/si/site-works` · `GET /api/si/technician-pool` |
| `SiteWorkDetail.jsx` | `GET /api/site-work/:id` · All status update endpoints · `POST /api/site-work/:id/proof-photo` · `POST /api/site-work/:id/close` |
| `AdminPanel.jsx` | All `/api/admin/*` endpoints |
| `WhatsAppTemplates.jsx` | No API — pure client-side template filling |

### PWA Setup (vite.config.js):
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Site Work Network',
        short_name: 'SiteWork',
        theme_color: '#e8630a',
        background_color: '#f5f0e8',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
```

### Google Login (frontend):
```js
// Use @react-oauth/google
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async ({ credential }) => {
    const res = await api.post('/api/auth/google', { credential });
    localStorage.setItem('token', res.data.token);
    // navigate to onboarding or dashboard
  }}
/>
```

---

## 12. DEPLOYMENT CHECKLIST

```
☐ VPS: Ubuntu 24 LTS, 2GB RAM minimum
☐ Node.js 20+
☐ MongoDB 7+ (local or Atlas)
☐ Nginx reverse proxy (port 80/443 → 3000)
☐ SSL: Let's Encrypt (certbot)
☐ PM2: process manager for Node.js
☐ Uploads dir: /var/app/uploads/temp (writable)
☐ .env configured with all prod values
☐ MongoDB indexes created (especially 2dsphere)
☐ FCM credentials added
☐ Google OAuth redirect URI set to prod domain
☐ Frontend build: npm run build → dist/ served via Nginx
☐ CORS origin set to prod frontend URL
☐ Cron job running (proof photo cleanup)
☐ Test FCM notification end-to-end
☐ Test PWA install on Android
```

---

## 13. PACKAGE.JSON DEPENDENCIES

### Backend
```json
{
  "dependencies": {
    "express": "^4.19",
    "mongoose": "^8.0",
    "jsonwebtoken": "^9.0",
    "google-auth-library": "^9.0",
    "firebase-admin": "^12.0",
    "multer": "^1.4",
    "sharp": "^0.33",
    "node-cron": "^3.0",
    "express-validator": "^7.0",
    "express-rate-limit": "^7.0",
    "helmet": "^7.0",
    "cors": "^2.8",
    "dotenv": "^16.0",
    "crypto": "built-in"
  },
  "devDependencies": {
    "nodemon": "^3.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1.6",
    "@react-oauth/google": "^0.12",
    "leaflet": "^1.9",
    "react-leaflet": "^4.2",
    "firebase": "^10.0"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "vite-plugin-pwa": "^0.19"
  }
}
```

---

## 14. FRONTEND FILES INCLUDED IN THIS PACKAGE

| File | Description |
|---|---|
| `sitework-landing.html` | Marketing landing page (Hindi/English, convert to JSX) |
| `sitework-onboarding.jsx` | Full onboarding flow (Google login → T&C → roles → profile builder) |
| `sitework-technician-dashboard.jsx` | Technician home, active work, accept/reject, profile, history |
| `sitework-si-dashboard.jsx` | SI home, nearby search, results, assign work, pool |
| `sitework-detail-close.jsx` | Site Work detail + close flow (4 states: active/review/closed/tech-pending) |
| `sitework-admin-panel.jsx` | Admin panel (users, site works, cities, proof photos, terms) |
| `sitework-whatsapp-templates.jsx` | WhatsApp share templates utility (8 templates, Hindi + English) |
| `sitework-architecture.md` | This file |
