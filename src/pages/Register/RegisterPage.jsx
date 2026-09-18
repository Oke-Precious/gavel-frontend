import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Briefcase, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../services/api.js';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators.js';
import '../Login/LoginPage.css';

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ') || firstName;

  return { firstName, lastName };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanBarNumber = barNumber.trim();

    const nameError = validateRequired(cleanFullName, 'Full Name');
    const emailError = validateEmail(cleanEmail);
    const passwordError = validatePassword(password);
    const barNumberError = validateRequired(cleanBarNumber, 'Bar Credential Number');

    if (nameError || emailError || passwordError || barNumberError) {
      toast.warning(nameError || emailError || passwordError || barNumberError);
      return;
    }

    const { firstName, lastName } = splitFullName(cleanFullName);

    setIsLoading(true);
    try {
      // Wire to real backend endpoint: POST /auth/register
      await authApi.register({
        firstName,
        lastName,
        email: cleanEmail,
        password,
        role: 'lawyer',
        barNumber: cleanBarNumber,
      });

      toast.success('Account created. Check your email to verify your account, then sign in.');
      navigate('/login');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please check your details and try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      <div className="login-showcase">
        <div className="login-showcase__content">
          <Link to="/" className="login-showcase__logo-link">
            <img
              src="/gavel%20white%20logo.png"
              alt="GAVEL Logo"
              className="login-showcase__logo-img"
            />
          </Link>

          <div className="login-showcase__hero">
            <div className="login-showcase__badge">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Volunteer Lawyer Access</span>
            </div>

            <h1 className="login-showcase__title">
              Represent Cases. <br />
              Protect Dignity.
            </h1>

            <p className="login-showcase__subtitle">
              Create a volunteer lawyer account to find eligible pro-bono cases
              while keeping public case information privacy-conscious and role-based.
            </p>
          </div>

          <div className="login-showcase__stat-card">
            <div className="login-showcase__stat-header">
              <span className="login-showcase__live-dot" />
              <span className="login-showcase__live-text">Public Signup</span>
            </div>
            <div className="login-showcase__stat-value">Volunteer lawyers only</div>
            <p className="login-showcase__stat-desc">
              Legal Aid Officer, Records Officer, and Admin accounts are created by Admin Invite.
            </p>
          </div>

          <div className="login-showcase__footer">
            <Activity size={16} aria-hidden="true" />
            <span>Privacy-first access to role-appropriate case workflows</span>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-panel__inner">
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
              <h2 className="login-form-card__title">Create Account</h2>
              <p className="login-form-card__subtitle">
                Register as a volunteer lawyer to access pro-bono case matching.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-card__form" noValidate>
              <div className="login-form-card__field">
                <label htmlFor="register-full-name" className="login-form-card__label">
                  Full Name
                </label>
                <div className="login-form-card__input-wrapper">
                  <User size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="register-full-name"
                    type="text"
                    className="login-form-card__input"
                    placeholder="Amaka Eze"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="login-form-card__field">
                <label htmlFor="register-email" className="login-form-card__label">
                  Email
                </label>
                <div className="login-form-card__input-wrapper">
                  <Mail size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="register-email"
                    type="email"
                    className="login-form-card__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-form-card__field">
                <label htmlFor="register-password" className="login-form-card__label">
                  Password
                </label>
                <div className="login-form-card__input-wrapper">
                  <Lock size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-form-card__input login-form-card__input--password"
                    placeholder="Password123!"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
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

              <div className="login-form-card__field">
                <label htmlFor="register-bar-number" className="login-form-card__label">
                  Bar Credential Number
                </label>
                <div className="login-form-card__input-wrapper">
                  <Briefcase size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <input
                    id="register-bar-number"
                    type="text"
                    className="login-form-card__input"
                    placeholder="SCN-123456"
                    value={barNumber}
                    onChange={(event) => setBarNumber(event.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!fullName.trim() || !email.trim() || !password || !barNumber.trim()}
                iconRight={ArrowRight}
                className="login-form-card__submit-btn"
              >
                Create Account
              </Button>
            </form>

            <div className="login-form-card__divider">
              <span className="login-form-card__divider-text">ALREADY REGISTERED?</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="login-form-card__create-btn"
            >
              Sign In
            </Button>
          </Card>

          <div className="login-form-panel__footer">
            <Link to="/privacy" className="login-form-panel__footer-link">
              Privacy Policy
            </Link>
            <span className="login-form-panel__footer-dot">&middot;</span>
            <Link to="/terms" className="login-form-panel__footer-link">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
