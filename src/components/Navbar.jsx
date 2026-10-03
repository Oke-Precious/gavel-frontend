import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import PersonaSwitcher from './PersonaSwitcher/PersonaSwitcher.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import './Navbar.css';

/**
 * Navbar — Public Top Navigation Bar.
 * Links match exact design with Persona Switcher and Pidgin toggle.
 */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const isAboutActive = location.pathname === '/' || location.pathname === '/about';
  const isLookupActive = location.pathname.startsWith('/lookup');
  const isScorecardActive = location.pathname === '/scorecard';
  const isMapActive = location.pathname === '/backlog-map';
  const isProBonoActive = location.pathname === '/register';

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="GAVEL — Home">
            <img src="/gavel%20blue%20logo.png" alt="GAVEL Logo" className="navbar__logo-img" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar__nav" aria-label="Main navigation">
            <Link
              to="/about"
              className={`navbar__link${isAboutActive ? ' navbar__link--active' : ''}`}
            >
              {t('nav.about')}
            </Link>

            <Link
              to="/lookup"
              className={`navbar__link${isLookupActive ? ' navbar__link--active' : ''}`}
            >
              {t('nav.lookup')}
            </Link>

            <Link
              to="/backlog-map"
              className={`navbar__link${isMapActive ? ' navbar__link--active' : ''}`}
            >
              {t('nav.map')}
            </Link>

            <Link
              to="/scorecard"
              className={`navbar__link${isScorecardActive ? ' navbar__link--active' : ''}`}
            >
              {t('nav.transparency')}
            </Link>

            <Link
              to="/register"
              className={`navbar__link${isProBonoActive ? ' navbar__link--active' : ''}`}
            >
              {t('nav.volunteer')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="navbar__actions">
            {/* Interactive Demo Persona Switcher */}
            <PersonaSwitcher compact={false} />

            {/* Language Toggle: English / Nigerian Pidgin */}
            <button
              type="button"
              className="navbar__lang-btn"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Nigerian Pidgin English' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Globe size={13} />
              <span>{language === 'en' ? '🇳🇬 Pidgin' : '🇬🇧 English'}</span>
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" className="navbar__login-btn">
                {t('nav.dashboard')}
              </Link>
            ) : (
              <Link to="/login" className="navbar__login-btn">
                {t('nav.login')}
              </Link>
            )}

            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <nav
        className={`navbar__drawer${mobileOpen ? ' navbar__drawer--open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="navbar__drawer-header">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src="/gavel%20blue%20logo.png" alt="GAVEL Logo" className="navbar__logo-img" />
          </Link>
          <button
            className="navbar__drawer-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Persona Switcher & Language Controls */}
        <div className="navbar__drawer-controls">
          <PersonaSwitcher compact={false} />
          <button
            type="button"
            className="navbar__drawer-lang-btn"
            onClick={toggleLanguage}
          >
            <Globe size={14} />
            <span>{language === 'en' ? 'Switch to 🇳🇬 Naija Pidgin' : 'Switch to 🇬🇧 English'}</span>
          </button>
        </div>

        <div className="navbar__drawer-body">
          <Link
            to="/about"
            className={`navbar__drawer-link${isAboutActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/lookup"
            className={`navbar__drawer-link${isLookupActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.lookup')}
          </Link>
          <Link
            to="/backlog-map"
            className={`navbar__drawer-link${isMapActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.map')}
          </Link>
          <Link
            to="/scorecard"
            className={`navbar__drawer-link${isScorecardActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.transparency')}
          </Link>
          <Link
            to="/register"
            className={`navbar__drawer-link${isProBonoActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.volunteer')}
          </Link>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="navbar__drawer-login"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link
              to="/login"
              className="navbar__drawer-login"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
