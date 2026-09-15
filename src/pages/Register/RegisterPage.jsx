import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  Phone,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Activity,
  ChevronDown,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import './RegisterPage.css';

const ROLES = [
  { value: 'lawyer', label: 'Volunteer Lawyer (Pro-Bono Advocate)' },
  { value: 'judge', label: 'Legal Aid Officer' },
  { value: 'clerk', label: 'Records Officer' },
  { value: 'public', label: 'Public Observer' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('lawyer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [barNumber, setBarNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Backend Registration
      await authApi.register({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
        role,
        phoneNumber: phoneNumber.trim() || undefined,
        barNumber: role === 'lawyer' ? barNumber.trim() : undefined,
      });

      toast.success('Account created successfully! Logging you in...');

      // 2. Perform silent login with newly registered credentials
      try {
        await login(cleanEmail, password);
        navigate('/cases');
      } catch {
        navigate('/login');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please check your details and try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-split-page">
      {/* LEFT SIDE: Visual Showcase Panel */}
      <div className="register-showcase">
        <div className="register-showcase__content">
          <Link to="/">
            <img
              src="/gavel%20white%20logo.png"
              alt="GAVEL Logo"
              className="register-showcase__logo-img"
            />
          </Link>

          <div className="register-showcase__hero">
            <div className="register-showcase__badge">
              <ShieldCheck size={16} />
              <span>Join the Network</span>
            </div>

            <h1 className="register-showcase__title">
              Empowering Transparency. <br />
              Accelerating Justice.
            </h1>

            <p className="register-showcase__subtitle">
              Join thousands of legal practitioners, legal aid officers, and observers tracking pre-trial cases to protect fundamental human rights.
            </p>

            <div className="register-showcase__features">
              <div className="register-showcase__feature-item">
                <CheckCircle size={18} className="register-showcase__feature-icon" />
                <span>Auditable stage tracking for awaiting-trial detainees</span>
              </div>
              <div className="register-showcase__feature-item">
                <CheckCircle size={18} className="register-showcase__feature-icon" />
                <span>Pro-bono representation matching hub for lawyers</span>
              </div>
              <div className="register-showcase__feature-item">
                <CheckCircle size={18} className="register-showcase__feature-icon" />
                <span>ACJA 2015 statutory limit compliance monitoring</span>
              </div>
            </div>
          </div>

          <div className="register-showcase__footer">
            <Activity size={16} />
            <span>Secure, encrypted judicial record network</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="register-form-panel">
        <div className="register-form-panel__inner">
          <div className="register-form-panel__mobile-header">
            <Link to="/">
              <img
                src="/gavel%20blue%20logo.png"
                alt="GAVEL Logo"
                className="register-form-panel__mobile-logo"
              />
            </Link>
          </div>

          <Card className="register-card" padding="lg">
            <div className="register-card__header">
              <h2 className="register-card__title">Create an Account</h2>
              <p className="register-card__subtitle">
                Select your role and enter your details to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-card__form" noValidate>
              {/* Name Row */}
              <div className="register-card__row">
                <div className="register-card__field">
                  <label htmlFor="reg-first-name" className="register-card__label">
                    First Name *
                  </label>
                  <div className="register-card__input-wrapper">
                    <User size={18} className="register-card__input-icon" />
                    <input
                      id="reg-first-name"
                      type="text"
                      className="register-card__input"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="register-card__field">
                  <label htmlFor="reg-last-name" className="register-card__label">
                    Last Name *
                  </label>
                  <div className="register-card__input-wrapper">
                    <User size={18} className="register-card__input-icon" />
                    <input
                      id="reg-last-name"
                      type="text"
                      className="register-card__input"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="register-card__field">
                <label htmlFor="reg-email" className="register-card__label">
                  Email Address *
                </label>
                <div className="register-card__input-wrapper">
                  <Mail size={18} className="register-card__input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="register-card__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="register-card__field">
                <label htmlFor="reg-role" className="register-card__label">
                  Primary Role *
                </label>
                <div className="register-card__input-wrapper">
                  <Briefcase size={18} className="register-card__input-icon" />
                  <select
                    id="reg-role"
                    className="register-card__select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="register-card__select-chevron" />
                </div>
              </div>

              {/* Conditional Bar Number for Lawyers */}
              {role === 'lawyer' && (
                <div className="register-card__field">
                  <label htmlFor="reg-bar-number" className="register-card__label">
                    NBA Bar Enrollment Number
                  </label>
                  <div className="register-card__input-wrapper">
                    <Briefcase size={18} className="register-card__input-icon" />
                    <input
                      id="reg-bar-number"
                      type="text"
                      className="register-card__input"
                      placeholder="e.g. SCN-123456"
                      value={barNumber}
                      onChange={(e) => setBarNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="register-card__field">
                <label htmlFor="reg-phone" className="register-card__label">
                  Phone Number
                </label>
                <div className="register-card__input-wrapper">
                  <Phone size={18} className="register-card__input-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    className="register-card__input"
                    placeholder="+234 800 000 0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="register-card__field">
                <label htmlFor="reg-password" className="register-card__label">
                  Password * (min. 6 characters)
                </label>
                <div className="register-card__input-wrapper">
                  <Lock size={18} className="register-card__input-icon" />
                  <input
                    id="reg-password"
                    type="password"
                    className="register-card__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                iconRight={ArrowRight}
                className="register-card__submit-btn"
              >
                Create Account
              </Button>
            </form>

            <div className="register-card__footer-note">
              Already have an account?{' '}
              <Link to="/login" className="register-card__login-link">
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
