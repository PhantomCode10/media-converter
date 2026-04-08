/**
 * File Manager
 * Handles the downloads directory, file registration, lookup, and TTL-based cleanup.
 * Uses JSON sidecar files on disk for persistence across serverless invocations.
 * This works on Vercel where /tmp is writable and containers may be reused.
 */
const path = require('path');
const fsp = require('fs').promises;
const logger = require('./logger');

// On Vercel/serverless the project root is read-only; fall back to /tmp
const DEFAULT_DOWNLOADS_DIR =
  process.platform === 'win32' ? './downloads' : '/tmp/downloads';
const DOWNLOADS_DIR = path.resolve(process.env.DOWNLOADS_DIR || DEFAULT_DOWNLOADS_DIR);
const FILE_TTL_MS =
  parseInt(process.env.FILE_TTL_MINUTES || '60', 10) * 60 * 1000;

/** Returns the resolved downloads directory path */
function getDownloadsDir() {
  return DOWNLOADS_DIR;
}

/** Create downloads directory on startup */
async function initDownloadsDir() {
  await fsp.mkdir(DOWNLOADS_DIR, { recursive: true });
  logger.info('Downloads directory ready: %s', DOWNLOADS_DIR);
}

/**
 * Register a freshly created file by writing a JSON sidecar.
 * Persists across serverless container reuse via the /tmp filesystem.
 */
async function registerFile(fileId, filePath, filename) {
  const expiresAt = Date.now() + FILE_TTL_MS;
  const meta = { filePath, filename, expiresAt };
  const metaPath = path.join(DOWNLOADS_DIR, `${fileId}.json`);
  await fsp.writeFile(metaPath, JSON.stringify(meta), 'utf8');
}

/**
 * Look up a file by ID via its JSON sidecar. Returns null if not found or expired.
 */
async function getFilePath(fileId) {
  const metaPath = path.join(DOWNLOADS_DIR, `${fileId}.json`);
  let meta;
  try {
    const raw = await fsp.readFile(metaPath, 'utf8');
    meta = JSON.parse(raw);
  } catch {
    return null; // sidecar missing — file not registered or already deleted
  }
  if (Date.now() > meta.expiresAt) {
    await deleteFile(fileId);
    return null;
  }
  return meta;
}

/**
 * Delete a single file and its JSON sidecar
 */
async function deleteFile(fileId) {
  const metaPath = path.join(DOWNLOADS_DIR, `${fileId}.json`);
  let filePath;
  try {
    const raw = await fsp.readFile(metaPath, 'utf8');
    filePath = JSON.parse(raw).filePath;
  } catch {
    return; // nothing to delete
  }
  await Promise.all([
    fsp.unlink(metaPath).catch(() => {}),
    filePath ? fsp.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') logger.warn('Failed to delete %s: %s', filePath, err.message);
    }) : Promise.resolve(),
  ]);
  logger.debug('Deleted file and sidecar for: %s', fileId);
}

/**
 * Called by the cron job — removes all expired sidecar entries
 */
async function cleanupExpiredFiles() {
  let entries;
  try {
    entries = await fsp.readdir(DOWNLOADS_DIR);
  } catch {
    return; // directory may not exist yet
  }
  const now = Date.now();
  const expired = [];
  for (const name of entries) {
    if (!name.endsWith('.json')) continue;
    try {
      const raw = await fsp.readFile(path.join(DOWNLOADS_DIR, name), 'utf8');
      const meta = JSON.parse(raw);
      if (now > meta.expiresAt) expired.push(name.replace('.json', ''));
    } catch {
      // corrupt sidecar — skip
    }
  }
  if (expired.length) logger.info('Cleaning up %d expired file(s)', expired.length);
  await Promise.all(expired.map(deleteFile));
}

module.exports = {
  getDownloadsDir,
  initDownloadsDir,
  registerFile,
  getFilePath,
  cleanupExpiredFiles,
  DOWNLOADS_DIR, // exported for static-serve config in index.js
};

