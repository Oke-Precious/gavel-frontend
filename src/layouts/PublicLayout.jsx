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
          <span className="public-layout__footer-brand">⚖ GAVEL</span>
          <span className="public-layout__footer-copy">
            A portfolio concept project — not affiliated with any government body.
            All case data is synthetic.
          </span>
          <a href="/style-guide" className="public-layout__footer-link">
            Style Guide
          </a>
        </div>
      </footer>
    </div>
  );
}
