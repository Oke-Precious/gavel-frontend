import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * ToastContext — global toast notification queue.
 *
 * Usage in any component:
 *   const toast = useToast();
 *   toast.success('Case updated successfully.');
 *   toast.error('Something went wrong. Please try again.');
 */

const ToastContext = createContext(null);

let toastIdCounter = 0;
const DEFAULT_DURATION = 4500; // ms

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, message, duration = DEFAULT_DURATION) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => add('success', message, duration),
    error:   (message, duration) => add('error',   message, duration),
    warning: (message, duration) => add('warning', message, duration),
    info:    (message, duration) => add('info',    message, duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * @returns {{ toasts: Array, toast: { success, error, warning, info }, dismiss: (id: number) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export default ToastContext;
