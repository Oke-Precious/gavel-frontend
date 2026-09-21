import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmail } from '../../utils/validators.js';
import './VerifyEmailPage.css';

export default function VerifyEmailPage() {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const email = useMemo(
    () => (searchParams.get('email') || '').trim(),
    [searchParams],
  );
  const token = useMemo(
    () => routeToken || searchParams.get('token') || '',
    [routeToken, searchParams],
  );

  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function verifyEmailToken() {
      setStatus('loading');

      try {
        // Real backend endpoint: GET /auth/verify-email/:token
        await authApi.verifyEmail(token);

        if (!isMounted) return;
        setStatus('verified');
        toast.success('Email verified successfully. You can now sign in.');
      } catch (error) {
        if (!isMounted) return;

        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'Verification link is invalid, expired, or the network request failed.',
        );
        toast.error(
          error.response?.data?.message ||
            'Verification link is invalid, expired, or the network request failed.',
        );
      }
    }

    verifyEmailToken();

    return () => {
      isMounted = false;
    };
  }, [token, toast]);

  const handleResendVerification = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      toast.warning('Open this page with your email address, or request a new verification email from sign in.');
      return;
    }

    setIsResending(true);

    try {
      // Real backend endpoint: POST /auth/resend-verification
      await authApi.resendVerification(email);
      toast.success('Verification link sent. Please check your inbox.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'We could not resend the verification email. Please try again later.',
      );
    } finally {
      setIsResending(false);
    }
  };

  const isLoading = status === 'loading';
  const isVerified = status === 'verified';
  const isError = status === 'error';

  return (
    <main className="verify-email-page">
      <div className="verify-email-page__inner">
        <Link to="/" className="verify-email-page__logo-link">
          <img
            src="/gavel%20blue%20logo.png"
            alt="GAVEL Logo"
            className="verify-email-page__logo"
          />
        </Link>

        <Card padding="lg" className="verify-email-card">
          <div
            className={[
              'verify-email-card__icon-wrap',
              isError ? 'verify-email-card__icon-wrap--warning' : '',
            ].filter(Boolean).join(' ')}
            aria-hidden="true"
          >
            {isLoading ? (
              <RefreshCw size={44} className="verify-email-card__icon verify-email-card__icon--loading" />
            ) : isError ? (
              <AlertTriangle size={44} className="verify-email-card__icon verify-email-card__icon--warning" />
            ) : isVerified ? (
              <CheckCircle size={44} className="verify-email-card__icon" />
            ) : (
              <Mail size={44} className="verify-email-card__icon" />
            )}
          </div>

          <h3 className="verify-email-card__title">
            {isVerified ? 'Email Verified' : isError ? 'Verification Link Problem' : 'Verify Your Email'}
          </h3>

          <p className="verify-email-card__text">
            {isLoading && 'We are confirming your verification link.'}
            {isVerified && 'Your email has been verified. You can now sign in to your GAVEL account.'}
            {isError && message}
            {!isLoading && !isVerified && !isError && 'Check your inbox for a verification link.'}
          </p>

          <div className="verify-email-card__actions">
            {isVerified ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                iconRight={ArrowRight}
                className="verify-email-card__button"
              >
                Continue to Sign In
              </Button>
            ) : isError ? (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="verify-email-card__button"
                >
                  Back to Sign In
                </Button>
                {email && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    loading={isResending}
                    onClick={handleResendVerification}
                    className="verify-email-card__button"
                  >
                    Resend Verification Email
                  </Button>
                )}
              </>
            ) : (
              <>
                {email && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    loading={isResending}
                    onClick={handleResendVerification}
                    className="verify-email-card__button"
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="verify-email-card__button"
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </div>
        </Card>

        <div className="verify-email-page__footer">
          <Link to="/privacy" className="verify-email-page__footer-link">Privacy Policy</Link>
          <span className="verify-email-page__footer-dot">·</span>
          <Link to="/terms" className="verify-email-page__footer-link">Terms of Use</Link>
        </div>
      </div>
    </main>
  );
}
