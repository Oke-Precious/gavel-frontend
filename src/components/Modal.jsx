import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal — accessible dialog component.
 *
 * Features:
 * - Renders via React portal to document.body
 * - Traps focus within the modal while open
 * - Closes on Escape key
 * - Closes on backdrop click (if closeOnBackdrop is true)
 * - Restores focus to the trigger element on close
 * - scale-fade-in animation on open
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {string} title
 * @param {React.ReactNode} children
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} closeOnBackdrop
 * @param {boolean} showCloseButton
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  // Capture the trigger element before open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Trap focus, handle Escape
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const el = dialogRef.current;

    // Focus the first focusable element
    const FOCUSABLE = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusables = Array.from(el.querySelectorAll(FOCUSABLE));
    if (focusables.length) focusables[0].focus();

    function trapFocus(e) {
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        onClose?.();
      }
    }

    el.addEventListener('keydown', trapFocus);

    // Prevent body scroll while modal open
    document.body.style.overflow = 'hidden';

    return () => {
      el.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = '';

      // Restore focus to trigger
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={closeOnBackdrop ? onClose : undefined}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`modal modal--${size}`}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        aria-hidden="false"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && (
              <h2 id="modal-title" className="modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
