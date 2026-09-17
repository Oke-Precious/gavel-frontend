import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, FileCheck, ArrowRight, Scale } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-landing-page">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="about-hero-section">
        <div className="container about-hero-grid">
          <div className="about-hero__left">
            <h1 className="about-hero__title">
              No case should wait past the law.
            </h1>
            <p className="about-hero__subtitle">
              Track awaiting-trial cases across Nigeria's courts and correctional centers — transparently, and without exposing anyone's identity.
            </p>
            <div className="about-hero__actions">
              <Link to="/lookup" className="about-hero__btn-primary">
                Look Up a Case
              </Link>
              <Link to="/backlog-map" className="about-hero__btn-secondary">
                See the National Backlog
              </Link>
            </div>
          </div>

          <div className="about-hero__right">
            <div className="about-hero__card">
              <div className="about-hero__icon-circle" aria-hidden="true">
                <Scale size={32} />
              </div>
              <div className="about-hero__case-id">CASE ID: 58925-42</div>
              <div className="about-hero__status-text">Active Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS BANNER                                              */}
      {/* ============================================================ */}
      <section className="about-stats-section container">
        <div className="about-stats-grid">
          <div className="about-stat-card">
            <span className="about-stat-value">64%</span>
            <p className="about-stat-desc">
              of Nigeria's prison population is awaiting trial
            </p>
          </div>

          <div className="about-stat-card">
            <span className="about-stat-value">51,955+</span>
            <p className="about-stat-desc">
              people currently held awaiting trial nationwide
            </p>
          </div>

          <div className="about-stat-card about-stat-card--accent-red">
            <span className="about-stat-value">28 Days</span>
            <p className="about-stat-desc">
              the legal remand limit under the 2015 ACJA — routinely exceeded
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW GAVEL WORKS                                           */}
      {/* ============================================================ */}
      <section className="about-works-section container">
        <div className="about-works__header">
          <h2 className="about-works__title">How Gavel Works</h2>
          <p className="about-works__subtitle">
            Ensuring accountability through transparent tracking.
          </p>
        </div>

        <div className="about-works-grid">
          <div className="about-works-card">
            <div className="about-works-card__icon-box about-works-card__icon-box--purple">
              <Search size={22} />
            </div>
            <h3 className="about-works-card__title">1. Look up a case</h3>
            <p className="about-works-card__desc">
              Search by Case Hash ID, never by name. Maintain privacy while ensuring public oversight.
            </p>
          </div>

          <div className="about-works-card">
            <div className="about-works-card__icon-box about-works-card__icon-box--amber">
              <TrendingUp size={22} />
            </div>
            <h3 className="about-works-card__title">2. See where it's stuck</h3>
            <p className="about-works-card__desc">
              View the current lifecycle stage and identify the exact reason for the stall in proceedings.
            </p>
          </div>

          <div className="about-works-card">
            <div className="about-works-card__icon-box about-works-card__icon-box--green">
              <FileCheck size={22} />
            </div>
            <h3 className="about-works-card__title">3. Track accountability</h3>
            <p className="about-works-card__desc">
              Every status change is logged, timestamped, and auditable by the public and officials.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. NATIONAL PICTURE BANNER                                   */}
      {/* ============================================================ */}
      <section className="about-picture-section container">
        <div className="about-picture-card">
          <div className="about-picture__content">
            <h2 className="about-picture__title">See the full national picture</h2>
            <p className="about-picture__subtitle">
              Explore the backlog distribution across Nigeria. Identify systemic delays and regional bottlenecks.
            </p>
            <Link to="/backlog-map" className="about-picture__link">
              <span>Explore the Map</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="about-picture__visual">
            <svg
              viewBox="0 0 400 300"
              className="about-picture__map-graphic"
              aria-label="Nigeria Map Backlog Overview"
            >
              <path d="M 50 150 L 100 130 L 160 140 L 180 180 L 120 220 L 70 200 Z" fill="#CBD5E1" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 160 140 L 220 110 L 270 140 L 250 200 L 180 180 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 160 140 L 180 180 L 150 240 L 100 230 Z" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 120 220 L 150 240 L 140 280 L 100 270 Z" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 150 240 L 200 230 L 220 270 L 170 280 Z" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 220 110 L 300 90 L 350 130 L 320 200 L 270 140 Z" fill="#CBD5E1" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 270 140 L 320 200 L 280 250 L 220 230 Z" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

    </div>
  );
}
