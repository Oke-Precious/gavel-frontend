import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Clock,
  ArrowRight,
  Landmark,
  FileCheck,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle2,
} from 'lucide-react';
import heroScalesImg from '../../assets/images/hero_justice_scales_1790948548975.jpg';
import legalAttorneyImg from '../../assets/images/legal_advocacy_attorney_1790948559893.jpg';
import recordsTransparencyImg from '../../assets/images/civic_records_transparency_1790948570593.jpg';
import './AboutPage.css';

const LIFECYCLE_STAGES = [
  {
    num: '01',
    title: 'Arraignment & Initial Remand',
    agency: 'Nigeria Police Force & Magistrate Courts',
    statute: 'ACJA 2015 § 293(1)',
    duration: 'Maximum 14 Days',
    risk: 'Holding charges filed in courts lacking trial jurisdiction to trigger indefinite detention.',
    accountability: 'GAVEL logs the exact remand order date and starts the 14-day statutory countdown timer.',
  },
  {
    num: '02',
    title: 'Investigation & DPP Advice',
    agency: 'State Ministry of Justice (DPP)',
    statute: 'ACJA 2015 § 295 & § 376',
    duration: 'Maximum 14 Days (Renewable Once)',
    risk: 'Police investigation diaries get lost in transit between police stations and the Ministry of Justice.',
    accountability: 'GAVEL tracks whether prosecution applied for the single allowable extension under Section 295.',
  },
  {
    num: '03',
    title: 'Trial Committal & Bail Review',
    agency: 'High Courts & Defense Bar (NBA)',
    statute: 'ACJA 2015 § 296(4)-(6)',
    duration: 'Mandatory Hearing Notice',
    risk: 'Failure to produce detainees due to custodial transport vehicle breakdowns and logistical failures.',
    accountability: 'Detainees exceeding 28 days are flagged automatically on our public pro-bono defense registry.',
  },
  {
    num: '04',
    title: 'Final Disposition or Discharge',
    agency: 'Presiding Trial Judge',
    statute: 'Constitution § 35(4) & ACJA § 300',
    duration: 'Judicial Determination',
    risk: 'Unresolved strike-outs without formal warrants of release delivered to custodial authorities.',
    accountability: 'Every discharge, bail grant, or conviction order is permanently recorded with full audit metadata.',
  },
];

const STAKEHOLDERS = [
  {
    title: 'Judiciary & Magistracy',
    role: 'Presiding Bench Oversight',
    icon: Landmark,
    description:
      'Magistrates and judges conduct mandatory monthly inspections of detention facilities under Section 34 of the ACJA, reviewing remand warrants and ensuring no citizen languishes on expired orders.',
  },
  {
    title: 'Department of Public Prosecutions',
    role: 'Legal Screening & Formal Charge',
    icon: FileCheck,
    description:
      'The DPP reviews police case diaries to determine if a prima facie case exists. GAVEL eliminates the paperwork void where files spend months without legal advice.',
  },
  {
    title: 'Nigerian Correctional Service',
    role: 'Custodial Census & Escort',
    icon: ShieldCheck,
    description:
      'Under the NCoS Act 2019, superintendents must notify courts when custodial centers exceed capacity. GAVEL reconciles prison rosters with court hearing dates in real time.',
  },
  {
    title: 'Pro-Bono Legal Defense Bar',
    role: 'Constitutional Representation',
    icon: Scale,
    description:
      'Accredited Nigerian Bar Association attorneys review our unrepresented remand list to claim cases, draft fundamental rights enforcement suits, and secure bail for indigent defendants.',
  },
];

export default function AboutPage() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = LIFECYCLE_STAGES[activeStageIndex];

  return (
    <div className="about-page">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="about-hero-section">
        <div className="about-hero-backdrop-wrapper">
          <img
            src={heroScalesImg}
            alt="Courthouse bench and scales of justice"
            className="about-hero-backdrop-img"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="about-hero-backdrop-scrim" />
        </div>

        <div className="container about-hero-content">
          <div className="about-hero-kicker">
            <span>Constitutional Mandate</span>
            <span aria-hidden="true" className="kicker-sep">·</span>
            <span>Section 35(4) 1999 Constitution of Nigeria</span>
          </div>

          <h1 className="about-hero-title">
            Restoring speed, transparency, and dignity to Nigerian criminal justice.
          </h1>

          <p className="about-hero-lead">
            GAVEL is a civic judicial accountability platform built to dismantle pre-trial
            detention backlogs across Nigeria. By tracking cases through a unified four-stage
            lifecycle and preserving defendant privacy through cryptographic Hash IDs, GAVEL ensures
            no awaiting-trial detainee is forgotten behind bars.
          </p>

          <div className="about-hero-actions">
            <Link to="/lookup" className="about-btn-primary">
              <Search size={18} />
              <span>Look Up a Case</span>
            </Link>
            <Link to="/scorecard" className="about-btn-secondary">
              <span>View Transparency Scorecard</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CONSTITUTIONAL & STATUTORY GROUNDING                      */}
      {/* ============================================================ */}
      <section className="about-statute-section container">
        <div className="about-section-header">
          <span className="about-section-eyebrow">Legal Framework</span>
          <h2 className="about-section-title">Rooted in Nigerian Constitutional Law</h2>
          <p className="about-section-desc">
            GAVEL does not invent new rules. It operationalizes statutory requirements that are already enshrined in Nigerian law but frequently violated due to lack of transparency.
          </p>
        </div>

        <div className="statute-cards-grid">
          <div className="statute-card">
            <div className="statute-card__citation">Section 35(4)</div>
            <h3 className="statute-card__title">1999 Constitution (as amended)</h3>
            <p className="statute-card__text">
              Guarantees every arrested or detained suspect the right to be brought before a court of law within a reasonable time — specifically defined as one to two days. Prolonged detention without formal arraignment is unconstitutional.
            </p>
          </div>

          <div className="statute-card statute-card--highlight">
            <div className="statute-card__citation">Sections 293 – 296</div>
            <h3 className="statute-card__title">Administration of Criminal Justice Act 2015</h3>
            <p className="statute-card__text">
              Establishes a strict 14-day initial remand warrant, renewable only once for an additional 14 days upon good cause. Detention past 28 days without trial gives the accused an immediate right to apply for unconditional discharge or court bail.
            </p>
          </div>

          <div className="statute-card">
            <div className="statute-card__citation">Section 12(4)-(8)</div>
            <h3 className="statute-card__title">Nigerian Correctional Service Act 2019</h3>
            <p className="statute-card__text">
              Mandates State Comptrollers of Corrections to notify the Chief Judge, Attorney-General, and Criminal Justice Monitoring Committee whenever a custodial center exceeds its lawful capacity, triggering mandatory decongestion audits.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE 4-STAGE LIFECYCLE AUDIT                       */}
      {/* ============================================================ */}
      <section className="about-lifecycle-section">
        <div className="container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">Procedural Due Process</span>
            <h2 className="about-section-title">The Four-Stage Criminal Justice Pipeline</h2>
            <p className="about-section-desc">
              GAVEL standardizes every criminal matter across all 36 States and the FCT into four verifiable milestones. Click through each stage to examine statutory timelines and delay factors.
            </p>
          </div>

          <div className="lifecycle-stepper-nav" role="tablist">
            {LIFECYCLE_STAGES.map((s, idx) => (
              <button
                key={s.num}
                type="button"
                role="tab"
                aria-selected={activeStageIndex === idx}
                onClick={() => setActiveStageIndex(idx)}
                className={`lifecycle-tab-btn ${activeStageIndex === idx ? 'lifecycle-tab-btn--active' : ''}`}
              >
                <span className="lifecycle-tab-num">{s.num}</span>
                <span className="lifecycle-tab-title">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Stage Detailed Breakdown */}
          <div className="lifecycle-stage-card">
            <div className="lifecycle-stage-card__header">
              <div className="stage-header-left">
                <span className="stage-header-num">{activeStage.num}</span>
                <div>
                  <h3 className="stage-header-title">{activeStage.title}</h3>
                  <div className="stage-header-meta">
                    <span>{activeStage.agency}</span>
                    <span aria-hidden="true">·</span>
                    <span className="stage-statute-pill">{activeStage.statute}</span>
                  </div>
                </div>
              </div>
              <div className="stage-header-duration">
                <Clock size={16} />
                <span>{activeStage.duration}</span>
              </div>
            </div>

            <div className="lifecycle-stage-card__body">
              <div className="stage-card-column stage-card-column--risk">
                <div className="stage-column-title">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <span>The Systemic Bottleneck</span>
                </div>
                <p className="stage-column-text">{activeStage.risk}</p>
              </div>

              <div className="stage-card-column stage-card-column--solution">
                <div className="stage-column-title">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>How GAVEL Enforces Accountability</span>
                </div>
                <p className="stage-column-text">{activeStage.accountability}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. PRIVACY ARCHITECTURE — HASH IDS                           */}
      {/* ============================================================ */}
      <section className="about-privacy-section container">
        <div className="privacy-showcase-grid">
          <div className="privacy-showcase-text">
            <div className="about-section-eyebrow">Architectural Privacy</div>
            <h2 className="privacy-showcase-title">Why We Never Publish Names</h2>
            <p className="privacy-showcase-lead">
              Awaiting-trial detainees are legally innocent. Publishing their full names, home addresses, or photos on public dashboards creates permanent digital stigma and ruins reputations for people who may ultimately be acquitted or discharged.
            </p>
            <p className="privacy-showcase-sub">
              GAVEL solves this dilemma through <strong>Cryptographic Case Hash IDs</strong> (e.g. <code>GAV-26-AD447B</code>). A Hash ID allows detainees, relatives, attorneys, and court monitors to look up remand status, statutory expiration clocks, and trial dates without exposing the individual's personal identity to the open web.
            </p>
            <div className="privacy-guarantees">
              <div className="privacy-guarantee-item">
                <Lock size={18} className="text-blue-500" />
                <span>Zero Public Identifiers (No Names, Photos, or Residential Addresses)</span>
              </div>
              <div className="privacy-guarantee-item">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>100% Procedural Transparency (Court, Stage, Detention Clock & Reason for Stall)</span>
              </div>
            </div>
          </div>

          <div className="privacy-showcase-visual">
            <img
              src={recordsTransparencyImg}
              alt="Cryptographic Case Records Ledger"
              className="privacy-visual-img"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="privacy-visual-card">
              <div className="visual-card-badge">PUBLIC LOOKUP GUARANTEE</div>
              <div className="visual-card-row">
                <span className="visual-card-key">Auditable by Public:</span>
                <span className="visual-card-val text-emerald-400">Court Bench, Stage, Remand Clock</span>
              </div>
              <div className="visual-card-row">
                <span className="visual-card-key">Confidential to Court:</span>
                <span className="visual-card-val text-slate-300">Identity Particulars & Family Details</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INTER-AGENCY STAKEHOLDERS                                 */}
      {/* ============================================================ */}
      <section className="about-stakeholders-section container">
        <div className="about-section-header">
          <span className="about-section-eyebrow">Institutional Ecosystem</span>
          <h2 className="about-section-title">Coordinating Nigeria's Justice Sector</h2>
          <p className="about-section-desc">
            Pre-trial delays occur at the seams between independent agencies. GAVEL creates a shared operational view that connects judicial benches, custodial centers, and defense attorneys.
          </p>
        </div>

        <div className="stakeholders-grid">
          {STAKEHOLDERS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="stakeholder-card">
                <div className="stakeholder-icon-box">
                  <Icon size={24} />
                </div>
                <div className="stakeholder-role">{s.role}</div>
                <h3 className="stakeholder-title">{s.title}</h3>
                <p className="stakeholder-desc">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. ADVOCACY & PRO BONO MOBILIZATION                          */}
      {/* ============================================================ */}
      <section className="about-advocacy-section">
        <div className="container">
          <div className="advocacy-card">
            <div className="advocacy-grid">
              <div className="advocacy-image-wrap">
                <img
                  src={legalAttorneyImg}
                  alt="Nigerian human rights defense attorney"
                  className="advocacy-img"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="advocacy-content">
                <span className="advocacy-eyebrow">Pro-Bono Legal Defense</span>
                <h2 className="advocacy-title">Empowering the Nigerian Bar to intervene early</h2>
                <p className="advocacy-lead">
                  More than 70% of detainees held past the statutory remand limit lack legal representation. Without an advocate to file a motion on notice or writ of habeas corpus, cases remain buried in court dockets.
                </p>
                <p className="advocacy-sub">
                  GAVEL’s Pro-Bono portal empowers certified lawyers to discover cases where custody has exceeded 28 days, claim representation, and file expedited bail applications under ACJA Section 296.
                </p>
                <div className="advocacy-actions">
                  <Link to="/register" className="advocacy-btn-primary">
                    <span>Register as Pro-Bono Counsel</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/scorecard" className="advocacy-btn-secondary">
                    <span>See Systemic Scorecard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
