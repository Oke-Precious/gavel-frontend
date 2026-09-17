import React from 'react';
import './Badge.css';

/** Compact text label for roles and account states. */
export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}
