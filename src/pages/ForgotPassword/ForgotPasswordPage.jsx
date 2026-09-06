import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.warning('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      // Wire to real backend endpoint: POST /auth/forgot-password
      await authApi.forgotPassword(cleanEmail);
      setIsSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again or contact support.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="container forgot-container">
        <Card className="forgot-card" padding="lg">
          {/* Logo Header */}
          <div className="forgot-card__header">
            <Link to="/" className="forgot-card__logo-link">
              <img
                src="/gavel%20blue%20logo.png"
                alt="GAVEL Logo"
                className="forgot-card__logo-img"
              />
            </Link>
          </div>

          {isSuccess ? (
            /* ── Success State ── */
            <div className="forgot-card__success">
              <CheckCircle
                size={56}
                className="forgot-card__success-icon"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h1 className="forgot-card__title">Check Your Email</h1>
              <p className="forgot-card__instruction">
                We've sent a reset link to <strong>{email}</strong>. Check your inbox and follow the link to set a new password.
              </p>
              <Link to="/login" className="forgot-card__back-link">
                <ArrowLeft size={15} />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <h1 className="forgot-card__title">Reset Your Password</h1>
              <p className="forgot-card__instruction">
                Enter the email linked to your account and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="forgot-card__form" noValidate>
                <div className="forgot-card__field">
                  <label htmlFor="forgot-email" className="forgot-card__label">
                    Email
                  </label>
                  <div className="forgot-card__input-wrapper">
                    <Mail size={18} className="forgot-card__input-icon" aria-hidden="true" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="forgot-card__input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={!email.trim()}
                  className="forgot-card__submit-btn"
                >
                  Send Reset Link
                </Button>
              </form>

              <Link to="/login" className="forgot-card__back-link">
                <ArrowLeft size={15} />
                <span>Back to Login</span>
              </Link>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="forgot-page__footer">
          <Link to="/privacy" className="forgot-page__footer-link">Privacy Policy</Link>
          <span className="forgot-page__footer-dot">·</span>
          <Link to="/terms" className="forgot-page__footer-link">Terms of Use</Link>
        </div>
      </div>
    </div>
  );
}

