const express = require('express');
const router = express.Router();
const { convertRateLimiter } = require('../middleware/rateLimiter');
const { convertYoutube, getYoutubeInfo } = require('../controllers/youtubeController');

// GET /api/youtube/info?url=...
router.get('/info', convertRateLimiter, getYoutubeInfo);

// POST /api/youtube/convert
router.post('/convert', convertRateLimiter, convertYoutube);

module.exports = router;
