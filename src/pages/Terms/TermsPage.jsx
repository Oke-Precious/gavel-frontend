import React from 'react';
import Card from '../../components/Card.jsx';
import '../Privacy/PrivacyPage.css';

const SECTIONS = [
  {
    id: 'purpose',
    title: 'Purpose of This Platform',
  },
  {
    id: 'synthetic-data',
    title: 'Synthetic Data Disclosure',
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
  },
];

export default function TermsPage() {
  return (
    <main className="privacy-page">
      <div className="container privacy-page__inner">
        <header className="privacy-page__header">
          <p className="privacy-page__eyebrow">Terms of Use</p>
          <h1>Use GAVEL with care and respect.</h1>
          <p>
            GAVEL exists to make awaiting-trial detention delays easier to see and
            act on while preserving the privacy and dignity of the people represented
            by case records.
          </p>
        </header>

        <div className="privacy-page__layout">
          <aside className="privacy-page__toc" aria-label="Terms of use sections">
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
            <section id="purpose" tabIndex={-1}>
              <h2>Purpose of This Platform</h2>
              <p>
                GAVEL is a portfolio concept platform for tracking awaiting-trial
                detention, case progress, and justice-system backlog patterns. It is
                designed to show how legal aid officers, records officers, admins,
                volunteer lawyers, and public observers could understand case delay
                without exposing unnecessary personal information.
              </p>
              <p>
                The platform is not legal advice, a government service, or an official
                court record. Any workflow shown here should be understood as a product
                demonstration of how case-tracking transparency could work.
              </p>
            </section>

            <section id="synthetic-data" tabIndex={-1}>
              <h2>Synthetic Data Disclosure</h2>
              <p>
                GAVEL uses synthetic data for demonstration purposes. Names, case
                details, courts, counts, alerts, and statuses shown in the application
                are examples created to demonstrate the product experience.
              </p>
              <p>
                GAVEL is not connected to any government, court, prison, police, or NGO
                system. Public case pages and dashboards are built to demonstrate
                privacy-preserving workflows, not to publish live institutional data.
              </p>
            </section>

            <section id="acceptable-use" tabIndex={-1}>
              <h2>Acceptable Use</h2>
              <p>
                Use GAVEL only for respectful evaluation, demonstration, and learning.
                Do not use the platform to identify, target, harass, impersonate, or
                misrepresent any person, institution, lawyer, detainee, or public
                official.
              </p>
              <p>
                Do not attempt to bypass authentication, access restricted dashboards,
                scrape data, upload harmful files, interfere with service availability,
                or treat synthetic demonstration content as verified real-world
                evidence.
              </p>
            </section>
          </Card>
        </div>
      </div>
    </main>
  );
}
