import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../services/api.js';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../../utils/validators.js';
import '../Login/LoginPage.css';
import './RegisterPage.css';

const ACCOUNT_TYPES = {
  lawyer: {
    label: 'Volunteer Lawyer',
    badge: 'Volunteer Lawyer Access',
    title: 'Represent Cases. Protect Dignity.',
    description:
      'Create a volunteer lawyer account to find unrepresented pro-bono cases and help reduce prolonged awaiting-trial detention.',
    extraField: 'barNumber',
    extraLabel: 'Bar Credential Number',
    extraPlaceholder: 'SCN-123456',
    extraRequiredMessage: 'Bar Credential Number is required for volunteer lawyers.',
  },
  judge: {
    label: 'Legal Aid Officer',
    badge: 'Legal Aid Access',
    title: 'Track Cases. Protect Rights.',
    description:
      'Create a legal aid officer account to monitor assigned cases, review detention timelines, and follow status changes.',
    extraField: 'phoneNumber',
    extraLabel: 'Work Phone Number',
    extraPlaceholder: '08012345678',
    extraRequiredMessage: 'Work Phone Number is required for legal aid officers.',
  },
  clerk: {
    label: 'Records Officer',
    badge: 'Records Officer Access',
    title: 'Maintain Records. Reduce Delay.',
    description:
      'Create a records officer account to support case filing, status updates, and auditable case information.',
    extraField: 'phoneNumber',
    extraLabel: 'Work Phone Number',
    extraPlaceholder: '08012345678',
    extraRequiredMessage: 'Work Phone Number is required for records officers.',
  },
};

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ') || firstName;

  return { firstName, lastName };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState('lawyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedAccount = useMemo(() => ACCOUNT_TYPES[role], [role]);
  const needsBarNumber = selectedAccount.extraField === 'barNumber';
  const needsPhoneNumber = selectedAccount.extraField === 'phoneNumber';
  const extraValue = needsBarNumber ? barNumber : phoneNumber;

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setBarNumber('');
    setPhoneNumber('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanBarNumber = barNumber.trim();
    const cleanPhoneNumber = phoneNumber.trim();

    const nameError = validateRequired(cleanFullName, 'Full Name');
    const emailError = validateEmail(cleanEmail);
    const passwordError = validatePassword(password);
    const extraError = validateRequired(
      needsBarNumber ? cleanBarNumber : cleanPhoneNumber,
      selectedAccount.extraLabel
    );
    const phoneError = needsPhoneNumber ? validatePhone(cleanPhoneNumber) : null;

    if (nameError || emailError || passwordError || extraError || phoneError) {
      toast.warning(nameError || emailError || passwordError || extraError || phoneError);
      return;
    }

    const { firstName, lastName } = splitFullName(cleanFullName);
    const payload = {
      firstName,
      lastName,
      email: cleanEmail,
      password,
      role,
      ...(needsBarNumber ? { barNumber: cleanBarNumber } : {}),
      ...(needsPhoneNumber ? { phoneNumber: cleanPhoneNumber } : {}),
    };

    setIsLoading(true);
    try {
      // Wire to real backend endpoint: POST /auth/register
      await authApi.register(payload);

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
              <span>{selectedAccount.badge}</span>
            </div>

            <h1 className="login-showcase__title">{selectedAccount.title}</h1>

            <p className="login-showcase__subtitle">
              {selectedAccount.description}
            </p>
          </div>

          <div className="login-showcase__stat-card">
            <div className="login-showcase__stat-header">
              <span className="login-showcase__live-dot" />
              <span className="login-showcase__live-text">Role-Based Access</span>
            </div>
            <div className="login-showcase__stat-value">{selectedAccount.label}</div>
            <p className="login-showcase__stat-desc">
              Your selected account type controls the dashboard tools you can use after signing in.
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
                Choose the account type that matches your role in the justice workflow.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form-card__form" noValidate>
              <div className="login-form-card__field">
                <label htmlFor="register-role" className="login-form-card__label">
                  Account Type
                </label>
                <div className="login-form-card__input-wrapper">
                  <Users size={18} className="login-form-card__input-icon" aria-hidden="true" />
                  <select
                    id="register-role"
                    className="login-form-card__input register-card__select"
                    value={role}
                    onChange={handleRoleChange}
                    disabled={isLoading}
                    required
                  >
                    {Object.entries(ACCOUNT_TYPES).map(([value, account]) => (
                      <option key={value} value={value}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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

              {needsBarNumber && (
                <div className="login-form-card__field">
                  <label htmlFor="register-bar-number" className="login-form-card__label">
                    {selectedAccount.extraLabel}
                  </label>
                  <div className="login-form-card__input-wrapper">
                    <Briefcase size={18} className="login-form-card__input-icon" aria-hidden="true" />
                    <input
                      id="register-bar-number"
                      type="text"
                      className="login-form-card__input"
                      placeholder={selectedAccount.extraPlaceholder}
                      value={barNumber}
                      onChange={(event) => setBarNumber(event.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
              )}

              {needsPhoneNumber && (
                <div className="login-form-card__field">
                  <label htmlFor="register-phone-number" className="login-form-card__label">
                    {selectedAccount.extraLabel}
                  </label>
                  <div className="login-form-card__input-wrapper">
                    <Phone size={18} className="login-form-card__input-icon" aria-hidden="true" />
                    <input
                      id="register-phone-number"
                      type="tel"
                      className="login-form-card__input"
                      placeholder={selectedAccount.extraPlaceholder}
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      disabled={isLoading}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!fullName.trim() || !email.trim() || !password || !extraValue.trim()}
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
