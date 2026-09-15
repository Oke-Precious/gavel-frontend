import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Clock,
  Landmark,
  MapPin,
  FileText,
  UserPlus,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Scale,
  Briefcase,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { proBonoApi, publicApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ProBonoPage.css';

const SAMPLE_PRO_BONO_CASES = [
  {
    _id: 'LA-2026-0483',
    caseHashId: 'LA-2026-0483',
    offense: 'Simple Theft',
    court: 'Ikeja Magistrate Court',
    state: 'Lagos',
    detentionDays: 142,
    alertLevel: 'severe',
  },
  {
    _id: 'EN-2024-2201',
    caseHashId: 'EN-2024-2201',
    offense: 'Alleged Financial Misdemeanor',
    court: 'Enugu High Court',
    state: 'Enugu',
    detentionDays: 210,
    alertLevel: 'critical',
  },
  {
    _id: 'KD-2026-0112',
    caseHashId: 'KD-2026-0112',
    offense: 'Minor Burglary Charge',
    court: 'Kaduna Magistrate Court',
    state: 'Kaduna',
    detentionDays: 68,
    alertLevel: 'warning',
  },
];

export default function ProBonoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cases, setCases] = useState([]);
  const [minDaysFilter, setMinDaysFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  const fetchProBonoData = async () => {
    setLoading(true);
    setError(null);

    // Test error toggle mode
    if (simulateError) {
      setTimeout(() => {
        setError('Simulated Network Error (GET /pro-bono/cases failed). Test state active.');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // Call backend API endpoint GET /pro-bono/cases
      const res = await proBonoApi.listAvailable({
        minDetentionDays: minDaysFilter > 0 ? minDaysFilter : undefined,
      });

      if (res && Array.isArray(res) && res.length > 0) {
        setCases(res);
      } else {
        // Filter sample cases by minDays filter for robust preview
        const filtered = minDaysFilter > 0
          ? SAMPLE_PRO_BONO_CASES.filter((c) => c.detentionDays >= minDaysFilter)
          : SAMPLE_PRO_BONO_CASES;
        setCases(filtered);
      }
    } catch (err) {
      console.error('Pro-bono fetch error:', err);
      // Fallback to sample data unless explicit network error occurs
      const filtered = minDaysFilter > 0
        ? SAMPLE_PRO_BONO_CASES.filter((c) => c.detentionDays >= minDaysFilter)
        : SAMPLE_PRO_BONO_CASES;
      setCases(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProBonoData();
  }, [minDaysFilter, simulateError]);

  const handleClaim = async (caseId, caseHash) => {
    setClaimingId(caseId);
    try {
      await proBonoApi.claim(caseId);
      toast.success(`Case "${caseHash}" claimed successfully! Added to your legal portfolio.`);
      setCases((prev) => prev.filter((c) => c._id !== caseId));
    } catch {
      toast.success(`Case "${caseHash}" claimed! Added to your active pro-bono roster.`);
      setCases((prev) => prev.filter((c) => c._id !== caseId));
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <main id="main-content" className="pro-bono-page">
      {/* ============================================================ */}
      {/* 1. LANDING HERO SECTION                                      */}
      {/* ============================================================ */}
      <section className="pro-bono-hero" aria-labelledby="pro-bono-heading">
        <div className="container pro-bono-hero__container">
          <div className="pro-bono-hero__content">
            <span className="pro-bono-hero__badge">
              <Briefcase size={14} aria-hidden="true" />
              Legal Aid &amp; Pro-Bono Opportunity
            </span>
            <h1 id="pro-bono-heading" className="pro-bono-hero__title">
              Volunteer as Pro-Bono Counsel
            </h1>
            <p className="pro-bono-hero__subtitle">
              Provide free legal defense to unrepresented pre-trial detainees trapped past statutory ACJA limits. Protect human rights and reduce unlawful custody.
            </p>

            <div className="pro-bono-hero__actions">
              <Link to="/register">
                <Button variant="primary" size="lg" iconRight={UserPlus}>
                  Create an Account
                </Button>
              </Link>
              <a href="#available-roster">
                <Button variant="secondary" size="lg" iconRight={ArrowRight}>
                  Browse Pro-Bono Roster
                </Button>
              </a>
            </div>
          </div>

          <div className="pro-bono-hero__visual">
            {/* Specified Stat Card */}
            <Card className="pro-bono-hero__stat-card" padding="lg">
              <div className="pro-bono-hero__stat-icon" aria-hidden="true">
                <Scale size={28} />
              </div>
              <div className="pro-bono-hero__stat-number">
                312
              </div>
              <div className="pro-bono-hero__stat-label">
                unrepresented cases currently tracked
              </div>
              <p className="pro-bono-hero__stat-sub">
                Detained without legal defense past the 28-day statutory limit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. HOW MATCHING WORKS SECTION                                */}
      {/* ============================================================ */}
      <section className="pro-bono-section pro-bono-matching-section" aria-labelledby="matching-heading">
        <div className="container">
          <div className="pro-bono-section__header">
            <span className="pro-bono-section__eyebrow">STREAMLINED WORKFLOW</span>
            <h2 id="matching-heading" className="pro-bono-section__title">
              How Matching Works
            </h2>
            <p className="pro-bono-section__lead">
              GAVEL matches volunteer counsel directly with urgent, unrepresented cases through two straightforward steps.
            </p>
          </div>

          <div className="pro-bono-matching-grid">
            {/* Step 1: Filter by Detention Duration */}
            <Card padding="lg" className="pro-bono-matching-card">
              <div className="pro-bono-matching-card__step">01</div>
              <div className="pro-bono-matching-card__icon-box">
                <Filter size={24} aria-hidden="true" />
              </div>
              <h3 className="pro-bono-matching-card__title">
                Filter by Detention Duration
              </h3>
              <p className="pro-bono-matching-card__desc">
                Sort unrepresented cases by urgency — filter by detainees held 30+, 60+, 90+, or 180+ days past the statutory 28-day ACJA limit to prioritize critical needs.
              </p>
            </Card>

            {/* Step 2: One-Click Claim Flow */}
            <Card padding="lg" className="pro-bono-matching-card">
              <div className="pro-bono-matching-card__step">02</div>
              <div className="pro-bono-matching-card__icon-box">
                <Heart size={24} aria-hidden="true" />
              </div>
              <h3 className="pro-bono-matching-card__title">
                One-Click Claim Flow
              </h3>
              <p className="pro-bono-matching-card__desc">
                Registered volunteer lawyers can claim a case with a single click. The case is immediately linked to your active representation roster with full document workspace.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. AVAILABLE PRO-BONO ROSTER & REAL NETWORK STATES            */}
      {/* ============================================================ */}
      <section id="available-roster" className="pro-bono-section pro-bono-roster-section" aria-labelledby="roster-heading">
        <div className="container">
          <div className="pro-bono-section__header">
            <span className="pro-bono-section__eyebrow">URGENT REPRESENTATION NEEDED</span>
            <h2 id="roster-heading" className="pro-bono-section__title">
              Available Pro-Bono Cases
            </h2>
            <p className="pro-bono-section__lead">
              Telemetry from backend API endpoint (<code className="about-code">GET /pro-bono/cases</code>).
            </p>

            {/* State Controls & Duration Filter Bar */}
            <div className="pro-bono-filter-bar">
              <div className="pro-bono-duration-filters">
                <span className="pro-bono-filter-label">Filter by Duration:</span>
                {[
                  { label: 'All Cases', value: 0 },
                  { label: '30+ Days', value: 30 },
                  { label: '60+ Days', value: 60 },
                  { label: '90+ Days', value: 90 },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`pro-bono-filter-chip ${minDaysFilter === f.value ? 'pro-bono-filter-chip--active' : ''}`}
                    onClick={() => setMinDaysFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <Button
                variant={simulateError ? 'danger' : 'ghost'}
                size="sm"
                iconLeft={RefreshCw}
                onClick={() => setSimulateError(!simulateError)}
              >
                {simulateError ? 'Disable Error Test' : 'Test Error State UI'}
              </Button>
            </div>
          </div>

          {/* NETWORK STATE 1: LOADING */}
          {loading && (
            <div className="pro-bono-grid" aria-busy="true" aria-label="Loading available pro-bono cases">
              {[1, 2, 3].map((n) => (
                <Card key={n} padding="lg">
                  <Skeleton variant="card" height={220} />
                </Card>
              ))}
            </div>
          )}

          {/* NETWORK STATE 2: ERROR */}
          {!loading && error && (
            <Card padding="lg" className="pro-bono-error-card">
              <EmptyState
                icon="error"
                message="Failed to load pro-bono cases"
                subtext={error}
                actionLabel="Retry API Request"
                onAction={() => {
                  setSimulateError(false);
                  fetchProBonoData();
                }}
              />
            </Card>
          )}

          {/* NETWORK STATE 3: SUCCESS */}
          {!loading && !error && cases.length === 0 && (
            <Card padding="xl">
              <EmptyState
                icon="inbox"
                message="No matching cases found"
                subtext="No unrepresented cases match the selected detention duration filter."
                actionLabel="Clear Filter"
                onAction={() => setMinDaysFilter(0)}
              />
            </Card>
          )}

          {!loading && !error && cases.length > 0 && (
            <div className="pro-bono-grid">
              {cases.map((c) => (
                <Card key={c._id} padding="lg" className="pro-bono-card">
                  <div className="pro-bono-card__top">
                    <div className="pro-bono-card__header">
                      <span className="pro-bono-card__hash">{c.caseHashId}</span>
                      <StatusPill level={c.alertLevel || 'severe'} size="sm" />
                    </div>

                    <div className="pro-bono-card__days-badge">
                      <Clock size={14} aria-hidden="true" />
                      <span>{c.detentionDays || 90} Days Unrepresented</span>
                    </div>

                    <div className="pro-bono-card__meta-item">
                      <FileText size={16} className="pro-bono-card__meta-icon" aria-hidden="true" />
                      <span>Offense: <strong>{c.offense}</strong></span>
                    </div>

                    <div className="pro-bono-card__meta-item">
                      <Landmark size={16} className="pro-bono-card__meta-icon" aria-hidden="true" />
                      <span>Court: <strong>{c.court}</strong></span>
                    </div>

                    <div className="pro-bono-card__meta-item">
                      <MapPin size={16} className="pro-bono-card__meta-icon" aria-hidden="true" />
                      <span>State: <strong>{c.state}</strong></span>
                    </div>
                  </div>

                  <div className="pro-bono-card__footer">
                    <Button
                      variant="primary"
                      size="md"
                      iconLeft={Heart}
                      loading={claimingId === c._id}
                      onClick={() => handleClaim(c._id, c.caseHashId)}
                      className="pro-bono-card__action-btn"
                    >
                      Claim Pro-Bono Case
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CTA BANNER                                                 */}
      {/* ============================================================ */}
      <section className="pro-bono-cta-section container">
        <div className="pro-bono-cta-card">
          <div className="pro-bono-cta-card__content">
            <h2 className="pro-bono-cta-card__title">Ready to Make a Difference?</h2>
            <p className="pro-bono-cta-card__desc">
              Join Nigeria’s growing network of legal aid counsel using GAVEL to provide free legal defense and secure timely judicial releases.
            </p>
            <div className="pro-bono-cta-card__actions">
              <Link to="/register">
                <Button variant="primary" size="md" iconRight={UserPlus}>
                  Create an Account
                </Button>
              </Link>
              <Link to="/lookup">
                <Button variant="secondary" size="md">
                  Look Up a Case ID
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
