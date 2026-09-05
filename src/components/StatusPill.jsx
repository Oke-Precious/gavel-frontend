import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  XCircle,
} from 'lucide-react';
import './StatusPill.css';

/**
 * StatusPill — alert level badge.
 * Always shows icon + label — never color alone (accessibility requirement).
 *
 * @param {'compliant'|'warning'|'severe'|'critical'} level
 * @param {string} [label] — override the default label
 * @param {'sm'|'md'} size
 */
const CONFIG = {
  compliant: {
    label: 'Compliant',
    Icon: CheckCircle,
  },
  warning: {
    label: 'Warning',
    Icon: AlertTriangle,
  },
  severe: {
    label: 'Severe Warning',
    Icon: AlertOctagon,
  },
  critical: {
    label: 'Critical',
    Icon: XCircle,
  },
};

export default function StatusPill({ level = 'compliant', label, size = 'md' }) {
  const config = CONFIG[level] ?? CONFIG.compliant;
  const { Icon } = config;
  const displayLabel = label ?? config.label;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`status-pill status-pill--${level} status-pill--${size}`}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      <Icon
        size={iconSize}
        strokeWidth={2}
        aria-hidden="true"
        className="status-pill__icon"
      />
      <span className="status-pill__label">{displayLabel}</span>
    </span>
  );
}
