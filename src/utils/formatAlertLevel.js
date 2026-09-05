/**
 * Alert level classification for GAVEL.
 *
 * Thresholds (days in custody):
 *   0  – 27   → Compliant
 *   28 – 89   → Warning
 *   90 – 179  → Severe Warning
 *   180+      → Critical
 *
 * NOTE: These thresholds match the spec. The 28-day figure is Nigeria's
 * constitutional remand limit (ACJA s.293). Every case beyond it is a
 * rights violation, not just a metric.
 */

/** @typedef {'compliant'|'warning'|'severe'|'critical'} AlertLevel */

/**
 * @type {Array<{level: AlertLevel, label: string, cssVar: string, minDays: number}>}
 * Ordered from most urgent to least so Array.find() returns the correct match.
 */
const THRESHOLDS = [
  {
    level: 'critical',
    label: 'Critical',
    cssVar: 'var(--color-critical)',
    bgVar: 'var(--color-critical-bg)',
    minDays: 180,
  },
  {
    level: 'severe',
    label: 'Severe Warning',
    cssVar: 'var(--color-severe)',
    bgVar: 'var(--color-severe-bg)',
    minDays: 90,
  },
  {
    level: 'warning',
    label: 'Warning',
    cssVar: 'var(--color-warning)',
    bgVar: 'var(--color-warning-bg)',
    minDays: 28,
  },
  {
    level: 'compliant',
    label: 'Compliant',
    cssVar: 'var(--color-compliant)',
    bgVar: 'var(--color-compliant-bg)',
    minDays: 0,
  },
];

/**
 * Derive the alert level object from a number of days in custody.
 * @param {number} days
 * @returns {{ level: AlertLevel, label: string, cssVar: string, bgVar: string, minDays: number }}
 */
export function getAlertLevel(days) {
  const n = typeof days === 'number' ? days : 0;
  return THRESHOLDS.find((t) => n >= t.minDays) ?? THRESHOLDS[THRESHOLDS.length - 1];
}

/**
 * Map a status string from the backend to an alert level.
 * Useful when the API returns a `status` field (Active / Stalled / Closed)
 * rather than raw detention days.
 * @param {string} status
 * @returns {AlertLevel}
 */
export function statusToAlertLevel(status) {
  switch (status?.toLowerCase()) {
    case 'stalled':  return 'warning';
    case 'closed':   return 'compliant';
    case 'active':   return 'compliant';
    default:         return 'compliant';
  }
}

/**
 * Return the CSS class name suffix for a given alert level.
 * Matches the BEM modifier used in StatusPill and RemandClock.
 * @param {AlertLevel} level
 * @returns {string}
 */
export function alertLevelClass(level) {
  return level ?? 'compliant';
}

export { THRESHOLDS };
