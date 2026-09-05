import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — class component that catches render errors.
 *
 * Wraps the whole app (in App.jsx). Shows a calm fallback UI
 * rather than a blank white screen. Never exposes a stack trace
 * to the user in production.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * @prop {React.ReactNode} children
 * @prop {React.ReactNode} [fallback] — custom fallback (optional)
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, info) {
    // Log to console in development; in production this would send to Sentry/etc
    console.error('[GAVEL ErrorBoundary]', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={styles.wrapper} role="alert" aria-live="assertive">
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <AlertTriangle size={40} strokeWidth={1.5} style={{ color: '#F59E0B' }} />
            </div>
            <h1 style={styles.heading}>Something went wrong</h1>
            <p style={styles.body}>
              We've run into an unexpected problem. This has been logged and
              the team has been notified. Please try reloading the page.
            </p>
            <div style={styles.actions}>
              <button
                style={styles.primaryBtn}
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} strokeWidth={2} style={{ marginRight: 8 }} />
                Reload page
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={this.handleReset}
              >
                Try without reloading
              </button>
            </div>
            {/* Dev-only: show message, never in prod user-facing UI */}
            {import.meta.env.DEV && (
              <details style={styles.details}>
                <summary style={styles.summary}>Developer info</summary>
                <pre style={styles.pre}>{this.state.errorMessage}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* Inline styles here intentionally: the CSS system may itself be broken
   if we've hit an error boundary, so we must not depend on a stylesheet. */
const styles = {
  wrapper: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: '3rem 2.5rem',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
    border: '1px solid #E2E8F0',
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '0.75rem',
  },
  body: {
    fontSize: '0.9375rem',
    color: '#64748B',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    padding: '0.625rem 1.5rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    minWidth: 180,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748B',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
  details: {
    marginTop: '2rem',
    textAlign: 'left',
  },
  summary: {
    fontSize: '0.8125rem',
    color: '#94A3B8',
    cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  pre: {
    fontSize: '0.75rem',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: '0.75rem',
    borderRadius: 6,
    overflowX: 'auto',
    fontFamily: 'monospace',
    lineHeight: 1.5,
  },
};
