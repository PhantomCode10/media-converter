/**
 * YouTube Service
 * Uses yt-dlp (via yt-dlp-wrap) to fetch video info and download media.
 * yt-dlp binary is auto-downloaded to ./bin/ on first use if not present.
 */
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');
const YTDlpWrap = require('yt-dlp-wrap').default;

const { getDownloadsDir } = require('../utils/fileManager');
const logger = require('../utils/logger');

// On Vercel/serverless, the project root is read-only; write binaries to /tmp
const YTDLP_BIN_DIR =
  process.env.YTDLP_BIN_DIR ||
  (process.platform === 'win32' ? path.resolve('./bin') : '/tmp/bin');
const YTDLP_BIN_PATH =
  process.env.YTDLP_BINARY_PATH ||
  path.join(YTDLP_BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

/** Singleton wrapper instance */
let _ytDlp = null;

async function getYtDlp() {
  if (_ytDlp) return _ytDlp;

  // Try system PATH first via env var, otherwise ensure binary exists
  if (process.env.YTDLP_BINARY_PATH) {
    _ytDlp = new YTDlpWrap(process.env.YTDLP_BINARY_PATH);
    return _ytDlp;
  }

  // Auto-download binary if not found
  if (!fs.existsSync(YTDLP_BIN_PATH)) {
    logger.info('yt-dlp binary not found — downloading from GitHub...');
    await fsp.mkdir(YTDLP_BIN_DIR, { recursive: true });
    await YTDlpWrap.downloadFromGithub(YTDLP_BIN_PATH);
    logger.info('yt-dlp binary downloaded to %s', YTDLP_BIN_PATH);
  }

  _ytDlp = new YTDlpWrap(YTDLP_BIN_PATH);
  return _ytDlp;
}

/**
 * Build common yt-dlp flags
 */
function commonFlags(verbose = false) {
  const flags = ['--no-playlist', '--no-warnings'];
  if (verbose || process.env.YTDLP_VERBOSE === 'true') flags.push('--verbose');
  return flags;
}

/**
 * Fetch metadata for a YouTube video without downloading it
 */
async function fetchYoutubeInfo(url) {
  const dlp = await getYtDlp();
  const raw = await dlp.execPromise([url, '--dump-json', ...commonFlags()]);
  const info = JSON.parse(raw);

  const availableFormats = getAvailableFormats(info.formats || []);

  return {
    title: info.title || 'Untitled',
    duration: info.duration,
    thumbnail: info.thumbnail,
    uploader: info.uploader,
    availableFormats,
  };
}

/**
 * Extract deduplicated quality options from yt-dlp format list
 */
function getAvailableFormats(formats) {
  const videoHeights = new Set();
  for (const f of formats) {
    if (f.vcodec && f.vcodec !== 'none' && f.height) {
      videoHeights.add(f.height);
    }
  }
  const heights = [...videoHeights].sort((a, b) => a - b);

  return {
    video: heights.map((h) => `${h}p`),
    audio: ['128kbps', '320kbps'],
  };
}

/**
 * Maps audio quality string to yt-dlp audio-quality value (VBR 0–10)
 */
function audioQualityFlag(quality) {
  return quality === '320kbps' ? '0' : '5'; // 0 = best, 5 = ~128kbps
}

/**
 * Maps video quality string to max height integer
 */
function videoHeight(quality) {
  const map = { '144p': 144, '360p': 360, '720p': 720, '1080p': 1080 };
  return map[quality] || 720;
}

/**
 * Download YouTube media and return file metadata
 * @param {{ url: string, format: 'mp3'|'mp4', quality: string }} opts
 */
async function downloadYoutube({ url, format, quality }) {
  const dlp = await getYtDlp();
  const fileId = uuidv4();
  const downloadsDir = getDownloadsDir();
  const outputBase = path.join(downloadsDir, fileId);

  // Fetch title for a human-friendly filename
  let title = 'video';
  try {
    const raw = await dlp.execPromise([url, '--dump-json', '--no-playlist', '--no-warnings']);
    const info = JSON.parse(raw);
    title = info.title || 'video';
  } catch (_) {
    // Non-fatal; continue with generic name
  }

  const safeTitle = sanitize(title).replace(/\s+/g, '_').substring(0, 60) || 'video';

  if (format === 'mp3') {
    const outputFile = `${outputBase}.mp3`;
    const args = [
      url,
      '--no-playlist',
      '--no-warnings',
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', audioQualityFlag(quality),
      '-o', outputFile,
    ];

    logger.debug('yt-dlp args: %o', args);
    await dlp.execPromise(args);

    const stats = await fsp.stat(outputFile);
    return {
      fileId,
      filename: `${safeTitle}.mp3`,
      filePath: outputFile,
      format: 'mp3',
      quality,
      size: stats.size,
      title,
      thumbnail: null,
    };
  }

  // --- MP4 ---
  const height = videoHeight(quality);
  const outputFile = `${outputBase}.mp4`;

  // Format selector: prefer height-matched MP4 with M4A audio, fall back gracefully
  const formatSelector = [
    `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]`,
    `bestvideo[height<=${height}]+bestaudio`,
    `best[height<=${height}]`,
    'best',
  ].join('/');

  const args = [
    url,
    '--no-playlist',
    '--no-warnings',
    '-f', formatSelector,
    '--merge-output-format', 'mp4',
    '-o', outputFile,
  ];

  logger.debug('yt-dlp args: %o', args);
  await dlp.execPromise(args);

  const stats = await fsp.stat(outputFile);
  return {
    fileId,
    filename: `${safeTitle}.mp4`,
    filePath: outputFile,
    format: 'mp4',
    quality,
    size: stats.size,
    title,
    thumbnail: null,
  };
}

module.exports = { downloadYoutube, fetchYoutubeInfo };
