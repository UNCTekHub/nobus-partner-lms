import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import orgRoutes from './routes/organizations.js';
import userRoutes from './routes/users.js';
import progressRoutes from './routes/progress.js';
import certificateRoutes from './routes/certificates.js';
import notificationRoutes from './routes/notifications.js';
import discussionRoutes from './routes/discussions.js';
import adminRoutes from './routes/admin.js';
import gamificationRoutes from './routes/gamification.js';
import publicApiRoutes from './routes/publicApi.js';
import dealRoutes from './routes/deals.js';
import pipelineRoutes from './routes/pipeline.js';
import resourceRoutes from './routes/resources.js';
import labRoutes from './routes/labs.js';
import quoteRoutes from './routes/quotes.js';
import partnerRoutes from './routes/partner.js';
import mdfRoutes from './routes/mdf.js';
import supportRoutes from './routes/support.js';
import teamRoutes from './routes/team.js';
import db from './db.js';
import { runTrainingReminders } from './services/trainingReminders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Security headers. CSP is disabled here because the SPA is served from the same
// origin and uses inline module scripts from the Vite build; other helmet
// protections (HSTS, no-sniff, frameguard, referrer-policy, etc.) are applied.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS: the SPA is same-origin in production. Restrict to an explicit allow-list
// via CORS_ORIGINS (comma-separated) when set; otherwise reflect the request
// origin (no cookies are used, so this is not a CSRF vector) for local dev.
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: corsOrigins.length ? corsOrigins : true,
  credentials: false,
}));

app.use(express.json({ limit: '5mb' }));
app.use('/api', globalLimiter);

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/public', publicApiRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/mdf', mdfRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/team', teamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', node: process.version, timestamp: new Date().toISOString() });
});

// Catch-all for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler for API routes. Internal error detail is logged server
// side but never returned to clients (prevents information disclosure).
app.use('/api', (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

// Serve frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nobus PartnerCentral server v2.0 running on http://localhost:${PORT}`);

  // Training reminder + escalation sweep: once shortly after boot, then every 12h.
  // Each run is idempotent (per-assignment cooldown), so overlap is harmless.
  const sweep = () => {
    try {
      const r = runTrainingReminders(db);
      if (r.reminded || r.escalated) console.log(`[Training] reminders: ${r.reminded} sent, ${r.escalated} escalated (of ${r.scanned})`);
    } catch (err) { console.error('[Training] reminder sweep failed:', err.message); }
  };
  setTimeout(sweep, 30 * 1000).unref();
  setInterval(sweep, 12 * 60 * 60 * 1000).unref();
});
