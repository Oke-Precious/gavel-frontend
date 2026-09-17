import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, MapPin, Landmark, FileText, Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import RemandClock from '../../components/RemandClock.jsx';
import Timeline from '../../components/Timeline.jsx';
import Modal from '../../components/Modal.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { publicApi, watchApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import { daysInCustody } from '../../utils/formatDate.js';
import { validateEmail } from '../../utils/validators.js';
import './CasePublicPage.css';

const LIFECYCLE_STAGES = [
  { label: 'Arrest' },
  { label: 'Charge & Remand' },
  { label: 'DPP Advice / Adjournment' },
  { label: 'Trial or Discharge' },
];

export default function CasePublicPage() {
  const { caseHashId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Watch Case Modal State
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [watchEmail, setWatchEmail] = useState('');
  const [isSubmittingWatch, setIsSubmittingWatch] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchCaseDetails() {
      setIsLoading(true);
      setError(null);

      const targetId = caseHashId;

      try {
        const data = await publicApi.getCaseByHashId(targetId);
        if (!cancelled) {
          // Normalize backend data structure or merge with default layout
          const hasDirectDays = Number.isFinite(Number(data?.detentionDays ?? data?.daysInCustody));
          const normalizedDays = hasDirectDays
            ? Number(data.detentionDays ?? data.daysInCustody)
            : data?.detentionDate
              ? daysInCustody(data.detentionDate)
              : null;
          const calculatedAlert = normalizedDays == null
            ? null
            : getAlertLevel(normalizedDays).level;

          // Map stage string to 0-3 index if backend returns string
          let stageIdx = 0;
          if (data?.stage) {
            const stageLower = String(data.stage).toLowerCase();
            if (stageLower.includes('arrest')) stageIdx = 0;
            else if (stageLower.includes('charge') || stageLower.includes('remand') || stageLower.includes('pre-trial')) stageIdx = 1;
            else if (stageLower.includes('dpp') || stageLower.includes('adjourn')) stageIdx = 2;
            else if (stageLower.includes('trial') || stageLower.includes('discharge')) stageIdx = 3;
          }

          setCaseData({
            caseHashId: data?.hashId || targetId,
            state: data?.state || 'Not provided',
            court: data?.court || 'Not provided',
            offenseCategory: data?.offenseCategory || data?.title || 'Not provided',
            daysInCustody: normalizedDays,
            alertLevel: calculatedAlert,
            currentStageIndex: stageIdx,
          });
        }
      } catch (err) {
        if (!cancelled) {
          const msg = !err.response
            ? 'Network error — check your connection and try again.'
            : err.response?.data?.message || `No public case record was found for "${targetId}".`;
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCaseDetails();
    return () => {
      cancelled = true;
    };
  }, [caseHashId]);

  const handleWatchSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = watchEmail.trim();

    const emailError = validateEmail(cleanEmail);
    if (emailError) {
      toast.warning(emailError);
      return;
    }

    const currentId = caseData?.caseHashId || caseHashId;
    setIsSubmittingWatch(true);

    try {
      await watchApi.subscribe(currentId, cleanEmail);
      toast.success(`Subscribed! We'll email you if ${currentId}'s status changes.`);
      setIsWatchModalOpen(false);
      setWatchEmail('');
    } catch (err) {
      const msg = !err.response
        ? 'Network error — check your connection and try again.'
        : err.response?.data?.message || 'Unable to subscribe to case updates.';
      toast.error(msg);
    } finally {
      setIsSubmittingWatch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="case-public-page">
        <div className="container case-public-container">
          <div className="case-public-skeleton-header">
            <Skeleton variant="text" width="200px" height="24px" />
            <Skeleton variant="text" width="320px" height="40px" />
          </div>
          <div className="case-public-grid">
            <Card padding="lg">
              <Skeleton variant="card" height={280} />
            </Card>
            <Card padding="lg">
              <Skeleton variant="card" height={280} />
            </Card>
          </div>
          <Card padding="lg" className="case-public-skeleton-timeline">
            <Skeleton variant="card" height={160} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="case-public-page">
        <div className="container case-public-container">
          <Card padding="lg" className="case-public-error-card">
            <EmptyState
              icon="search"
              message="Case Not Found"
              subtext={error || `No public case record found for ID "${caseHashId}".`}
              actionLabel="Back to Search"
              onAction={() => navigate('/lookup')}
            />
          </Card>
        </div>
      </div>
    );
  }

  const daysExceeded = caseData.daysInCustody == null
    ? 0
    : Math.max(0, caseData.daysInCustody - 28);

  return (
    <div className="case-public-page">
      <div className="container case-public-container">
        {/* Navigation Breadcrumb / Back Action */}
        <div className="case-public-nav">
          <button
            type="button"
            className="case-public-back-btn"
            onClick={() => navigate('/lookup')}
          >
            <ArrowLeft size={16} />
            <span>Look Up Another Case</span>
          </button>
        </div>

        {/* Top Header Bar */}
        <div className="case-public-header">
          <div className="case-public-header__meta">
            <span className="case-public-header__caption">CASE HASH ID</span>
            <div className="case-public-header__title-row">
              <h1 className="case-public-header__title">{caseData.caseHashId}</h1>
              {caseData.alertLevel && <StatusPill level={caseData.alertLevel} size="md" />}
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            iconLeft={Eye}
            onClick={() => setIsWatchModalOpen(true)}
            className="case-public-watch-btn"
          >
            Watch This Case
          </Button>
        </div>

        {/* Main Grid: Remand Clock + Case Jurisdiction */}
        <div className="case-public-grid">
          {/* Card 1: Time in Custody */}
          <Card className="case-public-card case-public-custody-card" padding="lg">
            <h2 className="case-public-card__title">Time in Custody</h2>
            {caseData.daysInCustody == null ? (
              <p className="case-public-custody-caption" role="status">
                Detention duration is not available in the public API response.
              </p>
            ) : (
              <>
                <div className="case-public-clock-wrapper">
                  <RemandClock days={caseData.daysInCustody} limit={28} size="lg" animated />
                </div>
                <p className="case-public-custody-caption">
                  days in custody — <strong>legal limit is 28 days</strong>.{' '}
                  {daysExceeded > 0 && (
                    <span>This case exceeds the statutory remand period by {daysExceeded} days.</span>
                  )}
                </p>
              </>
            )}
          </Card>

          {/* Card 2: Case Jurisdiction */}
          <Card className="case-public-card case-public-jurisdiction-card" padding="lg">
            <h2 className="case-public-card__title">Case Jurisdiction</h2>
            <div className="case-public-jurisdiction-list">
              {/* State */}
              <div className="jurisdiction-item">
                <span className="jurisdiction-item__label">STATE</span>
                <div className="jurisdiction-item__value">
                  <MapPin size={18} className="jurisdiction-item__icon" />
                  <span>{caseData.state}</span>
                </div>
              </div>

              {/* Court */}
              <div className="jurisdiction-item">
                <span className="jurisdiction-item__label">COURT</span>
                <div className="jurisdiction-item__value">
                  <Landmark size={18} className="jurisdiction-item__icon" />
                  <span>{caseData.court}</span>
                </div>
              </div>

              {/* Offense Category */}
              <div className="jurisdiction-item">
                <span className="jurisdiction-item__label">OFFENSE CATEGORY</span>
                <div className="jurisdiction-item__value">
                  <FileText size={18} className="jurisdiction-item__icon" />
                  <span>{caseData.offenseCategory}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Card: Case Progression (4-Stage Timeline) */}
        <Card className="case-public-card case-public-progression-card" padding="lg">
          <h2 className="case-public-card__title">Case Progression</h2>
          <div className="case-public-timeline-wrapper">
            <Timeline
              currentStageIndex={caseData.currentStageIndex}
              stages={LIFECYCLE_STAGES}
            />
          </div>
        </Card>

        {/* Watch This Case Modal */}
        <Modal
          isOpen={isWatchModalOpen}
          onClose={() => setIsWatchModalOpen(false)}
          title="Watch This Case"
          size="sm"
        >
          <form onSubmit={handleWatchSubmit} className="watch-modal-form" noValidate>
            <p className="watch-modal-desc">
              We'll email you if this case's status changes. We store nothing else about you or this case.
            </p>

            <div className="watch-modal-field">
              <label htmlFor="watch-email-input" className="watch-modal-label">
                Email Address
              </label>
              <div className="watch-modal-input-wrapper">
                <Mail size={18} className="watch-modal-input-icon" />
                <input
                  id="watch-email-input"
                  type="email"
                  className="watch-modal-input"
                  placeholder="you@example.com"
                  value={watchEmail}
                  onChange={(e) => setWatchEmail(e.target.value)}
                  disabled={isSubmittingWatch}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="watch-modal-actions">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsWatchModalOpen(false)}
                disabled={isSubmittingWatch}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmittingWatch}
                disabled={!watchEmail.trim()}
              >
                Subscribe
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
