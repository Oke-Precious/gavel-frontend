import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmail } from '../../utils/validators.js';
import './OtpVerificationPage.css';

const CODE_LENGTH = 6;

export default function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRefs = useRef([]);

  const email = useMemo(
    () => (searchParams.get('email') || '').trim(),
    [searchParams],
  );

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const updateDigit = (index, value) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);

    if (nextValue && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH);

    if (!pastedCode) return;

    const nextDigits = Array(CODE_LENGTH).fill('');
    pastedCode.split('').forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    focusInput(Math.min(pastedCode.length, CODE_LENGTH) - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isComplete) {
      toast.warning('Enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      await Promise.reject(
        new Error('OTP verification endpoint is not documented in API_DOCUMENTATION.md yet.'),
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      toast.warning('Open this page with an email query so GAVEL knows where to resend the code.');
      return;
    }

    setIsResending(true);

    try {
      // Existing real backend endpoint: POST /auth/resend-verification
      await authApi.resendVerification(email);
      toast.success('Verification message resent. Please check your inbox.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'We could not resend the verification message. Please try again later.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="otp-page">
      <div className="otp-page__inner">
        <Link to="/" className="otp-page__logo-link">
          <img
            src="/gavel%20blue%20logo.png"
            alt="GAVEL Logo"
            className="otp-page__logo"
          />
        </Link>

        <Card padding="lg" className="otp-card">
          <div className="otp-card__icon-wrap" aria-hidden="true">
            <ShieldCheck size={42} className="otp-card__icon" />
          </div>

          <h3 className="otp-card__title">Enter Verification Code</h3>
          <p className="otp-card__text">
            Enter the 6-digit code sent to your email to continue securely.
          </p>

          <form onSubmit={handleSubmit} className="otp-card__form" noValidate>
            <div className="otp-card__code-group" role="group" aria-label="6-digit verification code">
              {digits.map((digit, index) => (
                <input
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="otp-card__digit"
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  aria-label={`Verification code digit ${index + 1}`}
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isVerifying}
              disabled={!isComplete}
              className="otp-card__button"
            >
              Verify Code
            </Button>
          </form>

          <button
            type="button"
            className="otp-card__resend"
            onClick={handleResendCode}
            disabled={isResending}
          >
            <Mail size={15} aria-hidden="true" />
            <span>{isResending ? 'Resending...' : 'Resend Code'}</span>
          </button>

          <button
            type="button"
            className="otp-card__back"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to Sign In</span>
          </button>
        </Card>

        <div className="otp-page__footer">
          <Link to="/privacy" className="otp-page__footer-link">Privacy Policy</Link>
          <span className="otp-page__footer-dot">·</span>
          <Link to="/terms" className="otp-page__footer-link">Terms of Use</Link>
        </div>
      </div>
    </main>
  );
}
