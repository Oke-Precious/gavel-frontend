import React from 'react';
import Card from '../../components/Card.jsx';
import './PrivacyPage.css';

const SECTIONS = [
  {
    id: 'what-we-collect',
    title: 'What We Collect',
  },
  {
    id: 'what-we-never-collect',
    title: 'What We Never Collect',
  },
  {
    id: 'case-hash-ids',
    title: 'Case Hash IDs vs. Personal Data',
  },
  {
    id: 'contact',
    title: 'Contact',
  },
];

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <div className="container privacy-page__inner">
        <header className="privacy-page__header">
          <p className="privacy-page__eyebrow">Privacy Policy</p>
          <h1>Privacy and dignity come first.</h1>
          <p>
            GAVEL is designed to make delayed justice visible without exposing the
            people most affected by it. Public transparency must never become public
            identification.
          </p>
        </header>

        <div className="privacy-page__layout">
          <aside className="privacy-page__toc" aria-label="Privacy policy sections">
            <Card padding="sm" className="privacy-page__toc-card">
              <h2>Table of Contents</h2>
              <nav aria-label="Table of contents">
                {SECTIONS.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </Card>
          </aside>

          <Card padding="lg" className="privacy-page__content">
            <section id="what-we-collect" tabIndex={-1}>
              <h2>What We Collect</h2>
              <p>
                GAVEL collects only the information needed to support case tracking,
                account access, and status-change notifications. For registered users,
                this may include account details such as name, email address, role,
                assigned court or state, and activity needed for audit history.
              </p>
              <p>
                For public case watchers, GAVEL only needs an email address and the
                Case Hash ID being watched, so the system can send an alert if that
                case changes status.
              </p>
            </section>

            <section id="what-we-never-collect" tabIndex={-1}>
              <h2>What We Never Collect</h2>
              <p>
                Public pages do not ask for or display private names, personal
                addresses, family details, sensitive identity numbers, or other
                identifying information about detained persons. GAVEL does not use
                public transparency as a reason to expose people to stigma, retaliation,
                or unnecessary public attention.
              </p>
              <p>
                The public experience is intentionally limited. It is built to show
                case status, delay, court context, and broad justice-system patterns,
                not to publish personal histories.
              </p>
            </section>

            <section id="case-hash-ids" tabIndex={-1}>
              <h2>Case Hash IDs vs. Personal Data</h2>
              <p>
                A Case Hash ID is a privacy-preserving reference that lets someone
                look up a case without using names or exposing the underlying database
                record identifier. It helps public observers track progress while
                keeping personal data out of public URLs and public-facing screens.
              </p>
              <p>
                Internal users may work with fuller case records according to their
                role, but public users only see sanitized case details. This separation
                protects dignity while still making prolonged awaiting-trial detention
                visible.
              </p>
            </section>

            <section id="contact" tabIndex={-1}>
              <h2>Contact</h2>
              <p>
                For questions about privacy, public case visibility, or how case
                watch alerts work, contact the GAVEL project team through the public
                contact channel listed on this site.
              </p>
              <p>
                GAVEL is a concept platform built with synthetic data for demonstration
                purposes. It is not connected to any government or NGO system.
              </p>
            </section>
          </Card>
        </div>
      </div>
    </main>
  );
}
