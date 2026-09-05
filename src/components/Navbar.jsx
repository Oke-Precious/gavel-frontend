import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar — public-facing top navigation bar.
 *
 * @param {string} activePersona — current demo persona ('public'|'legal-aid'|'records'|'admin'|'lawyer')
 * @param {Function} onPersonaChange — callback when persona changes
 */

const PERSONAS = [
  { id: 'public',     label: 'Public Observer' },
  { id: 'legal-aid',  label: 'Legal Aid Officer' },
  { id: 'records',    label: 'Records Officer' },
  { id: 'lawyer',     label: 'Volunteer Lawyer' },
  { id: 'admin',      label: 'Admin' },
];

const NAV_LINKS = [
  { to: '/',          label: 'Case Lookup' },
  { to: '/scorecard', label: 'Transparency' },
];

export default function Navbar({ activePersona = 'public', onPersonaChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const drawerRef = useRef(null);
  const personaRef = useRef(null);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Close persona dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (personaRef.current && !personaRef.current.contains(e.target)) {
        setPersonaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Trap focus in mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const el = drawerRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length) focusables[0].focus();
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setPersonaOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const currentPersona = PERSONAS.find((p) => p.id === activePersona) ?? PERSONAS[0];

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="GAVEL — home">
            <img src="/gavel%20white%20logo.png" alt="GAVEL Logo" className="navbar__logo-img" />
            {/* <span className="navbar__logo-text">GAVEL</span> */}
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right slot — persona switcher + login */}
          <div className="navbar__actions">
            {/* Interactive demo persona switcher */}
            <div className="persona-switcher" ref={personaRef}>
              <button
                className="persona-switcher__trigger"
                onClick={() => setPersonaOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={personaOpen}
                aria-label={`Demo persona: ${currentPersona.label}`}
                id="persona-trigger"
              >
                <span className="persona-switcher__dot" aria-hidden="true" />
                <span className="persona-switcher__label">{currentPersona.label}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={`persona-switcher__chevron${personaOpen ? ' persona-switcher__chevron--open' : ''}`}
                />
              </button>

              {personaOpen && (
                <ul
                  className="persona-switcher__dropdown"
                  role="listbox"
                  aria-labelledby="persona-trigger"
                >
                  {PERSONAS.map((p) => (
                    <li
                      key={p.id}
                      role="option"
                      aria-selected={p.id === activePersona}
                      className={`persona-switcher__option${p.id === activePersona ? ' persona-switcher__option--active' : ''}`}
                      onClick={() => {
                        onPersonaChange?.(p.id);
                        setPersonaOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onPersonaChange?.(p.id);
                          setPersonaOpen(false);
                        }
                      }}
                      tabIndex={0}
                    >
                      {p.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link to="/login" className="navbar__login-btn">
              Sign in
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        id="mobile-drawer"
        ref={drawerRef}
        className={`navbar__drawer${mobileOpen ? ' navbar__drawer--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="navbar__drawer-header">
          <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
            <img src="/gavel%20white%20logo.png" alt="GAVEL Logo" className="navbar__logo-img" />
            <span className="navbar__logo-text">GAVEL</span>
          </Link>
          <button
            className="navbar__drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="navbar__drawer-body">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `navbar__drawer-link${isActive ? ' navbar__drawer-link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              tabIndex={mobileOpen ? 0 : -1}
            >
              {link.label}
            </NavLink>
          ))}

          <hr className="navbar__drawer-divider" />

          <p className="navbar__drawer-section-label">Demo Persona</p>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              className={`navbar__drawer-persona${p.id === activePersona ? ' navbar__drawer-persona--active' : ''}`}
              onClick={() => {
                onPersonaChange?.(p.id);
                setMobileOpen(false);
              }}
              tabIndex={mobileOpen ? 0 : -1}
            >
              <span className="persona-switcher__dot" aria-hidden="true" />
              {p.label}
            </button>
          ))}

          <Link
            to="/login"
            className="navbar__drawer-login"
            onClick={() => setMobileOpen(false)}
            tabIndex={mobileOpen ? 0 : -1}
          >
            Sign in
          </Link>
        </div>
      </nav>
    </>
  );
}
