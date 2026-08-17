/**
 * Sanitizes a URL to prevent XSS via javascript:, data:, vbscript:, etc.
 * Only allows http:, https:, and mailto: protocols.
 * @param {string} url - The URL to sanitize.
 * @returns {string} The sanitized URL, or '' if unsafe.
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
    if (parsed.protocol === 'mailto:') {
      return url;
    }
    return ''; // Block javascript:, data:, vbscript:, etc.
  } catch {
    return ''; // Invalid URL
  }
}
