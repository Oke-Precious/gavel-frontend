import React from 'react';
import { FileSearch, Inbox, AlertCircle } from 'lucide-react';
import Button from './Button.jsx';
import './EmptyState.css';

/**
 * EmptyState — shown when there's no content to display.
 *
 * @param {'search'|'inbox'|'error'} icon
 * @param {string} message    — primary message (short)
 * @param {string} [subtext]  — secondary explanation
 * @param {string} [actionLabel] — CTA button label
 * @param {Function} [onAction]  — CTA button handler
 * @param {'sm'|'md'|'lg'} size
 */

const ICONS = {
  search: FileSearch,
  inbox:  Inbox,
  error:  AlertCircle,
};

export default function EmptyState({
  icon = 'inbox',
  message = 'Nothing here yet.',
  subtext,
  actionLabel,
  onAction,
  size = 'md',
}) {
  const Icon = ICONS[icon] ?? Inbox;
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 44;

  return (
    <div className={`empty-state empty-state--${size}`} role="status">
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={iconSize} strokeWidth={1.25} />
      </div>
      <p className="empty-state__message">{message}</p>
      {subtext && <p className="empty-state__subtext">{subtext}</p>}
      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="empty-state__action"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
