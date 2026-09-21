import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validatePassword, validatePasswordConfirm } from '../../utils/validators.js';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = useMemo(
    () => routeToken || searchParams.get('token') || '',
    [routeToken, searchParams],
  );
  const hasToken = Boolean(token);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasToken) {
      toast.error('Password reset link is missing. Please request a new reset link.');
      return;
    }

    const passwordError = validatePassword(password);
    const confirmError = validatePasswordConfirm(password, confirmPassword);

    if (passwordError || confirmError) {
      toast.warning(passwordError || confirmError);
      return;
    }

    setIsLoading(true);

    try {
      // Real backend endpoint: POST /auth/reset-password/:token
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password reset successfully. You can now sign in.');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Password reset link is invalid, expired, or the network request failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="container reset-container">
        <Card className="reset-card" padding="lg">
          <div className="reset-card__header">
            <Link to="/" className="reset-card__logo-link">
              <img
                src="/gavel%20blue%20logo.png"
                alt="GAVEL Logo"
                className="reset-card__logo-img"
              />
            </Link>
          </div>

          {isSuccess ? (
            <div className="reset-card__success">
              <CheckCircle
                size={56}
                className="reset-card__success-icon"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h1 className="reset-card__title">Password Reset Complete</h1>
              <p className="reset-card__instruction">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                Go to Sign In
              </Button>
            </div>
          ) : !hasToken ? (
            <div className="reset-card__success" role="alert">
              <AlertTriangle
                size={56}
                className="reset-card__warning-icon"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h1 className="reset-card__title">Reset Link Needed</h1>
              <p className="reset-card__instruction">
                This page needs the secure token from your email. Please request a new reset link and open it from your inbox.
              </p>
              <Link to="/forgot-password" className="reset-card__back-link">
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="reset-card__title">Set New Password</h1>
              <p className="reset-card__instruction">
                Please enter a new password for your GAVEL account.
              </p>

              <form onSubmit={handleSubmit} className="reset-card__form" noValidate>
                <div className="reset-card__field">
                  <label htmlFor="new-password" className="reset-card__label">
                    New Password
                  </label>
                  <div className="reset-card__input-wrapper">
                    <Lock size={18} className="reset-card__input-icon" aria-hidden="true" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="reset-card__input reset-card__input--password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-describedby="reset-password-help"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="reset-card__password-toggle"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p id="reset-password-help" className="reset-card__help-text">
                    Use at least 8 characters with uppercase, lowercase, a number, and a symbol.
                  </p>
                </div>

                <div className="reset-card__field">
                  <label htmlFor="confirm-password" className="reset-card__label">
                    Confirm Password
                  </label>
                  <div className="reset-card__input-wrapper">
                    <Lock size={18} className="reset-card__input-icon" aria-hidden="true" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="reset-card__input reset-card__input--password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="reset-card__password-toggle"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      disabled={isLoading}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={!password || !confirmPassword}
                  className="reset-card__submit-btn"
                >
                  Reset Password
                </Button>
              </form>

              <Link to="/login" className="reset-card__back-link">
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Back to Login</span>
              </Link>
            </>
          )}
        </Card>

        <div className="reset-page__footer">
          <Link to="/privacy" className="reset-page__footer-link">Privacy Policy</Link>
          <span className="reset-page__footer-dot">·</span>
          <Link to="/terms" className="reset-page__footer-link">Terms of Use</Link>
        </div>
      </div>
    </div>
  );
}
