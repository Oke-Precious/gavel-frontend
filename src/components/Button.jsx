import React from 'react';
import './Button.css';

/**
 * Button — primary UI action component.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading — shows spinner, disables interaction
 * @param {boolean} disabled
 * @param {string}  iconLeft  — Lucide icon component
 * @param {string}  iconRight — Lucide icon component
 * @param {'button'|'submit'|'reset'} type
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft: IconLeft = null,
  iconRight: IconRight = null,
  type = 'button',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true" />
      )}
      {!loading && IconLeft && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          <IconLeft size={size === 'sm' ? 14 : 16} strokeWidth={2} />
        </span>
      )}
      <span className="btn__label">{children}</span>
      {!loading && IconRight && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2} />
        </span>
      )}
    </button>
  );
}
