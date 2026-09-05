import React, { useEffect, useRef } from 'react';
import { getAlertLevel } from '../utils/formatAlertLevel.js';
import { formatDays } from '../utils/formatDate.js';
import './RemandClock.css';

/**
 * RemandClock — circular SVG progress ring showing days in custody
 * against the 28-day legal remand limit.
 *
 * @param {number} days        — days in custody (integer)
 * @param {number} [limit=28] — legal limit (default: 28 days)
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} animated  — animate the arc on mount (default true)
 */

const SIZES = {
  sm: { radius: 36, stroke: 5,  fontSize: 18, labelSize: 9  },
  md: { radius: 52, stroke: 7,  fontSize: 24, labelSize: 10 },
  lg: { radius: 72, stroke: 9,  fontSize: 32, labelSize: 12 },
};

export default function RemandClock({
  days = 0,
  limit = 28,
  size = 'md',
  animated = true,
}) {
  const circleRef = useRef(null);
  const { radius, stroke, fontSize, labelSize } = SIZES[size] ?? SIZES.md;

  const alertLevel = getAlertLevel(days);

  // Calculate progress (capped at 100%)
  const progress = Math.min(days / limit, 1);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const svgSize = (radius + stroke) * 2;
  const center = radius + stroke;

  // Color based on alert level
  const COLOR_MAP = {
    compliant: 'var(--color-compliant)',
    warning:   'var(--color-warning)',
    severe:    'var(--color-severe)',
    critical:  'var(--color-critical)',
  };
  const color = COLOR_MAP[alertLevel.level] ?? COLOR_MAP.compliant;

  // Animate the stroke on mount
  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const el = circleRef.current;
    el.style.strokeDashoffset = circumference;
    // Trigger layout then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1s ease-out';
        el.style.strokeDashoffset = dashOffset;
      });
    });
  }, [animated, circumference, dashOffset]);

  const label = days >= limit ? `${days} days` : `${days} / ${limit}d`;

  return (
    <div
      className={`remand-clock remand-clock--${size} remand-clock--${alertLevel.level}`}
      role="img"
      aria-label={`${days} days in custody. Status: ${alertLevel.label}. Legal limit: ${limit} days.`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: animated ? undefined : 'none' }}
        />
        {/* Center label */}
        <text
          x={center}
          y={center - labelSize * 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill={color}
        >
          {days}
        </text>
        <text
          x={center}
          y={center + fontSize * 0.65}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelSize}
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          fill="var(--color-text-muted)"
          letterSpacing="0.04em"
        >
          DAYS
        </text>
      </svg>

      {/* Status label below the clock */}
      <div className="remand-clock__status">
        <span
          className={`remand-clock__badge remand-clock__badge--${alertLevel.level}`}
        >
          {alertLevel.label}
        </span>
        <span className="remand-clock__limit-label">
          Limit: {limit} days
        </span>
      </div>
    </div>
  );
}
