/**
 * URL validators for YouTube and Instagram links
 */

const YOUTUBE_PATTERNS = [
  // Standard watch URL
  /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  // Short URL
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  // Shorts
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  // Embed
  /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  // Music
  /^https?:\/\/music\.youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
];

const INSTAGRAM_PATTERNS = [
  // Posts
  /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
  // Reels
  /^https?:\/\/(www\.)?instagram\.com\/reels?\/[A-Za-z0-9_-]+/,
  // TV
  /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/,
  // User videos (share)
  /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/p\/[A-Za-z0-9_-]+/,
];

function validateYoutubeUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) {
    return { valid: false, message: 'Invalid URL' };
  }
  const trimmed = url.trim();
  const matched = YOUTUBE_PATTERNS.some((re) => re.test(trimmed));
  if (!matched) {
    return { valid: false, message: 'Please provide a valid YouTube video URL.' };
  }
  return { valid: true };
}

function validateInstagramUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) {
    return { valid: false, message: 'Invalid URL' };
  }
  const trimmed = url.trim();
  const matched = INSTAGRAM_PATTERNS.some((re) => re.test(trimmed));
  if (!matched) {
    return {
      valid: false,
      message: 'Please provide a valid Instagram post, reel, or video URL.',
    };
  }
  return { valid: true };
}

module.exports = { validateYoutubeUrl, validateInstagramUrl };
