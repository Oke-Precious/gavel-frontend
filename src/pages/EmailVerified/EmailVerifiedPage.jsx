import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import './EmailVerifiedPage.css';

export default function EmailVerifiedPage() {
  const navigate = useNavigate();

  return (
    <main className="email-verified-page">
      <div className="email-verified-page__halo" aria-hidden="true" />

      <div className="email-verified-page__inner">
        <Link to="/" className="email-verified-page__logo-link">
          <img
            src="/gavel%20blue%20logo.png"
            alt="GAVEL Logo"
            className="email-verified-page__logo"
          />
        </Link>

        <Card padding="lg" className="email-verified-card">
          <div className="email-verified-card__icon-wrap" aria-hidden="true">
            <span className="email-verified-card__pulse" />
            <CheckCircle size={46} className="email-verified-card__icon" />
          </div>

          <div className="email-verified-card__badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Email Verified</span>
          </div>

          <h1>Your Email Is Verified</h1>
          <p>
            Your GAVEL account is now confirmed. You can sign in and continue to
            your role-based dashboard.
          </p>

          <div className="email-verified-card__steps" aria-label="Verification complete">
            <span className="email-verified-card__step is-complete">Account created</span>
            <span className="email-verified-card__step is-complete">Email confirmed</span>
            <span className="email-verified-card__step">Sign in</span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => navigate('/login')}
            iconRight={ArrowRight}
            className="email-verified-card__button"
          >
            Continue to Sign In
          </Button>
        </Card>

        <p className="email-verified-page__note">
          <Sparkles size={15} aria-hidden="true" />
          <span>Thanks for helping make justice tracking more transparent and dignified.</span>
        </p>
      </div>
    </main>
  );
}
