import React, { useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { contactApi } from '../../services/api.js';
import '../SuperAdmin/SuperAdminPage.css';

const CONTACT_STATUSES = ['new', 'in_review', 'resolved', 'closed'];
const CONTACT_CATEGORIES = [
  'general_question',
  'report_issue',
  'privacy_concern',
  'case_information_concern',
  'volunteer_legal_aid',
];

function labelFromToken(value) {
  return String(value ?? 'not_provided').replace(/_/g, ' ');
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function getErrorMessage(error, fallback) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response.data?.message ?? fallback;
}

function normalizeMessage(message) {
  return {
    ...message,
    _id: message?._id ?? message?.id ?? message?.messageId,
    name: message?.name || 'Not provided',
    email: message?.email || '-',
    category: message?.category || 'general_question',
    message: message?.message || '-',
    status: message?.status || 'new',
    adminNotes: message?.adminNotes || '',
    assignedTo: message?.resolvedBy?.firstName
      ? `${message.resolvedBy.firstName} ${message.resolvedBy.lastName ?? ''}`.trim()
      : message?.assignedResolutionAdministrator ?? message?.resolvedBy?.email ?? '-',
  };
}

function badgeTone(status) {
  if (status === 'resolved' || status === 'closed') return 'compliant';
  if (status === 'in_review') return 'warning';
  return 'neutral';
}

export default function ContactMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const data = await contactApi.listMessages({
        page,
        limit: 20,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      });
      const nextMessages = (data?.messages ?? []).map(normalizeMessage);
      const pagination = data?.pagination ?? {};
      setMessages(nextMessages);
      setPages(Math.max(1, Number(pagination.pages ?? 1)));
      setTotal(Number(pagination.total ?? nextMessages.length));
      setDrafts(Object.fromEntries(nextMessages.map((message) => [
        message._id,
        { status: message.status, adminNotes: message.adminNotes },
      ])));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load contact messages.'));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, statusFilter]);

  useEffect(() => {
    // The state updates inside loadMessages occur after the API request settles.
    // oxlint-disable-next-line react/set-state-in-effect
    loadMessages();
  }, [loadMessages]);

  function refreshMessages() {
    setError('');
    setLoading(true);
    loadMessages();
  }

  function updateDraft(id, field, value) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));
  }

  async function saveMessage(message) {
    const draft = drafts[message._id] ?? {
      status: message.status,
      adminNotes: message.adminNotes,
    };
    setUpdatingId(message._id);
    try {
      await contactApi.updateStatus(message._id, {
        status: draft.status,
        adminNotes: draft.adminNotes.trim(),
      });
      toast.success('Contact message updated successfully.');
      await loadMessages();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to update this contact message.'));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="super-admin-page">
      <div className="super-admin-container">
        <header className="super-admin__header">
          <div>
            <p className="super-admin__eyebrow">Public accountability</p>
            <h1 className="super-admin__title">Contact / Report Inbox</h1>
            <p className="super-admin__subtitle">
              Review and resolve questions, reports, and privacy concerns submitted through the public contact form.
            </p>
          </div>
          <Mail size={28} aria-hidden="true" />
        </header>

        <section className="super-admin__section" aria-labelledby="contact-messages-heading">
          <div className="super-admin__section-heading">
            <div>
              <h2 id="contact-messages-heading">Messages</h2>
              <p className="super-admin__muted">{total.toLocaleString()} message{total === 1 ? '' : 's'} found.</p>
            </div>
          </div>

          <Card padding="md">
            <div className="super-admin__filters" role="search" aria-label="Filter contact messages">
              <label>
                <span>Status</span>
                <select value={statusFilter} onChange={(event) => { setError(''); setLoading(true); setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="">All statuses</option>
                  {CONTACT_STATUSES.map((status) => <option key={status} value={status}>{labelFromToken(status)}</option>)}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select value={categoryFilter} onChange={(event) => { setError(''); setLoading(true); setCategoryFilter(event.target.value); setPage(1); }}>
                  <option value="">All categories</option>
                  {CONTACT_CATEGORIES.map((category) => <option key={category} value={category}>{labelFromToken(category)}</option>)}
                </select>
              </label>
              <Button variant="ghost" size="sm" iconLeft={RefreshCw} onClick={refreshMessages} disabled={loading}>
                Refresh
              </Button>
            </div>

            {error ? (
              <div className="super-admin__inline-error" role="alert">
                <span>{error}</span>
                <Button variant="secondary" size="sm" onClick={refreshMessages}>Try again</Button>
              </div>
            ) : (
              <div className="super-admin__contact-list" aria-busy={loading} aria-live="polite">
                {loading ? (
                  <Skeleton variant="card" height={160} />
                ) : messages.length === 0 ? (
                  <p className="super-admin__muted">No contact messages match these filters.</p>
                ) : messages.map((message) => {
                  const draft = drafts[message._id] ?? { status: message.status, adminNotes: message.adminNotes };
                  return (
                    <article className="super-admin__contact-item" key={message._id}>
                      <div className="super-admin__contact-main">
                        <div className="super-admin__contact-meta">
                          <strong>{message.name}</strong>
                          <a href={`mailto:${message.email}`}>{message.email}</a>
                          <Badge tone={badgeTone(message.status)}>{labelFromToken(message.status)}</Badge>
                        </div>
                        <p className="super-admin__contact-category">{labelFromToken(message.category)}</p>
                        <p className="super-admin__contact-message">{message.message}</p>
                        <p className="super-admin__muted">
                          Received {formatDateTime(message.createdAt)} - Assigned: {message.assignedTo}
                        </p>
                      </div>
                      <div className="super-admin__contact-actions">
                        <label htmlFor={`status-${message._id}`}>
                          <span>Status</span>
                          <select
                            id={`status-${message._id}`}
                            value={draft.status}
                            onChange={(event) => updateDraft(message._id, 'status', event.target.value)}
                            disabled={updatingId === message._id}
                          >
                            {CONTACT_STATUSES.map((status) => <option key={status} value={status}>{labelFromToken(status)}</option>)}
                          </select>
                        </label>
                        <label htmlFor={`notes-${message._id}`}>
                          <span>Admin notes</span>
                          <textarea
                            id={`notes-${message._id}`}
                            rows={2}
                            value={draft.adminNotes}
                            onChange={(event) => updateDraft(message._id, 'adminNotes', event.target.value)}
                            placeholder="Optional note"
                            disabled={updatingId === message._id}
                          />
                        </label>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => saveMessage(message)}
                          loading={updatingId === message._id}
                          disabled={Boolean(updatingId) && updatingId !== message._id}
                        >
                          Save update
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!loading && !error && total > 0 && (
              <div className="super-admin__pagination-line">
                <span>{total.toLocaleString()} message{total === 1 ? '' : 's'}</span>
                <div>
                  <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => { setError(''); setLoading(true); setPage((current) => current - 1); }}>Previous</Button>
                  <span>Page {page} of {pages}</span>
                  <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => { setError(''); setLoading(true); setPage((current) => current + 1); }}>Next</Button>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
