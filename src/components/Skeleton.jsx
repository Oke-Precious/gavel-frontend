import React from 'react';
import './Skeleton.css';

/**
 * Skeleton — shimmer loading placeholder.
 *
 * @param {'text'|'card'|'avatar'|'table-row'|'circle'} variant
 * @param {string|number} width   — CSS width value (default '100%')
 * @param {string|number} height  — CSS height value
 * @param {number} [lines]        — for 'text' variant: number of lines
 * @param {boolean} [rounded]     — use full border-radius (for pill shapes)
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  rounded = false,
  className = '',
}) {
  const style = {
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  if (variant === 'text') {
    return (
      <div className={`skeleton-text-group ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton skeleton--text${rounded ? ' skeleton--rounded' : ''}`}
            style={{
              ...style,
              // Last line is shorter for a natural paragraph look
              width: lines > 1 && i === lines - 1 ? '65%' : (style.width ?? '100%'),
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`skeleton skeleton--card ${className}`} style={style} aria-hidden="true" />
    );
  }

  if (variant === 'avatar' || variant === 'circle') {
    return (
      <div className={`skeleton skeleton--circle ${className}`} style={style} aria-hidden="true" />
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`skeleton-table-row ${className}`} aria-hidden="true">
        <div className="skeleton skeleton--text" style={{ width: '15%' }} />
        <div className="skeleton skeleton--text" style={{ width: '30%' }} />
        <div className="skeleton skeleton--text" style={{ width: '20%' }} />
        <div className="skeleton skeleton--text" style={{ width: '15%' }} />
        <div className="skeleton skeleton--pill" style={{ width: '80px' }} />
      </div>
    );
  }

  // Generic fallback
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
