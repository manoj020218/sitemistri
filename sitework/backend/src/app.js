require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const authRoutes       = require('./routes/auth.routes');
const techRoutes       = require('./routes/technician.routes');
const siRoutes         = require('./routes/si.routes');
const discoveryRoutes  = require('./routes/discovery.routes');
const siteWorkRoutes   = require('./routes/sitework.routes');
const publicRoutes     = require('./routes/public.routes');
const adminRoutes      = require('./routes/admin.routes');

const app = express();

// Trust Nginx reverse proxy so rate-limiter sees real client IP from X-Forwarded-For
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

// Body parsing — uploads go through multer, keep JSON limit tight
app.use(express.json({ limit: '100kb' }));

// Serve uploads under /api/uploads/ so Nginx proxy forwards them to Express
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/technician', techRoutes);
app.use('/api/si',         siRoutes);
app.use('/api/discovery',  discoveryRoutes);
app.use('/api/site-work',  siteWorkRoutes);
app.use('/api/public',     publicRoutes);
app.use('/api/admin',      adminRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', version: '1.0.0' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

module.exports = app;
