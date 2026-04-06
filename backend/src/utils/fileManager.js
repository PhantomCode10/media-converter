/**
 * File Manager
 * Handles the downloads directory, file registration, lookup, and TTL-based cleanup.
 * Uses an in-memory registry (Map) keyed by UUID.  For multi-process deployments
 * replace the Map with a Redis store.
 */
const path = require('path');
const fsp = require('fs').promises;
const logger = require('./logger');

const DOWNLOADS_DIR = path.resolve(process.env.DOWNLOADS_DIR || './downloads');
const FILE_TTL_MS =
  parseInt(process.env.FILE_TTL_MINUTES || '60', 10) * 60 * 1000;

/** In-memory file registry: fileId → { filePath, filename, expiresAt } */
const registry = new Map();

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
 * Register a freshly created file for TTL tracking
 * @param {string} fileId - UUID
 * @param {string} filePath - Absolute path on disk
 * @param {string} filename - Human-friendly download name
 */
async function registerFile(fileId, filePath, filename) {
  const expiresAt = Date.now() + FILE_TTL_MS;
  registry.set(fileId, { filePath, filename, expiresAt });
}

/**
 * Look up a file by ID, returns null if not registered or expired
 */
async function getFilePath(fileId) {
  const entry = registry.get(fileId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    // Expired — delete immediately
    await deleteFile(fileId);
    return null;
  }
  return entry;
}

/**
 * Delete a single file and remove from registry
 */
async function deleteFile(fileId) {
  const entry = registry.get(fileId);
  if (!entry) return;
  registry.delete(fileId);
  try {
    await fsp.unlink(entry.filePath);
    logger.debug('Deleted expired file: %s', entry.filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.warn('Failed to delete %s: %s', entry.filePath, err.message);
    }
  }
}

/**
 * Called by the cron job — removes all expired entries
 */
async function cleanupExpiredFiles() {
  const now = Date.now();
  const expired = [];
  for (const [id, entry] of registry.entries()) {
    if (now > entry.expiresAt) expired.push(id);
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
