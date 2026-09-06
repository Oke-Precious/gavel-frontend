import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import './PublicLayout.css';

/**
 * PublicLayout — wraps all public-facing pages.
 * Contains the Navbar, main content area, and a minimal footer.
 */
export default function PublicLayout() {
  const [persona, setPersona] = useState('public');

  return (
    <div className="public-layout">
      <Navbar activePersona={persona} onPersonaChange={setPersona} />
      <main className="public-layout__main" id="main-content" tabIndex={-1}>
        <Outlet context={{ persona }} />
      </main>
      <footer className="public-layout__footer">
        <div className="container public-layout__footer-inner">
          <div className="public-layout__footer-top">
            <img src="/gavel%20blue%20logo.png" alt="GAVEL Logo" className="public-layout__footer-brand-img" />
            <div className="public-layout__footer-links">
              <a href="/about" className="public-layout__footer-link">About</a>
              <a href="/privacy" className="public-layout__footer-link">Privacy Policy</a>
              <a href="/terms" className="public-layout__footer-link">Terms of Use</a>
              <a href="/contact" className="public-layout__footer-link">Contact</a>
            </div>
          </div>
          <div className="public-layout__footer-bottom">
            <span className="public-layout__footer-copy">
              © 2026 GAVEL. Tracking justice with transparency. Synthetic data for demonstration purposes. This is a concept platform built with synthetic data for demonstration purposes. It is not connected to any government or NGO system.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
