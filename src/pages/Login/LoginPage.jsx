import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmail } from '../../utils/validators.js';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    const emailError = validateEmail(cleanEmail);
    if (emailError || !password) {
      toast.warning(emailError || 'Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      // Wire to real backend endpoint: POST /auth/login via AuthContext
      const signedInUser = await login(cleanEmail, password);
      toast.success('Signed in successfully.');
      navigate(signedInUser?.role === 'lawyer' ? '/pro-bono' : '/dashboard');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Invalid email or password. Please check your credentials and try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* ============================================================ */}
      {/* LEFT SIDE: Visual Showcase Panel (Desktop 1025px+ only)       */}
      {/* ============================================================ */}
      <div className="login-showcase">
        <div className="login-showcase__content">
          {/* White Logo on Desktop Left Side */}
          <Link to="/" className="login-showcase__logo-link">
            <img
              src="/gavel%20white%20logo.png"
              alt="GAVEL Logo"
              className="login-showcase__logo-img"
            />
          </Link>

          <div className="login-showcase__hero">
            <div className="login-showcase__badge">
              <ShieldCheck size={16} />
              <span>2015 ACJA Compliant</span>
            </div>

            <h1 className="login-showcase__title">
              Tracking Justice. <br />
              Protecting Rights.
            </h1>

            <p className="login-showcase__subtitle">
              Access your role-based dashboard to track cases, update records,
              review delays, or claim eligible pro-bono matters with privacy and dignity.
            </p>
          </div>

          {/* Floating Metric Showcase Card */}
          <div className="login-showcase__stat-card">
            <div className="login-showcase__stat-header">
              <span className="login-showcase__live-dot" />
              <span className="login-showcase__live-text">National Backlog Monitor</span>
            </div>
            <div className="login-showcase__stat-value">51,955+</div>
            <p className="login-showcase__stat-desc">
              people reported to be awaiting trial in Nigeria's custodial centres.
            </p>
          </div>

          <div className="login-showcase__footer">
            <Activity size={16} />
            <span>Auditable legal case tracking</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: Sign In Form Panel                               */}
      {/* ============================================================ */}
      <div className="login-form-panel">
        <div className="login-form-panel__inner">
          {/* Blue Logo for Mobile & Tablet view (<1024px) */}
          <div className="login-form-panel__mobile-header">
            <Link to="/" className="login-form-panel__logo-link">
              <img
                src="/gavel%20blue%20logo.png"
                alt="GAVEL Logo"
                className="login-form-panel__mobile-logo"
              />
            </Link>
          </div>

          <Card className="login-form-card" padding="lg">
            <div className="login-form-card__header">
              <h2 className="login-form-card__title">Sign In</h2>
              <p className="login-form-card__subtitle">
                Welcome back. Enter your credentials to access your portal.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form-card__form" noValidate>
              {/* Email Field */}
              <div className="login-form-card__field">
                <label htmlFor="login-email" className="login-form-card__label">
                  Email
                </label>
                <div className="login-form-card__input-wrapper">
                  <Mail size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    className="login-form-card__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="login-form-card__field">
                <div className="login-form-card__label-row">
                  <label htmlFor="login-password" className="login-form-card__label">
                    Password
                  </label>
                  <Link to="/forgot-password" className="login-form-card__forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="login-form-card__input-wrapper">
                  <Lock size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-form-card__input login-form-card__input--password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-form-card__password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!email.trim() || !password}
                iconRight={ArrowRight}
                className="login-form-card__submit-btn"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="login-form-card__divider">
              <span className="login-form-card__divider-text">NEW VOLUNTEER LAWYER?</span>
            </div>

            {/* Create Account Link / Button */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
              className="login-form-card__create-btn"
            >
              Create Volunteer Account
            </Button>
          </Card>

          {/* Footer Links */}
          <div className="login-form-panel__footer">
            <Link to="/privacy" className="login-form-panel__footer-link">
              Privacy Policy
            </Link>
            <span className="login-form-panel__footer-dot">•</span>
            <Link to="/terms" className="login-form-panel__footer-link">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
