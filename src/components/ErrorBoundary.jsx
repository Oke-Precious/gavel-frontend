import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary - class component that catches render errors.
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
 * @prop {React.ReactNode} [fallback] - custom fallback (optional)
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
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary__card">
            <div className="error-boundary__icon">
              <AlertTriangle size={40} strokeWidth={1.5} />
            </div>
            <h1 className="error-boundary__heading">Something went wrong</h1>
            <p className="error-boundary__body">
              We've run into an unexpected problem. This has been logged and
              the team has been notified. Please try reloading the page.
            </p>
            <div className="error-boundary__actions">
              <button
                className="error-boundary__reload"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} strokeWidth={2} />
                Reload page
              </button>
              <button
                className="error-boundary__retry"
                onClick={this.handleReset}
              >
                Try without reloading
              </button>
            </div>
            {/* Dev-only: show message, never in prod user-facing UI */}
            {import.meta.env.DEV && (
              <details className="error-boundary__details" open>
                <summary>Developer info</summary>
                <pre>{this.state.errorMessage}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
