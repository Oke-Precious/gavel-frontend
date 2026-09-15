import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { authApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.warning('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Your password has been reset successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset link is invalid or has expired.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="container reset-container">
        <Card className="reset-card" padding="lg">
          <div className="reset-card__header">
            <Link to="/">
              <img
                src="/gavel%20blue%20logo.png"
                alt="GAVEL Logo"
                className="reset-card__logo-img"
              />
            </Link>
          </div>

          {isSuccess ? (
            <div className="reset-card__success">
              <CheckCircle size={56} className="reset-card__success-icon" />
              <h1 className="reset-card__title">Password Reset Complete</h1>
              <p className="reset-card__instruction">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Go to Sign In
              </Button>
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
                    <Lock size={18} className="reset-card__input-icon" />
                    <input
                      id="new-password"
                      type="password"
                      className="reset-card__input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="reset-card__field">
                  <label htmlFor="confirm-password" className="reset-card__label">
                    Confirm New Password
                  </label>
                  <div className="reset-card__input-wrapper">
                    <Lock size={18} className="reset-card__input-icon" />
                    <input
                      id="confirm-password"
                      type="password"
                      className="reset-card__input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={!password || !confirmPassword}
                  className="reset-card__submit-btn"
                >
                  Reset Password
                </Button>
              </form>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login" className="reset-card__back-link">
                  <ArrowLeft size={15} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
