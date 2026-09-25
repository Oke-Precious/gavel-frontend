import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, RefreshCw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { notificationsApi } from '../../services/api.js';
import { daysInCustody } from '../../utils/formatDate.js';
import './NotificationsCenterPage.css';

const SAMPLE_NOTIFICATIONS = [
  {
    id: 'sample-90-days',
    caseId: null,
    message: 'Case LA-2026-0483 just crossed 90 days',
    timeLabel: '2 hours ago',
    unread: true,
  },
  {
    id: 'sample-document',
    caseId: null,
    message: 'New document uploaded to KN-2025-1187',
    timeLabel: 'Yesterday',
    unread: false,
  },
];

function getErrorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response?.data?.message ?? 'Unable to load notifications.';
}

function getCaseHash(caseRecord) {
  return caseRecord.hashId ?? caseRecord.caseHashId ?? caseRecord.caseNumber ?? 'this case';
}

function getTimestamp(caseRecord) {
  return caseRecord.updatedAt ?? caseRecord.statusUpdatedAt ?? caseRecord.createdAt ?? caseRecord.filingDate;
}

function relativeTime(value) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function normalizeNotifications(cases) {
  return cases.slice(0, 12).map((caseRecord, index) => {
    const custodyDays = caseRecord.detentionDate ? daysInCustody(caseRecord.detentionDate) : null;
    const caseHash = getCaseHash(caseRecord);
    const crossed90Days = custodyDays != null && custodyDays >= 90;
    const stalled = String(caseRecord.status ?? '').toLowerCase().includes('stall');

    return {
      id: caseRecord._id ?? `${caseHash}-${index}`,
      caseId: caseRecord._id,
      message: crossed90Days
        ? `Case ${caseHash} just crossed 90 days`
        : stalled
          ? `Case ${caseHash} needs stall review`
          : `Case ${caseHash} has a recent case update`,
      timeLabel: relativeTime(getTimestamp(caseRecord)),
      unread: index < 3 || crossed90Days || stalled,
    };
  });
}

export default function NotificationsCenterPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await notificationsApi.list({ limit: 20 });
      const normalized = normalizeNotifications(data.cases ?? []);
      setNotifications(normalized.length ? normalized : SAMPLE_NOTIFICATIONS);
    } catch (requestError) {
      setNotifications([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadNotifications, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  return (
    <div className="notifications-center-page">
      <div className="notifications-center-page__shell">
        <button type="button" className="notifications-center-page__back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </button>

        <div className="notifications-center-page__header">
          <div>
            <p className="notifications-center-page__eyebrow">Operational alerts</p>
            <h1>Notifications Center</h1>
            <p>Case movement, custody thresholds, and document activity for assigned work.</p>
          </div>
          <Button type="button" variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadNotifications} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card padding="lg" className="notifications-center-page__summary" role="status" aria-live="polite">
          <Bell size={20} aria-hidden="true" />
          <span>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</span>
        </Card>

        {loading && (
          <Card padding="lg">
            <div className="notifications-center-page__list">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="notifications-center-page__item">
                  <Skeleton variant="text" width="75%" />
                  <Skeleton variant="text" width="120px" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {!loading && error && (
          <Card padding="xl">
            <EmptyState
              icon="alert"
              message="Unable to Load Notifications"
              subtext={error}
              actionLabel="Try Again"
              onAction={loadNotifications}
            />
          </Card>
        )}

        {!loading && !error && (
          <Card padding="lg">
            <ul className="notifications-center-page__list" aria-label="Notifications">
              {notifications.map((notification) => (
                <li key={notification.id} className={`notifications-center-page__item${notification.unread ? ' notifications-center-page__item--unread' : ''}`}>
                  <span className="notifications-center-page__dot" aria-hidden="true" />
                  <button
                    type="button"
                    className="notifications-center-page__content"
                    onClick={() => notification.caseId && navigate(`/cases/${notification.caseId}`)}
                    disabled={!notification.caseId}
                  >
                    <span>{notification.message}</span>
                    <time>{notification.timeLabel}</time>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
