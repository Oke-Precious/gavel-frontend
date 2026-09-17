import React from 'react';
import { EyeOff, FileSearch, History, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Timeline from '../../components/Timeline.jsx';
import './AboutPage.css';

const STEPS = [
  {
    Icon: FileSearch,
    title: 'Look up a case',
    text: 'Search with a Case Hash ID. Names and personal details are never exposed publicly.',
  },
  {
    Icon: Scale,
    title: 'See where it is stuck',
    text: 'Follow the four-stage lifecycle and understand which procedural delay is holding progress back.',
  },
  {
    Icon: History,
    title: 'Track accountability',
    text: 'Every officer update is timestamped so case movement remains visible and auditable.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-page__hero">
        <div className="container about-page__hero-inner">
          <span className="about-page__eyebrow">ABOUT GAVEL</span>
          <h1>How GAVEL Works</h1>
          <p>
            GAVEL is a concept platform for tracking awaiting-trial cases across Nigeria while protecting the identity and dignity of every person represented.
          </p>
        </div>
      </section>

      <div className="container about-page__content">
        <section aria-labelledby="lifecycle-heading">
          <div className="about-page__section-heading">
            <h2 id="lifecycle-heading">One shared case lifecycle</h2>
            <p>Each case moves through the same four stages, making delays easier to identify across agencies.</p>
          </div>
          <Card padding="lg">
            <Timeline currentStageIndex={2} />
          </Card>
        </section>

        <section className="about-page__steps" aria-label="How GAVEL supports accountability">
          {STEPS.map(({ Icon, title, text }) => (
            <Card key={title} padding="lg" hoverable>
              <Icon className="about-page__step-icon" size={24} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </Card>
          ))}
        </section>

        <section aria-labelledby="why-heading">
          <Card padding="lg" className="about-page__why-card">
            <div>
              <h2 id="why-heading">Why This Matters</h2>
              <p>
                64% of Nigeria's prison population is awaiting trial, some for over a decade, against a 28-day legal limit. Missing files, absent representation, and repeated adjournments can keep people detained without conviction for years.
              </p>
            </div>
            <div className="about-page__privacy-note">
              <EyeOff size={24} aria-hidden="true" />
              <p>Public access is privacy-first: cases are found by Case Hash ID, never by a person's name.</p>
            </div>
          </Card>
        </section>

        <div className="about-page__cta">
          <Link to="/lookup">Look Up a Case</Link>
        </div>
      </div>
    </div>
  );
}
