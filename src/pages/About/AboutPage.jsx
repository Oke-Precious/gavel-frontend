import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Search,
  Clock,
  FileText,
  CheckCircle2,
  Shield,
  ArrowRight,
  AlertTriangle,
  Lock,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { publicApi } from '../../services/api.js';
import './AboutPage.css';

/**
 * Exact 4 Stage names required:
 * 1. Arrest
 * 2. Charge & Remand
 * 3. DPP Advice / Adjournment
 * 4. Trial or Discharge
 */
const LIFECYCLE_STAGES = [
  {
    step: '01',
    name: 'Arrest',
    icon: Shield,
    badge: 'Stage 1',
    description:
      'Law enforcement apprehends suspect. Case is assigned a 100% anonymous cryptographic Case Hash ID (e.g., GAV-26-8A3F9) to safeguard personal dignity.',
    detail: 'No personal names or identifying photos are stored or exposed publicly.',
  },
  {
    step: '02',
    name: 'Charge & Remand',
    icon: Clock,
    badge: 'Stage 2',
    description:
      'Accused is presented before court. Magistrate issues a 14-to-28-day remand warrant into correctional facility custody.',
    detail: 'The statutory 28-day ACJA countdown clock initiates immediately upon remand.',
  },
  {
    step: '03',
    name: 'DPP Advice / Adjournment',
    icon: FileText,
    badge: 'Stage 3',
    description:
      'Case file transferred to Director of Public Prosecutions (DPP) for legal advice while court proceedings accumulate adjournments.',
    detail: 'Identifies systemic bottlenecks where cases routinely exceed legal detention limits.',
  },
  {
    step: '04',
    name: 'Trial or Discharge',
    icon: CheckCircle2,
    badge: 'Stage 4',
    description:
      'Formal trial proceedings commence in High Court resulting in acquittal, discharge, bail release, or final sentencing.',
    detail: 'Permanent audit trail verifies resolution and public accountability.',
  },
];

export default function AboutPage() {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  const fetchScorecard = async () => {
    setLoading(true);
    setError(null);

    // Allow user to test error state explicitly if simulateError is toggled
    if (simulateError) {
      setTimeout(() => {
        setError('Simulated Network Failure (HTTP 500 / Network Timeout) for state testing.');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const data = await publicApi.scorecard();
      setScorecard(data);
    } catch (err) {
      console.error('Failed to fetch scorecard:', err);
      setError(
        err.response?.data?.message ||
          'Unable to connect to GAVEL backend endpoint (GET /public/scorecard). Please check network.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, [simulateError]);

  return (
    <main id="main-content" className="about-page">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="container about-hero__container">
          <div className="about-hero__content">
            <span className="about-hero__badge">
              <Shield size={14} aria-hidden="true" />
              Civic-Tech Transparency Platform
            </span>
            <h1 id="about-hero-heading" className="about-hero__title">
              How GAVEL Works
            </h1>
            <p className="about-hero__subtitle">
              Tracking awaiting-trial court cases across Nigeria’s judicial system
              transparently, efficiently, and humanely — enforcing legal limits without exposing inmate identity.
            </p>

            <div className="about-hero__actions">
              <Link to="/lookup">
                <Button variant="primary" size="lg" iconRight={Search}>
                  Look Up a Case
                </Button>
              </Link>
              <Link to="/backlog-map">
                <Button variant="secondary" size="lg" iconRight={ArrowRight}>
                  See National Backlog
                </Button>
              </Link>
            </div>
          </div>

          <div className="about-hero__visual">
            <Card className="about-hero__card">
              <div className="about-hero__card-header">
                <div className="about-hero__icon-circle" aria-hidden="true">
                  <Scale size={28} />
                </div>
                <div>
                  <span className="about-hero__card-tag">SYSTEM DEMO</span>
                  <div className="about-hero__card-id">CASE HASH ID: GAV-26-8A3F9</div>
                </div>
              </div>
              <div className="about-hero__card-body">
                <div className="about-hero__card-row">
                  <span className="about-hero__card-label">Current Stage:</span>
                  <span className="about-hero__card-val">DPP Advice / Adjournment</span>
                </div>
                <div className="about-hero__card-row">
                  <span className="about-hero__card-label">Remand Clock:</span>
                  <span className="about-hero__card-status about-hero__card-status--warning">
                    <Clock size={14} aria-hidden="true" /> 42 Days (Limit Exceeded)
                  </span>
                </div>
                <div className="about-hero__card-row">
                  <span className="about-hero__card-label">Privacy Shield:</span>
                  <span className="about-hero__card-val">
                    <Lock size={14} aria-hidden="true" /> 100% Anonymous
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. WHY THIS MATTERS SECTION                                  */}
      {/* ============================================================ */}
      <section className="about-section about-why-section" aria-labelledby="why-matters-heading">
        <div className="container">
          <div className="about-section__header">
            <span className="about-section__eyebrow">URGENT CIVIC CONTEXT</span>
            <h2 id="why-matters-heading" className="about-section__title">
              Why This Matters
            </h2>
            <p className="about-section__lead">
              Unlawful pre-trial detention destroys lives and overburdens Nigeria’s correctional centers.
            </p>
          </div>

          {/* Mandatory Citation Quote Box */}
          <div className="about-quote-box" role="region" aria-label="Key Statistic">
            <div className="about-quote-box__icon" aria-hidden="true">
              <AlertTriangle size={32} />
            </div>
            <blockquote className="about-quote-box__text">
              “64% of Nigeria's prison population is awaiting trial, some for over a decade, against a 28-day legal limit.”
            </blockquote>
            <cite className="about-quote-box__source">
              — Administration of Criminal Justice Act (ACJA) 2015 & National Judicial Data
            </cite>
          </div>

          {/* 3 Impact Stat Cards */}
          <div className="about-why-grid">
            <Card padding="lg" className="about-why-card">
              <span className="about-why-card__num text-danger">64%</span>
              <h3 className="about-why-card__title">Awaiting Trial Population</h3>
              <p className="about-why-card__desc">
                Nearly two-thirds of detainees in Nigerian correctional centers have never been convicted of any crime.
              </p>
            </Card>

            <Card padding="lg" className="about-why-card">
              <span className="about-why-card__num text-primary">28 Days</span>
              <h3 className="about-why-card__title">Legal Remand Limit</h3>
              <p className="about-why-card__desc">
                Under Section 293 of ACJA 2015, remand warrants expire after 28 days unless extended by judicial order.
              </p>
            </Card>

            <Card padding="lg" className="about-why-card">
              <span className="about-why-card__num text-amber">100%</span>
              <h3 className="about-why-card__title">Dignity & Privacy Shield</h3>
              <p className="about-why-card__desc">
                GAVEL replaces inmate names with cryptographic hash IDs so families can track progress safely.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. 4-STAGE LIFECYCLE GRAPHIC                                 */}
      {/* ============================================================ */}
      <section className="about-section about-lifecycle-section" aria-labelledby="lifecycle-heading">
        <div className="container">
          <div className="about-section__header">
            <span className="about-section__eyebrow">STANDARDIZED PROCESS</span>
            <h2 id="lifecycle-heading" className="about-section__title">
              The 4-Stage Legal Lifecycle
            </h2>
            <p className="about-section__lead">
              GAVEL tracks every case through four distinct, legally defined milestones to pinpoint exact delay points.
            </p>
          </div>

          <div className="about-lifecycle-grid">
            {LIFECYCLE_STAGES.map((stage) => {
              const StageIcon = stage.icon;
              return (
                <Card key={stage.step} padding="lg" className="about-stage-card">
                  <div className="about-stage-card__header">
                    <span className="about-stage-card__number">{stage.step}</span>
                    <span className="about-stage-card__badge">{stage.badge}</span>
                  </div>
                  <div className="about-stage-card__icon-wrap">
                    <StageIcon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="about-stage-card__title">{stage.name}</h3>
                  <p className="about-stage-card__desc">{stage.description}</p>
                  <div className="about-stage-card__footer">
                    <span className="about-stage-card__detail">{stage.detail}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. LIVE BACKEND METRICS & NETWORK STATES                     */}
      {/* ============================================================ */}
      <section className="about-section about-metrics-section" aria-labelledby="metrics-heading">
        <div className="container">
          <div className="about-section__header">
            <span className="about-section__eyebrow">REAL-TIME TELEMETRY</span>
            <h2 id="metrics-heading" className="about-section__title">
              Live System Impact
            </h2>
            <p className="about-section__lead">
              Direct telemetry from backend API endpoint (<code className="about-code">GET /public/scorecard</code>).
            </p>

            {/* State Test Mode Controls */}
            <div className="about-state-controls">
              <Button
                variant={simulateError ? 'danger' : 'ghost'}
                size="sm"
                iconLeft={RefreshCw}
                onClick={() => setSimulateError(!simulateError)}
              >
                {simulateError ? 'Disable Simulated Error' : 'Test Error State UI'}
              </Button>
            </div>
          </div>

          {/* NETWORK STATE 1: LOADING */}
          {loading && (
            <div className="about-metrics-grid" aria-busy="true" aria-label="Loading system data">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} padding="lg" className="about-metric-card">
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={36} className="u-mt-2" />
                  <Skeleton variant="text" width="80%" height={14} className="u-mt-2" />
                </Card>
              ))}
            </div>
          )}

          {/* NETWORK STATE 2: ERROR */}
          {!loading && error && (
            <Card padding="lg" className="about-error-card">
              <EmptyState
                icon="error"
                message="Failed to load real-time metrics"
                subtext={error}
                actionLabel="Retry Network Connection"
                onAction={() => {
                  setSimulateError(false);
                  fetchScorecard();
                }}
              />
            </Card>
          )}

          {/* NETWORK STATE 3: SUCCESS */}
          {!loading && !error && scorecard && (
            <div className="about-metrics-grid">
              <Card padding="lg" className="about-metric-card">
                <span className="about-metric-card__label">Total Cases Tracked</span>
                <span className="about-metric-card__val">
                  {(scorecard.totalCases ?? 0).toLocaleString()}
                </span>
                <span className="about-metric-card__sub">Across magistrate & high courts</span>
              </Card>

              <Card padding="lg" className="about-metric-card">
                <span className="about-metric-card__label">Active Awaiting Trial</span>
                <span className="about-metric-card__val text-primary">
                  {(scorecard.activeCases ?? 0).toLocaleString()}
                </span>
                <span className="about-metric-card__sub">Currently undergoing legal lifecycle</span>
              </Card>

              <Card padding="lg" className="about-metric-card">
                <span className="about-metric-card__label">Stalled Cases</span>
                <span className="about-metric-card__val text-danger">
                  {(scorecard.stalledCases ?? 0).toLocaleString()}
                </span>
                <span className="about-metric-card__sub">Exceeding statutory 28-day limit</span>
              </Card>

              <Card padding="lg" className="about-metric-card">
                <span className="about-metric-card__label">System Resolution Rate</span>
                <span className="about-metric-card__val text-emerald">
                  {scorecard.resolutionRate ?? 0}%
                </span>
                <span className="about-metric-card__sub">Cases successfully resolved or discharged</span>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CTA BANNER                                                 */}
      {/* ============================================================ */}
      <section className="about-cta-section container">
        <div className="about-cta-card">
          <div className="about-cta-card__content">
            <h2 className="about-cta-card__title">Explore the National Backlog Map</h2>
            <p className="about-cta-card__desc">
              Visualize court delay density across Nigeria’s 36 states and Federal Capital Territory. Identify bottlenecks and support legal aid intervention.
            </p>
            <div className="about-cta-card__actions">
              <Link to="/backlog-map">
                <Button variant="primary" size="md" iconRight={ArrowRight}>
                  Open Interactive Map
                </Button>
              </Link>
              <Link to="/lookup">
                <Button variant="secondary" size="md">
                  Search Case Hash ID
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
