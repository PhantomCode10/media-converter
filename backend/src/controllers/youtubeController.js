const { validateYoutubeUrl } = require('../utils/validator');
const { downloadYoutube, fetchYoutubeInfo } = require('../services/youtubeService');
const { registerFile } = require('../utils/fileManager');
const logger = require('../utils/logger');

/**
 * GET /api/youtube/info?url=<youtubeUrl>
 * Returns video metadata without downloading
 */
async function getYoutubeInfo(req, res, next) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url query parameter is required' });

    const validation = validateYoutubeUrl(url);
    if (!validation.valid) return res.status(400).json({ error: validation.message });

    const info = await fetchYoutubeInfo(url);
    res.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploader: info.uploader,
      availableFormats: info.availableFormats,
    });
  } catch (err) {
    logger.error('getYoutubeInfo error: %s', err.message);
    next(err);
  }
}

/**
 * POST /api/youtube/convert
 * Body: { url, format: 'mp3'|'mp4', quality: '128kbps'|'320kbps'|'360p'|'720p'|'1080p' }
 */
async function convertYoutube(req, res, next) {
  try {
    const { url, format, quality } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!url || !format || !quality) {
      return res.status(400).json({ error: 'url, format, and quality are required' });
    }

    const validation = validateYoutubeUrl(url);
    if (!validation.valid) return res.status(400).json({ error: validation.message });

    const validFormats = ['mp3', 'mp4'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: `format must be one of: ${validFormats.join(', ')}` });
    }

    const validQualities = format === 'mp3'
      ? ['128kbps', '320kbps']
      : ['144p', '360p', '720p', '1080p'];

    if (!validQualities.includes(quality)) {
      return res.status(400).json({ error: `quality must be one of: ${validQualities.join(', ')}` });
    }

    logger.info('YouTube convert request: format=%s quality=%s url=%s', format, quality, url);

    // ── Process ───────────────────────────────────────────────────────────────
    const result = await downloadYoutube({ url, format, quality });

    // Register for tracked deletion
    await registerFile(result.fileId, result.filePath, result.filename);

    const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${result.fileId}`;

    res.json({
      success: true,
      fileId: result.fileId,
      title: result.title,
      thumbnail: result.thumbnail,
      filename: result.filename,
      format: result.format,
      quality: result.quality,
      size: result.size,
      downloadUrl,
    });
  } catch (err) {
    logger.error('convertYoutube error: %s', err.message);
    next(err);
  }
}

module.exports = { convertYoutube, getYoutubeInfo };
