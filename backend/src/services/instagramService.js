/**
 * Instagram Service
 * Downloads public Instagram posts/reels using yt-dlp (supports Instagram natively).
 * Falls back to a lightweight oEmbed-based metadata fetch.
 *
 * LIMITATION: Private content, stories (without session auth), and some
 * region-locked posts cannot be downloaded. The service returns a clear
 * error message in those cases.
 */
const path = require('path');
const fsp = require('fs').promises;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');
const YTDlpWrap = require('yt-dlp-wrap').default;
const axios = require('axios');

const { getDownloadsDir } = require('../utils/fileManager');
const logger = require('../utils/logger');

const YTDLP_BIN_DIR = path.resolve('./bin');
const YTDLP_BIN_PATH =
  process.env.YTDLP_BINARY_PATH ||
  path.join(YTDLP_BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

let _ytDlp = null;
async function getYtDlp() {
  if (_ytDlp) return _ytDlp;
  if (!fs.existsSync(YTDLP_BIN_PATH)) {
    await fsp.mkdir(YTDLP_BIN_DIR, { recursive: true });
    await YTDlpWrap.downloadFromGithub(YTDLP_BIN_PATH);
  }
  _ytDlp = new YTDlpWrap(YTDLP_BIN_PATH);
  return _ytDlp;
}

/**
 * Fetch Instagram post metadata via oEmbed (public only, no auth required)
 */
async function fetchInstagramInfo(url) {
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&maxwidth=320`;
    const { data } = await axios.get(oembedUrl, { timeout: 8000 });
    return {
      title: data.title || 'Instagram Post',
      thumbnail: data.thumbnail_url,
      author: data.author_name,
      platform: 'instagram',
    };
  } catch {
    // oEmbed may fail for reels or private posts — return generic info
    return {
      title: 'Instagram Post',
      thumbnail: null,
      author: null,
      platform: 'instagram',
    };
  }
}

/**
 * Download Instagram media using yt-dlp
 * @param {{ url: string, format: 'mp3'|'mp4', quality: 'best'|'medium' }} opts
 */
async function downloadInstagram({ url, format, quality }) {
  const dlp = await getYtDlp();
  const fileId = uuidv4();
  const downloadsDir = getDownloadsDir();
  const outputBase = path.join(downloadsDir, fileId);

  // Retrieve metadata for display
  let title = 'instagram_post';
  let thumbnail = null;
  try {
    const raw = await dlp.execPromise([
      url, '--dump-json', '--no-playlist', '--no-warnings',
    ]);
    const info = JSON.parse(raw);
    title = info.title || info.description?.substring(0, 50) || 'instagram_post';
    thumbnail = info.thumbnail;
  } catch (metaErr) {
    logger.warn('Instagram metadata fetch failed: %s', metaErr.message);
    // Continue — attempt download anyway
  }

  const safeTitle = sanitize(title).replace(/\s+/g, '_').substring(0, 60) || 'instagram_post';

  if (format === 'mp3') {
    const outputFile = `${outputBase}.mp3`;
    const audioQuality = quality === '320kbps' ? '0' : '5';

    await dlp.execPromise([
      url,
      '--no-playlist',
      '--no-warnings',
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', audioQuality,
      '-o', outputFile,
    ]);

    const stats = await fsp.stat(outputFile);
    return {
      fileId,
      filename: `${safeTitle}.mp3`,
      filePath: outputFile,
      format: 'mp3',
      quality,
      size: stats.size,
      title,
      thumbnail,
    };
  }

  // --- MP4 ---
  const outputFile = `${outputBase}.mp4`;

  // For Instagram quality: 'best' uses best available, 'medium' caps at 720p
  const formatSelector =
    quality === 'best'
      ? 'bestvideo[ext=mp4]+bestaudio/best[ext=mp4]/best'
      : 'bestvideo[height<=720][ext=mp4]+bestaudio/best[height<=720][ext=mp4]/best[height<=720]/best';

  await dlp.execPromise([
    url,
    '--no-playlist',
    '--no-warnings',
    '-f', formatSelector,
    '--merge-output-format', 'mp4',
    '-o', outputFile,
  ]);

  const stats = await fsp.stat(outputFile);
  return {
    fileId,
    filename: `${safeTitle}.mp4`,
    filePath: outputFile,
    format: 'mp4',
    quality,
    size: stats.size,
    title,
    thumbnail,
  };
}

module.exports = { downloadInstagram, fetchInstagramInfo };
