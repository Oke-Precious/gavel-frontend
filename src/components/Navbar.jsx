import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar — Public Top Navigation Bar.
 * Links match exact design in attached screenshots:
 * About | Look Up a Case | Transparency | Volunteer | Login
 */

const PERSONAS = [
  { id: 'public',     label: 'Public Observer' },
  { id: 'legal-aid',  label: 'Legal Aid Officer' },
  { id: 'records',    label: 'Records Officer' },
  { id: 'lawyer',     label: 'Volunteer Lawyer' },
  { id: 'admin',      label: 'Admin' },
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

  const currentPersona = PERSONAS.find((p) => p.id === activePersona) ?? PERSONAS[0];

  const isAboutActive = location.pathname === '/about';
  const isLookupActive = location.pathname.startsWith('/lookup');
  const isScorecardActive = location.pathname === '/scorecard';
  const isProBonoActive = location.pathname === '/pro-bono';

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
              About
            </Link>

            <Link
              to="/lookup"
              className={`navbar__link${isLookupActive ? ' navbar__link--active' : ''}`}
            >
              Look Up a Case
            </Link>

            <Link
              to="/scorecard"
              className={`navbar__link${isScorecardActive ? ' navbar__link--active' : ''}`}
            >
              Transparency
            </Link>

            <Link
              to="/pro-bono"
              className={`navbar__link${isProBonoActive ? ' navbar__link--active' : ''}`}
            >
              Volunteer
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="navbar__actions">
            {/* Persona Switcher */}
            <div className="persona-switcher" ref={personaRef}>
              <button
                className="persona-switcher__trigger"
                onClick={() => setPersonaOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={personaOpen}
                aria-label={`Demo persona: ${currentPersona.label}`}
              >
                <span className="persona-switcher__dot" aria-hidden="true" />
                <span className="persona-switcher__label">{currentPersona.label}</span>
                <ChevronDown size={14} />
              </button>

              {personaOpen && (
                <ul className="persona-switcher__dropdown" role="listbox">
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
                    >
                      {p.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link to="/login" className="navbar__login-btn">
              Login
            </Link>

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

        <div className="navbar__drawer-body">
          <Link
            to="/about"
            className={`navbar__drawer-link${isAboutActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            About
          </Link>
          <Link
            to="/lookup"
            className={`navbar__drawer-link${isLookupActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Look Up a Case
          </Link>
          <Link
            to="/scorecard"
            className={`navbar__drawer-link${isScorecardActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Transparency
          </Link>
          <Link
            to="/pro-bono"
            className={`navbar__drawer-link${isProBonoActive ? ' navbar__drawer-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Volunteer
          </Link>

          <Link
            to="/login"
            className="navbar__drawer-login"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </div>
      </nav>
    </>
  );
}
