import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import './Toast.css';

/**
 * ToastContainer — renders all active toasts from ToastContext.
 * Mount this once at the app root.
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body,
  );
}

/**
 * Individual toast item.
 */
function ToastItem({ toast, onDismiss }) {
  const barRef = useRef(null);

  const ICONS = {
    success: CheckCircle,
    error:   XCircle,
    warning: AlertTriangle,
    info:    Info,
  };

  const Icon = ICONS[toast.type] ?? Info;

  // Animate the countdown bar
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.transitionDuration = `${toast.duration}ms`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'scaleX(0)';
      });
    });
  }, [toast.duration]);

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Icon
        size={18}
        strokeWidth={2}
        className="toast__icon"
        aria-hidden="true"
      />
      <span className="toast__message">{toast.message}</span>
      <button
        className="toast__dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={2} />
      </button>
      {/* Countdown progress bar */}
      <div className="toast__bar" ref={barRef} aria-hidden="true" />
    </div>
  );
}

export default ToastContainer;
