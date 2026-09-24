import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './UpdateCaseStatusPage.css';

const STAGES = [
  'Arrest',
  'Charge & Remand',
  'DPP Advice / Adjournment',
  'Trial or Discharge',
];

const STALL_REASONS = [
  'Awaiting DPP Advice',
  'File in Transit',
  'Court Adjournment',
  'Missing Counsel',
  'Other',
];

function getErrorMessage(error, fallback) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response?.data?.message ?? fallback;
}

function normalizeStage(stage) {
  const value = String(stage ?? '').toLowerCase();
  if (value.includes('trial') || value.includes('discharge')) return 'Trial or Discharge';
  if (value.includes('dpp') || value.includes('adjourn')) return 'DPP Advice / Adjournment';
  if (value.includes('charge') || value.includes('remand')) return 'Charge & Remand';
  return 'Arrest';
}

export default function UpdateCaseStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseRecord, setCaseRecord] = useState(null);
  const [newStage, setNewStage] = useState(STAGES[0]);
  const [stallReason, setStallReason] = useState(STALL_REASONS[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const backToCase = useCallback(() => {
    navigate(`/cases/${id}`);
  }, [id, navigate]);

  const loadCase = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await casesApi.getById(id);
      setCaseRecord(data);
      setNewStage(normalizeStage(data?.stage ?? data?.status));
      setStallReason(STALL_REASONS[0]);
      setNote('');
    } catch (requestError) {
      setCaseRecord(null);
      setError(getErrorMessage(requestError, 'Unable to load this case for status update.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadCase, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadCase]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newStage || !stallReason || !note.trim()) {
      toast.warning('New Stage, Stall Reason, and Note are required.');
      return;
    }

    setSaving(true);

    try {
      await casesApi.updateStatus(id, {
        stage: newStage,
        stallReason,
        comments: note.trim(),
      });
      toast.success('Case status updated successfully.');
      navigate(`/cases/${id}`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to save this status update.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="case-operation-page">
        <div className="case-operation-page__shell">
          <Skeleton variant="text" width="220px" height={32} />
          <Card padding="lg">
            <Skeleton variant="card" height={220} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !caseRecord) {
    return (
      <div className="case-operation-page">
        <div className="case-operation-page__shell case-operation-page__shell--narrow">
          <Card padding="xl">
            <EmptyState
              icon="alert"
              message="Unable to Load Case"
              subtext={error || 'This case could not be loaded.'}
              actionLabel="Try Again"
              onAction={loadCase}
            />
            <div className="case-operation-page__error-actions">
              <Button type="button" variant="ghost" size="md" iconLeft={ArrowLeft} onClick={() => navigate('/cases')}>
                Back to Cases
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="case-operation-page">
      <div className="case-operation-page__shell case-operation-page__shell--narrow">
        <button type="button" className="case-operation-page__back" onClick={backToCase} disabled={saving}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Case</span>
        </button>

        <Card padding="lg" className="case-operation-page__context-card">
          <p className="case-operation-page__eyebrow">Case status update</p>
          <h1>{caseRecord.hashId ?? caseRecord.caseNumber ?? 'Case record'}</h1>
          <p>Record the latest lifecycle movement with a reason and audit note.</p>
        </Card>
      </div>

      <Modal
        isOpen
        onClose={backToCase}
        title="Update Case Status"
        size="md"
        closeOnBackdrop={!saving}
        showCloseButton={!saving}
      >
        <form onSubmit={handleSubmit} className="case-operation-form" noValidate>
          <div className="case-operation-field">
            <label htmlFor="case-new-stage">New Stage</label>
            <select
              id="case-new-stage"
              value={newStage}
              onChange={(event) => setNewStage(event.target.value)}
              disabled={saving}
              required
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="case-operation-field">
            <label htmlFor="case-stall-reason">Stall Reason</label>
            <select
              id="case-stall-reason"
              value={stallReason}
              onChange={(event) => setStallReason(event.target.value)}
              disabled={saving}
              required
            >
              {STALL_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="case-operation-field">
            <label htmlFor="case-status-note">Note</label>
            <textarea
              id="case-status-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a concise procedural note for the audit trail."
              disabled={saving}
              required
            />
          </div>

          <div className="case-operation-actions">
            <Button type="button" variant="ghost" size="md" onClick={backToCase} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" iconLeft={RefreshCw} loading={saving}>
              Save Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
