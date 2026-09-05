import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import './PublicLookupPage.css';

export default function PublicLookupPage() {
  const navigate = useNavigate();
  const [hashId, setHashId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (hashId.trim()) {
      navigate(`/lookup/${encodeURIComponent(hashId.trim())}`);
    }
  };

  return (
    <div className="landing-page">
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">No case should wait past the law.</h1>
            <p className="hero-subtitle">
              Track awaiting-trial cases across Nigeria's courts and correctional
              centers — transparently, and without exposing anyone's identity.
            </p>
            <div className="hero-actions">
              <form onSubmit={handleSearch} className="hero-search-form">
                <input
                  type="text"
                  placeholder="Enter Case Hash ID (e.g. LA-2026-0483)"
                  value={hashId}
                  onChange={(e) => setHashId(e.target.value)}
                  className="hero-search-input"
                  aria-label="Case Hash ID"
                />
                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={Search}
                  type="submit"
                  disabled={!hashId.trim()}
                >
                  Look Up a Case
                </Button>
              </form>
              <div className="hero-secondary-action">
                <Button
                  variant="ghost"
                  size="lg"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/scorecard')}
                >
                  See the National Backlog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STAT STRIP --- */}
      <section className="stat-strip">
        <div className="container">
          <div className="stat-grid">
            <Card padding="lg" className="stat-card">
              <span className="stat-value">64%</span>
              <span className="stat-label">of Nigeria's prison population is awaiting trial</span>
            </Card>
            <Card padding="lg" className="stat-card">
              <span className="stat-value">51,955+</span>
              <span className="stat-label">people currently held awaiting trial nationwide</span>
            </Card>
            <Card padding="lg" className="stat-card">
              <span className="stat-value">28 Days</span>
              <span className="stat-label">the legal remand limit under the 2015 ACJA — routinely exceeded</span>
            </Card>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-icon-wrapper" aria-hidden="true">
                <Search size={28} strokeWidth={1.5} />
              </div>
              <h3 className="step-title">1. Look up a case</h3>
              <p className="step-desc">search by Case Hash ID, never by name</p>
            </div>
            <div className="step-item">
              <div className="step-icon-wrapper" aria-hidden="true">
                <Activity size={28} strokeWidth={1.5} />
              </div>
              <h3 className="step-title">2. See where it's stuck</h3>
              <p className="step-desc">view the current lifecycle stage and stall reason</p>
            </div>
            <div className="step-item">
              <div className="step-icon-wrapper" aria-hidden="true">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <h3 className="step-title">3. Track accountability</h3>
              <p className="step-desc">every status change is logged and auditable</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- BACKLOG MAP PREVIEW --- */}
      <section className="map-preview-section">
        <div className="container">
          <Card padding="lg" className="map-card" hoverable onClick={() => navigate('/scorecard')}>
            <div className="map-card-content">
              <div className="map-card-text">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
                  National Backlog
                </h2>
                <p className="map-caption">See the full national picture</p>
              </div>
              <div className="map-card-illustration" aria-hidden="true">
                <Map size={48} strokeWidth={1.5} style={{ color: 'var(--color-indigo)', marginBottom: '1rem' }} />
                <div className="map-states">
                  <span className="map-state-pill">Lagos</span>
                  <span className="map-state-pill">Kano</span>
                  <span className="map-state-pill">Rivers</span>
                  <span className="map-state-pill">Enugu</span>
                  <span className="map-state-pill">Kaduna</span>
                  <span className="map-state-pill">Ogun</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
