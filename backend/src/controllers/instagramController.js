const { validateInstagramUrl } = require('../utils/validator');
const { downloadInstagram, fetchInstagramInfo } = require('../services/instagramService');
const { registerFile } = require('../utils/fileManager');
const logger = require('../utils/logger');

/**
 * GET /api/instagram/info?url=<instagramUrl>
 * Returns post metadata without downloading
 */
async function getInstagramInfo(req, res, next) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url query parameter is required' });

    const validation = validateInstagramUrl(url);
    if (!validation.valid) return res.status(400).json({ error: validation.message });

    const info = await fetchInstagramInfo(url);
    res.json(info);
  } catch (err) {
    logger.error('getInstagramInfo error: %s', err.message);
    next(err);
  }
}

/**
 * POST /api/instagram/convert
 * Body: { url, format: 'mp3'|'mp4', quality: 'best'|'medium' }
 */
async function convertInstagram(req, res, next) {
  try {
    const { url, format, quality } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!url || !format || !quality) {
      return res.status(400).json({ error: 'url, format, and quality are required' });
    }

    const validation = validateInstagramUrl(url);
    if (!validation.valid) return res.status(400).json({ error: validation.message });

    const validFormats = ['mp3', 'mp4'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: `format must be one of: ${validFormats.join(', ')}` });
    }

    const validQualities = format === 'mp3' ? ['128kbps', '320kbps'] : ['best', 'medium'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({ error: `quality must be one of: ${validQualities.join(', ')}` });
    }

    logger.info('Instagram convert request: format=%s quality=%s url=%s', format, quality, url);

    // ── Process ───────────────────────────────────────────────────────────────
    const result = await downloadInstagram({ url, format, quality });

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
    logger.error('convertInstagram error: %s', err.message);
    next(err);
  }
}

module.exports = { convertInstagram, getInstagramInfo };
