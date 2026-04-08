require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

const logger = require('./utils/logger');
const { initDownloadsDir, cleanupExpiredFiles } = require('./utils/fileManager');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const youtubeRoutes = require('./routes/youtube');
const instagramRoutes = require('./routes/instagram');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow file downloads
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment preview/production URL for this project
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/media-converter[\w-]*\.vercel\.app$/.test(origin)
    ) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '10kb' })); // keep the body small
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: { write: (m) => logger.http(m.trim()) } }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ─── Static: serve downloaded files ──────────────────────────────────────────
const downloadsDir = path.resolve(process.env.DOWNLOADS_DIR || './downloads');
app.use('/files', express.static(downloadsDir, {
  index: false,
  dotfiles: 'deny',
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/youtube', youtubeRoutes);
app.use('/api/instagram', instagramRoutes);

// Download by fileId (prevents directory traversal via UUID-only lookup)
const { getFilePath } = require('./utils/fileManager');
app.get('/api/download/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    // Validate UUID format to prevent path traversal
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const fileInfo = await getFilePath(fileId);
    if (!fileInfo) return res.status(404).json({ error: 'File not found or expired' });

    res.download(fileInfo.filePath, fileInfo.filename, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    next(err);
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────
// On Vercel (serverless) the IIFE still runs per cold start; initDownloadsDir
// creates /tmp/downloads which IS writable. app.listen is a no-op on serverless
// because @vercel/node intercepts requests directly via module.exports.
(async () => {
  try {
    await initDownloadsDir();
  } catch (err) {
    // Non-fatal on serverless if /tmp is not yet available at import time
    logger.warn('initDownloadsDir warning: %s', err.message);
  }

  // Cleanup expired files every 10 minutes (runs in long-lived processes only)
  cron.schedule('*/10 * * * *', () => {
    cleanupExpiredFiles().catch((err) =>
      logger.error('Cleanup cron error: %s', err.message)
    );
  });

  // Only bind a port when running as a traditional Node.js server (not serverless)
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  }
})();

module.exports = app; // export for @vercel/node and testing
