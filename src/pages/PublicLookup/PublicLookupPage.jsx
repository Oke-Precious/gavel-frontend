import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, ShieldCheck, ArrowRight, X, Gavel } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import './PublicLookupPage.css';

export default function PublicLookupPage() {
  const navigate = useNavigate();
  const [hashId, setHashId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (hashId.trim()) {
      setIsModalOpen(false);
      navigate(`/lookup/${encodeURIComponent(hashId.trim())}`);
    }
  };

  const handleOpenSearchModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="landing-page">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-grid">
            {/* Left Hero Content */}
            <div className="hero-content">
              <h1 className="hero-title">No case should wait past the law.</h1>
              <p className="hero-subtitle">
                Track awaiting-trial cases across Nigeria's courts and correctional centers —
                transparently, and without exposing anyone's identity.
              </p>
              
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={handleOpenSearchModal}
                >
                  Look Up a Case
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => navigate('/scorecard')}
                >
                  See the National Backlog
                </button>
              </div>
            </div>

            {/* Right Hero Card — Active Tracking Badge */}
            <div className="hero-visual">
              <div className="hero-tracking-card">
                <div className="tracking-icon-circle">
                  <div className="tracking-icon-inner">
                    <Gavel size={32} className="tracking-gavel-icon" />
                  </div>
                </div>
                <div className="tracking-meta">
                  <span className="tracking-case-id">CASE ID: 58925-42</span>
                  <h3 className="tracking-status-title">Active Tracking</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STAT STRIP                                                */}
      {/* ============================================================ */}
      <section className="stat-strip">
        <div className="container">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value stat-value-blue">64%</div>
              <p className="stat-label">
                of Nigeria's prison population is awaiting trial
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-value stat-value-amber">51,955+</div>
              <p className="stat-label">
                people currently held awaiting trial nationwide
              </p>
            </div>

            <div className="stat-card stat-card-red-accent">
              <div className="stat-value stat-value-red">28 Days</div>
              <p className="stat-label">
                the legal remand limit under the 2015 ACJA — routinely exceeded
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW GAVEL WORKS                                          */}
      {/* ============================================================ */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Gavel Works</h2>
            <p className="section-subtitle">
              Ensuring accountability through transparent tracking.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-box step-icon-blue">
                <Search size={20} strokeWidth={2.2} />
              </div>
              <h3 className="step-title">1. Look up a case</h3>
              <p className="step-desc">
                Search by Case Hash ID, never by name. Maintain privacy while ensuring public oversight.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-box step-icon-orange">
                <Activity size={20} strokeWidth={2.2} />
              </div>
              <h3 className="step-title">2. See where it's stuck</h3>
              <p className="step-desc">
                View the current lifecycle stage and identify the exact reason for the stall in proceedings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-box step-icon-green">
                <ShieldCheck size={20} strokeWidth={2.2} />
              </div>
              <h3 className="step-title">3. Track accountability</h3>
              <p className="step-desc">
                Every status change is logged, timestamped, and auditable by the public and officials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. NATIONAL PICTURE / MAP PREVIEW                            */}
      {/* ============================================================ */}
      <section className="map-preview-section">
        <div className="container">
          <div className="map-banner-card">
            {/* Left Content Box */}
            <div className="map-banner-info">
              <h2 className="map-banner-title">See the full national picture</h2>
              <p className="map-banner-subtitle">
                Explore the backlog distribution across Nigeria. Identify systemic delays and regional bottlenecks.
              </p>
              <button
                type="button"
                className="map-banner-link"
                onClick={() => navigate('/scorecard')}
              >
                <span>Explore the Map</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right Graphic Box */}
            <div className="map-banner-graphic">
              <div className="nigeria-map-container">
                <img
                  src="/Nigeria%20Choropleth%20Map.png"
                  alt="Nigeria Choropleth Map"
                  className="nigeria-choropleth-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SEARCH LOOKUP MODAL                                         */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="lookup-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="lookup-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="lookup-modal-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="lookup-modal-header">
              <h3 className="lookup-modal-title">Look Up a Case</h3>
              <p className="lookup-modal-desc">
                Enter a Case Hash ID below to view detailed tracking and lifecycle stages.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="lookup-modal-form">
              <div className="lookup-input-wrapper">
                <Search size={18} className="lookup-input-icon" />
                <input
                  type="text"
                  placeholder="Enter Case Hash ID (e.g. LA-2026-0483)"
                  value={hashId}
                  onChange={(e) => setHashId(e.target.value)}
                  className="lookup-modal-input"
                  autoFocus
                />
              </div>

              <div className="lookup-modal-actions">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={!hashId.trim()}
                  fullWidth
                >
                  Track Case
                </Button>
              </div>
            </form>

            <div className="lookup-modal-hints">
              <span className="hint-label">Try sample Case ID:</span>
              <button
                type="button"
                className="hint-chip"
                onClick={() => setHashId('LA-2026-0483')}
              >
                LA-2026-0483
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
