import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  Landmark,
  FileText,
  UserCheck,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { proBonoApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { daysInCustody } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './ProBonoPage.css';

function normalizeCase(caseRecord) {
  const detentionDays = Number.isFinite(Number(caseRecord.detentionDays))
    ? Number(caseRecord.detentionDays)
    : caseRecord.detentionDate
      ? daysInCustody(caseRecord.detentionDate)
      : null;

  return {
    ...caseRecord,
    _id: caseRecord._id ?? caseRecord.id,
    caseHashId: caseRecord.hashId ?? caseRecord.caseHashId ?? '—',
    offense: caseRecord.title ?? caseRecord.offenseCategory ?? 'Not provided',
    court: caseRecord.court ?? 'Not provided',
    state: caseRecord.state ?? 'Not provided',
    detentionDays,
    alertLevel: detentionDays == null ? null : getAlertLevel(detentionDays).level,
  };
}

export default function ProBonoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'claimed'
  const [availableCases, setAvailableCases] = useState([]);
  const [claimedCases, setClaimedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  const loadProBonoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [availRes, claimedRes] = await Promise.all([
        proBonoApi.listAvailable(),
        proBonoApi.myClaimed(),
      ]);
      const available = Array.isArray(availRes) ? availRes : (availRes?.cases ?? []);
      const claimed = Array.isArray(claimedRes) ? claimedRes : (claimedRes?.cases ?? []);
      setAvailableCases(available.map(normalizeCase));
      setClaimedCases(claimed.map(normalizeCase));
    } catch (requestError) {
      setAvailableCases([]);
      setClaimedCases([]);
      setError(!requestError?.response
        ? 'Network error — check your connection and try again.'
        : requestError.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : requestError.response?.data?.message ?? 'Unable to load pro-bono cases.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadProBonoData, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadProBonoData]);

  const handleClaimCase = async (caseId, caseHash) => {
    setClaimingId(caseId);
    try {
      const claimResult = await proBonoApi.claim(caseId);
      toast.success(`Case "${caseHash}" claimed successfully! Added to your representation roster.`);
      // Move from available to claimed only after the backend confirms the claim.
      const target = availableCases.find((c) => c._id === caseId);
      const claimedRecord = claimResult?.case
        ? normalizeCase(claimResult.case)
        : target;
      setAvailableCases((prev) => prev.filter((c) => c._id !== caseId));
      if (claimedRecord) {
        setClaimedCases((prev) => [claimedRecord, ...prev.filter((c) => c._id !== caseId)]);
      } else {
        await loadProBonoData();
      }
    } catch (requestError) {
      const message = !requestError?.response
        ? 'Network error — check your connection and try again.'
        : requestError.response?.data?.message ?? `Unable to claim case "${caseHash}".`;
      toast.error(message);
    } finally {
      setClaimingId(null);
    }
  };

  const displayedCases = activeTab === 'available' ? availableCases : claimedCases;

  return (
    <div className="pro-bono-page">
      <div className="container pro-bono-container">
        {/* Page Header */}
        <div className="pro-bono-header">
          <div className="pro-bono-header__left">
            <h1 className="pro-bono-title">Pro-Bono Legal Opportunity Hub</h1>
            <p className="pro-bono-subtitle">
              Volunteer lawyers can browse and claim unrepresented pre-trial detention cases exceeding statutory limits.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="pro-bono-tabs">
          <button
            className={`pro-bono-tab ${activeTab === 'available' ? 'pro-bono-tab--active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Opportunities ({availableCases.length})
          </button>
          <button
            className={`pro-bono-tab ${activeTab === 'claimed' ? 'pro-bono-tab--active' : ''}`}
            onClick={() => setActiveTab('claimed')}
          >
            My Claimed Roster ({claimedCases.length})
          </button>
        </div>

        {/* Case Cards Grid */}
        {loading ? (
          <div className="pro-bono-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton variant="card" height={220} />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card padding="xl">
            <EmptyState
              icon="error"
              message="Unable to Load Pro-Bono Cases"
              subtext={error}
              actionLabel="Try Again"
              onAction={loadProBonoData}
            />
          </Card>
        ) : displayedCases.length === 0 ? (
          <Card padding="xl">
            <EmptyState
              icon="inbox"
              message={
                activeTab === 'available'
                  ? 'No Pro-Bono Cases Available'
                  : 'No Claimed Cases Yet'
              }
              subtext={
                activeTab === 'available'
                  ? 'All flagged pre-trial cases currently have assigned legal representation.'
                  : 'Browse available opportunities to offer free legal defense for detained individuals.'
              }
              actionLabel={activeTab === 'claimed' ? 'Explore Opportunities' : undefined}
              onAction={activeTab === 'claimed' ? () => setActiveTab('available') : undefined}
            />
          </Card>
        ) : (
          <div className="pro-bono-grid">
            {displayedCases.map((c) => (
              <Card key={c._id} padding="lg" className="pro-bono-card">
                <div className="pro-bono-card__top">
                  <div className="pro-bono-card__header">
                    <span className="pro-bono-card__hash">{c.caseHashId}</span>
                    {c.alertLevel && <StatusPill level={c.alertLevel} size="sm" />}
                  </div>

                  <div className="pro-bono-card__days-badge">
                    <Clock size={14} />
                    <span>
                      {c.detentionDays == null
                        ? 'Detention duration unavailable'
                        : `${c.detentionDays} ${c.detentionDays === 1 ? 'Day' : 'Days'} Unrepresented`}
                    </span>
                  </div>

                  <div className="pro-bono-card__meta-item">
                    <FileText size={16} className="pro-bono-card__meta-icon" />
                    <span>Offense: <strong>{c.offense}</strong></span>
                  </div>

                  <div className="pro-bono-card__meta-item">
                    <Landmark size={16} className="pro-bono-card__meta-icon" />
                    <span>Court: <strong>{c.court}</strong></span>
                  </div>

                  <div className="pro-bono-card__meta-item">
                    <MapPin size={16} className="pro-bono-card__meta-icon" />
                    <span>State: <strong>{c.state}</strong></span>
                  </div>
                </div>

                <div className="pro-bono-card__footer">
                  {activeTab === 'available' ? (
                    <Button
                      variant="primary"
                      size="md"
                      iconLeft={Heart}
                      loading={claimingId === c._id}
                      onClick={() => handleClaimCase(c._id, c.caseHashId)}
                      className="pro-bono-card__action-btn"
                    >
                      Claim Case
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      iconLeft={UserCheck}
                      onClick={() => navigate(`/cases/${c._id}`)}
                      className="pro-bono-card__action-btn"
                    >
                      View Case
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
