import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, RefreshCw, Save } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { profileApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ProfileSettingsPage.css';

const DARK_MODE_KEY = 'gavel:dark-mode';
const LARGER_TEXT_KEY = 'gavel:larger-text';

function getErrorMessage(error, fallback) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response?.data?.message ?? fallback;
}

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function joinFullName(user) {
  return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
}

function readStoredBoolean(key) {
  return window.localStorage.getItem(key) === 'true';
}

export default function ProfileSettingsPage() {
  const { user, roleLabel, fetchMe } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(user);
  const [fullName, setFullName] = useState(joinFullName(user));
  const [email, setEmail] = useState(user?.email ?? '');
  const [darkMode, setDarkMode] = useState(() => readStoredBoolean(DARK_MODE_KEY));
  const [largerText, setLargerText] = useState(() => readStoredBoolean(LARGER_TEXT_KEY));
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');

  const canSave = useMemo(() => {
    const nextName = fullName.trim();
    return Boolean(profile?._id && nextName && nextName !== joinFullName(profile));
  }, [fullName, profile]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await profileApi.me();
      const nextUser = data?.user ?? data;
      setProfile(nextUser);
      setFullName(joinFullName(nextUser));
      setEmail(nextUser?.email ?? '');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load your profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadProfile, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadProfile]);

  useEffect(() => {
    window.localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    document.documentElement.classList.toggle('gavel-dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem(LARGER_TEXT_KEY, String(largerText));
    document.documentElement.classList.toggle('gavel-larger-text', largerText);
  }, [largerText]);

  const handleSave = async (event) => {
    event.preventDefault();

    const { firstName, lastName } = splitFullName(fullName);
    if (!firstName || !lastName) {
      toast.warning('Please enter your full name with first and last name.');
      return;
    }

    setSaving(true);

    try {
      await profileApi.updateProfile(profile._id, { firstName, lastName });
      await fetchMe();
      await loadProfile();
      toast.success('Profile settings updated successfully.');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.warning('Your email address is required before a reset link can be sent.');
      return;
    }

    setPasswordLoading(true);

    try {
      await profileApi.requestPasswordReset(email);
      toast.success('Password reset link sent. Please check your email.');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to send password reset link.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-settings-page">
        <div className="profile-settings-page__shell">
          <Skeleton variant="text" width="260px" height={36} />
          <Card padding="lg">
            <Skeleton variant="card" height={300} />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-settings-page">
        <div className="profile-settings-page__shell profile-settings-page__shell--narrow">
          <Card padding="xl">
            <EmptyState
              icon="alert"
              message="Unable to Load Settings"
              subtext={error}
              actionLabel="Try Again"
              onAction={loadProfile}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings-page">
      <div className="profile-settings-page__shell profile-settings-page__shell--narrow">
        <div className="profile-settings-page__header">
          <div>
            <p className="profile-settings-page__eyebrow">Account access</p>
            <h1>Profile / Settings</h1>
            <p>Keep your account details accurate and adjust accessibility preferences for dashboard work.</p>
          </div>
        </div>

        <Card padding="lg">
          <form className="profile-settings-page__form" onSubmit={handleSave} noValidate>
            <div className="profile-settings-page__identity">
              <div className="profile-settings-page__avatar" aria-hidden="true">
                {(profile?.firstName?.[0] ?? '?')}{(profile?.lastName?.[0] ?? '')}
              </div>
              <div>
                <h2>{joinFullName(profile) || 'GAVEL user'}</h2>
                <p>{roleLabel ?? profile?.role ?? 'Account user'}</p>
              </div>
            </div>

            <div className="profile-settings-page__field">
              <label htmlFor="profile-full-name">Full Name</label>
              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={saving}
                autoComplete="name"
                required
              />
            </div>

            <div className="profile-settings-page__field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                autoComplete="email"
              />
              <p>Email changes are handled by an administrator to protect account integrity.</p>
            </div>

            <div className="profile-settings-page__password-row">
              <div>
                <label>Change Password</label>
                <p>Send a secure password reset link to your email address.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                iconLeft={KeyRound}
                loading={passwordLoading}
                onClick={handlePasswordReset}
              >
                Send Reset Link
              </Button>
            </div>

            <div className="profile-settings-page__toggles" aria-label="Display preferences">
              <ToggleSwitch
                id="profile-dark-mode"
                label="Dark Mode"
                checked={darkMode}
                onChange={setDarkMode}
              />
              <ToggleSwitch
                id="profile-larger-text"
                label="Larger Text"
                checked={largerText}
                onChange={setLargerText}
              />
            </div>

            <div className="profile-settings-page__actions">
              <Button type="button" variant="ghost" size="md" iconLeft={RefreshCw} onClick={loadProfile} disabled={saving}>
                Refresh
              </Button>
              <Button type="submit" variant="primary" size="md" iconLeft={Save} loading={saving} disabled={!canSave}>
                Save Settings
              </Button>
            </div>
          </form>
        </Card>

        <Link className="profile-settings-page__return-link" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function ToggleSwitch({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="profile-settings-page__toggle">
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="profile-settings-page__switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
