import React from 'react';
import './Card.css';

/**
 * Card — surface container with elevation and optional hover lift.
 *
 * @param {'sm'|'md'|'lg'} padding
 * @param {boolean} hoverable — adds lift effect on hover
 * @param {boolean} interactive — adds cursor:pointer
 * @param {string} className
 */
export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  interactive = false,
  className = '',
  ...rest
}) {
  return (
    <div
      className={[
        'card',
        `card--pad-${padding}`,
        hoverable ? 'card--hoverable' : '',
        interactive ? 'card--interactive' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
