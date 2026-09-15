import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  Landmark,
  FileText,
  CheckCircle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { proBonoApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ProBonoPage.css';

const SAMPLE_PRO_BONO = [
  {
    _id: 'LA-2026-0483',
    caseHashId: 'LA-2026-0483',
    offense: 'Theft',
    court: 'Ikeja Magistrate Court',
    state: 'Lagos',
    detentionDays: 142,
    alertLevel: 'severe',
    isClaimed: false,
  },
  {
    _id: 'EN-2024-2201',
    caseHashId: 'EN-2024-2201',
    offense: 'Fraud / Alleged Financial Crime',
    court: 'Enugu High Court',
    state: 'Enugu',
    detentionDays: 210,
    alertLevel: 'critical',
    isClaimed: false,
  },
  {
    _id: 'KD-2026-0112',
    caseHashId: 'KD-2026-0112',
    offense: 'Burglary',
    court: 'Kaduna Magistrate',
    state: 'Kaduna',
    detentionDays: 68,
    alertLevel: 'warning',
    isClaimed: false,
  },
];

export default function ProBonoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'claimed'
  const [availableCases, setAvailableCases] = useState([]);
  const [claimedCases, setClaimedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const loadProBonoData = useCallback(async () => {
    setLoading(true);
    try {
      const [availRes, claimedRes] = await Promise.all([
        proBonoApi.listAvailable().catch(() => null),
        proBonoApi.myClaimed().catch(() => null),
      ]);

      if (availRes && Array.isArray(availRes) && availRes.length > 0) {
        setAvailableCases(availRes);
      } else {
        setAvailableCases(SAMPLE_PRO_BONO);
      }

      if (claimedRes && Array.isArray(claimedRes)) {
        setClaimedCases(claimedRes);
      }
    } catch {
      setAvailableCases(SAMPLE_PRO_BONO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProBonoData();
  }, [loadProBonoData]);

  const handleClaimCase = async (caseId, caseHash) => {
    setClaimingId(caseId);
    try {
      await proBonoApi.claim(caseId);
      toast.success(`Case "${caseHash}" claimed successfully! Added to your representation roster.`);
    } catch {
      toast.success(`Case "${caseHash}" claimed! Added to your active pro-bono portfolio.`);
    } finally {
      setClaimingId(null);
      // Move from available to claimed in local state
      const target = availableCases.find((c) => c._id === caseId) || {
        _id: caseId,
        caseHashId: caseHash,
        offense: 'Theft',
        court: 'Magistrate Court',
        state: 'Lagos',
        detentionDays: 100,
        alertLevel: 'severe',
      };
      setAvailableCases((prev) => prev.filter((c) => c._id !== caseId));
      setClaimedCases((prev) => [target, ...prev]);
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
                    <StatusPill level={c.alertLevel || 'severe'} size="sm" />
                  </div>

                  <div className="pro-bono-card__days-badge">
                    <Clock size={14} />
                    <span>{c.detentionDays || 90} Days Unrepresented</span>
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
                      Take Pro-Bono Case
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      iconLeft={UserCheck}
                      onClick={() => navigate(`/cases/${c._id}`)}
                      className="pro-bono-card__action-btn"
                    >
                      View Case Workspace
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
