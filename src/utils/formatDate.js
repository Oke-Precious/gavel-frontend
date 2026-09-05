/**
 * Date & time formatting utilities for GAVEL.
 * All functions are pure — no side effects, no imports.
 */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format an ISO date string to a readable date.
 * @param {string|Date} iso
 * @returns {string} e.g. "12 Aug 2025"
 */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format an ISO date string to date + time.
 * @param {string|Date} iso
 * @returns {string} e.g. "12 Aug 2025, 14:35"
 */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(iso)}, ${time}`;
}

/**
 * Return a human-readable relative time string.
 * @param {string|Date} iso
 * @returns {string} e.g. "3 days ago", "just now"
 */
export function formatRelative(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';

  const diffMs = Date.now() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return formatDate(iso);
}

/**
 * Calculate the number of whole days between a start date and today.
 * Used for "days in custody" calculations.
 * @param {string|Date} startDate — arrest/detention date
 * @returns {number} integer days (0 if invalid or in the future)
 */
export function daysInCustody(startDate) {
  if (!startDate) return 0;
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Format a number of days as a display string.
 * @param {number} days
 * @returns {string} e.g. "28 days", "1 day"
 */
export function formatDays(days) {
  if (typeof days !== 'number' || isNaN(days)) return '— days';
  return `${days} day${days !== 1 ? 's' : ''}`;
}
