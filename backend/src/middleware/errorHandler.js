const logger = require('../utils/logger');

/**
 * Central error handler — must be registered LAST with app.use()
 * Converts known error types to appropriate HTTP responses.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('%s %s — %s', req.method, req.path, err.message);

  // CORS rejection
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }

  // yt-dlp / download errors — parse common messages into user-friendly text
  if (err.message) {
    const msg = err.message.toLowerCase();

    if (msg.includes('private') || msg.includes('login required') || msg.includes('sign in')) {
      return res.status(403).json({ error: 'This content is private or requires login.' });
    }
    if (msg.includes('not available') || msg.includes('unavailable') || msg.includes('removed')) {
      return res.status(404).json({ error: 'Content not available or has been removed.' });
    }
    if (msg.includes('no video formats') || msg.includes('requested format not available')) {
      return res.status(422).json({ error: 'Requested quality/format is not available for this video.' });
    }
    if (msg.includes('rate') || msg.includes('429') || msg.includes('throttl')) {
      return res.status(429).json({ error: 'Source platform is throttling requests. Try again in a moment.' });
    }
    if (msg.includes('urlopen error') || msg.includes('network') || msg.includes('timeout')) {
      return res.status(502).json({ error: 'Network error while fetching media. Please try again.' });
    }
  }

  // Generic server error (don't leak stack traces in production)
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
