const rateLimit = require('express-rate-limit');

/** Global limiter: 100 req / 15 min per IP */
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** Strict limiter for conversion endpoints: 10 req / 15 min per IP */
const convertRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.CONVERT_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Conversion limit reached. Please wait before converting more files.' },
  keyGenerator: (req) => req.ip, // IP-based throttling
});

module.exports = { globalRateLimiter, convertRateLimiter };
