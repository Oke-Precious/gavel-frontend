import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar — Public Top Navigation Bar.
 * Links match exact design in attached screenshots:
 * About | Look Up a Case | Transparency | Volunteer | Login
 */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isAboutActive = location.pathname === '/' || location.pathname === '/about';
  const isLookupActive = location.pathname.startsWith('/lookup');
  const isScorecardActive = location.pathname === '/scorecard';
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
              to="/register"
              className={`navbar__link${isProBonoActive ? ' navbar__link--active' : ''}`}
            >
              Volunteer
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="navbar__actions">
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
            to="/register"
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
