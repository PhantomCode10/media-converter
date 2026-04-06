const express = require('express');
const router = express.Router();
const { convertRateLimiter } = require('../middleware/rateLimiter');
const { convertInstagram, getInstagramInfo } = require('../controllers/instagramController');

// GET /api/instagram/info?url=...
router.get('/info', convertRateLimiter, getInstagramInfo);

// POST /api/instagram/convert
router.post('/convert', convertRateLimiter, convertInstagram);

module.exports = router;
