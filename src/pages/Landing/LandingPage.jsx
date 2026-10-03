import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  ArrowRight,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  ExternalLink,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';
import { validateCaseHashId } from '../../utils/validators.js';
import { useToast } from '../../context/ToastContext.jsx';
import heroScalesImg from '../../assets/images/hero_justice_scales_1790948548975.jpg';
import legalAttorneyImg from '../../assets/images/legal_advocacy_attorney_1790948559893.jpg';
import recordsTransparencyImg from '../../assets/images/civic_records_transparency_1790948570593.jpg';
import './LandingPage.css';

const NigeriaMap = React.lazy(() => import('../../components/NigeriaMap/NigeriaMap.jsx'));

// Featured demo cases from live database
const DEMO_CASES = [
  {
    id: 'GAV-26-AD447B',
    title: 'Civil Liberties Defense vs. Custodial Service',
    court: 'Ikeja High Court 3',
    stage: 'Pre-Trial',
    daysInDetention: 326,
    status: 'Critical Overdue',
    statusType: 'critical',
    category: 'Human Rights Petition',
    proBono: true,
    summary: 'Awaiting formal hearing past 28-day ACJA statutory limit without trial commencement.',
  },
  {
    id: 'GAV-26-100697',
    title: 'State vs. Arraigned Detainee (Theft)',
    court: 'Ikeja Magistrate Court 4',
    stage: 'Pre-Trial',
    daysInDetention: 65,
    status: 'Remand Exceeded',
    statusType: 'warning',
    category: 'Magistrate Remand',
    proBono: true,
    summary: 'Initial 14-day police remand expired; stalled awaiting Department of Public Prosecutions (DPP) legal advice.',
  },
  {
    id: 'GAV-26-3EF5FB',
    title: 'State vs. Federal Housing Commission',
    court: 'Lagos High Court 1',
    stage: 'Trial',
    daysInDetention: 42,
    status: 'Active Hearing',
    statusType: 'active',
    category: 'Public Litigation',
    proBono: false,
    summary: 'Trial underway with defense and state counsel presenting witness testimonies.',
  },
];

// Interactive state backlog data
const REGIONAL_STATS = {
  Lagos: {
    state: 'Lagos State',
    detainees: '8,420',
    percentAwaiting: '72%',
    avgDays: '412 days',
    primaryBottleneck: 'DPP Legal Advice & Court Production',
    courtsCount: '48 High & Magistrate Courts',
  },
  FCT: {
    state: 'Federal Capital Territory (Abuja)',
    detainees: '2,980',
    percentAwaiting: '58%',
    avgDays: '265 days',
    primaryBottleneck: 'Police Investigation Files & Arraignments',
    courtsCount: '32 High & Magistrate Courts',
  },
  Rivers: {
    state: 'Rivers State (Port Harcourt)',
    detainees: '4,150',
    percentAwaiting: '69%',
    avgDays: '380 days',
    primaryBottleneck: 'Logistics & Correctional Vehicle Escort',
    courtsCount: '29 Active Judicial Divisions',
  },
  Kano: {
    state: 'Kano State',
    detainees: '3,740',
    percentAwaiting: '63%',
    avgDays: '290 days',
    primaryBottleneck: 'Legal Representation & Legal Aid Availability',
    courtsCount: '36 Court Benches',
  },
  Kaduna: {
    state: 'Kaduna State',
    detainees: '2,610',
    percentAwaiting: '61%',
    avgDays: '315 days',
    primaryBottleneck: 'Witness Non-Appearance & Adjournments',
    courtsCount: '24 Court Benches',
  },
  Oyo: {
    state: 'Oyo State (Ibadan)',
    detainees: '2,890',
    percentAwaiting: '59%',
    avgDays: '280 days',
    primaryBottleneck: 'Case Docketing & File Routing',
    courtsCount: '28 Court Benches',
  },
  Enugu: {
    state: 'Enugu State',
    detainees: '1,940',
    percentAwaiting: '54%',
    avgDays: '245 days',
    primaryBottleneck: 'Custodial Transport & Judicial Vacancies',
    courtsCount: '22 Court Benches',
  },
};

// FAQ data
const FAQ_ITEMS = [
  {
    q: 'Why does GAVEL track by Case Hash ID instead of names?',
    a: 'Under Nigerian law and international human rights conventions, accused persons are presumed innocent until proven guilty. Tracking by cryptographic Case Hash ID (e.g., GAV-26-AD447B) protects defendants and their families from public stigma while providing complete public transparency over judicial delays.',
  },
  {
    q: 'What is the 28-day remand limit under the ACJA 2015?',
    a: 'Sections 293–296 of the Administration of Criminal Justice Act (ACJA) 2015 provide that a magistrate may remand a suspect in custody for a maximum of 14 days initially. This order can be renewed only once for another 14 days upon good cause. Any detention beyond 28 days without formal trial or bail hearing is a statutory breach.',
  },
  {
    q: 'How do certified lawyers claim pro-bono cases?',
    a: 'Qualified attorneys registered with the Nigerian Bar Association (NBA) can access the Pro-Bono portal to review detainees held beyond statutory limits who lack legal defense. Attorneys can claim representation directly through the platform and file expedited bail applications.',
  },
  {
    q: 'Can judicial registrars and clerks import court records?',
    a: 'Yes. Designated court registrars and custodial officers have authenticated portal access to record remand warrants, update case lifecycle stages, and bulk-import dockets via verified CSV sheets with full cryptographic audit logging.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fast search state
  const [searchInput, setSearchInput] = useState('');

  // Active demo case previewer
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const activeCase = DEMO_CASES[activeCaseIndex];
  const [copiedId, setCopiedId] = useState(false);

  // Remand compliance calculator
  const [detentionDays, setDetentionDays] = useState(65);

  // Selected state for national picture
  const [selectedState, setSelectedState] = useState('Lagos');

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(0);

  // Search handler
  const handleFastSearch = (e) => {
    e.preventDefault();
    const cleanId = searchInput.trim().toUpperCase();
    if (!cleanId) {
      toast.warning('Please enter a Case Hash ID.');
      return;
    }
    const error = validateCaseHashId(cleanId);
    if (error) {
      toast.warning(error);
      return;
    }
    navigate(`/lookup/${encodeURIComponent(cleanId)}`);
  };

  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    toast.success(`Copied ${id} to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Remand calculator legal determination
  const calculateRemandStatus = (days) => {
    if (days <= 14) {
      return {
        tier: 'safe',
        badge: 'Within Initial Remand (ACJA § 293)',
        verdict: 'Lawful initial 14-day police remand warrant.',
        remedy: 'Investigation and formal filing underway. Regular docket check recommended.',
        color: 'emerald',
      };
    } else if (days <= 28) {
      return {
        tier: 'warning',
        badge: 'Extension Window (ACJA § 295)',
        verdict: `${days - 14} days into single allowable 14-day extension.`,
        remedy: 'Prosecution must establish good cause for continued detention or grant administrative bail.',
        color: 'amber',
      };
    } else {
      const overDays = days - 28;
      return {
        tier: 'critical',
        badge: 'Statutory Violation (ACJA § 296)',
        verdict: `${overDays} day${overDays === 1 ? '' : 's'} past the maximum 28-day legal limit.`,
        remedy: 'Accused has immediate right to apply for unconditional release or court bail under ACJA Section 296(4).',
        color: 'rose',
      };
    }
  };

  const remandAnalysis = calculateRemandStatus(detentionDays);

  return (
    <div className="landing-page">
      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH IMAGE BACKDROP & LIVE CASE INSPECTOR    */}
      {/* ============================================================ */}
      <section className="landing-hero-revamp">
        <div className="landing-hero-backdrop-wrapper">
          <img
            src={heroScalesImg}
            alt="Courthouse bench and scales of justice"
            className="landing-hero-backdrop-img"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="landing-hero-backdrop-scrim" />
        </div>

        <div className="container landing-hero-content">
          <div className="landing-hero-grid">
            {/* Left: Mission & Fast Search */}
            <div className="landing-hero__narrative">
              <div className="landing-hero__kicker">
                <span>Federal Republic of Nigeria</span>
                <span aria-hidden="true" className="kicker-separator">·</span>
                <span>ACJA 2015 Compliance System</span>
              </div>

              <h1 className="landing-hero__headline">
                No case should wait past the law.
              </h1>

              <p className="landing-hero__lead">
                GAVEL gives families, defense attorneys, and judicial officers
                real-time oversight of awaiting-trial detentions across Nigeria —
                transparently tracking every procedural delay while safeguarding
                the constitutional privacy of the accused.
              </p>

              {/* Fast Lookup Form */}
              <form onSubmit={handleFastSearch} className="hero-search-box" noValidate>
                <div className="hero-search-input-wrap">
                  <Search size={20} className="hero-search-icon" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Enter Case Hash ID (e.g. GAV-26-AD447B)"
                    className="hero-search-input"
                    aria-label="Enter Case Hash ID"
                  />
                </div>
                <button type="submit" className="hero-search-btn">
                  <span>Track Case</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Quick Sample Selector Links */}
              <div className="hero-sample-prompts">
                <span className="hero-sample-label">Try live case records:</span>
                <div className="hero-sample-chips">
                  {DEMO_CASES.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCaseIndex(idx);
                        setSearchInput(c.id);
                      }}
                      className={`hero-sample-pill ${activeCaseIndex === idx ? 'hero-sample-pill--active' : ''}`}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Case Dossier Previewer */}
            <div className="landing-hero__dossier-col">
              <div className="live-dossier-card">
                <div className="live-dossier-header">
                  <div className="live-dossier-header-top">
                    <span className="live-dossier-eyebrow">Interactive Live Case Dossier</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(activeCase.id)}
                      className="live-dossier-copy-btn"
                      title="Copy Case Hash ID"
                    >
                      {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{activeCase.id}</span>
                    </button>
                  </div>
                  <h2 className="live-dossier-title">{activeCase.title}</h2>
                  <div className="live-dossier-meta-row">
                    <span className="live-dossier-meta-item">
                      <MapPin size={14} />
                      {activeCase.court}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="live-dossier-meta-item">{activeCase.category}</span>
                  </div>
                </div>

                {/* Case Stages Indicator */}
                <div className="live-dossier-pipeline">
                  <div className="pipeline-label-row">
                    <span className="pipeline-label">Procedural Lifecycle</span>
                    <span className="pipeline-current">Current: {activeCase.stage}</span>
                  </div>
                  <div className="pipeline-stepper" role="progressbar" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
                    <div className="pipeline-step pipeline-step--done">
                      <span className="pipeline-dot" />
                      <span className="pipeline-text">Filing</span>
                    </div>
                    <div className="pipeline-step pipeline-step--current">
                      <span className="pipeline-dot" />
                      <span className="pipeline-text">{activeCase.stage}</span>
                    </div>
                    <div className="pipeline-step">
                      <span className="pipeline-dot" />
                      <span className="pipeline-text">Hearing</span>
                    </div>
                    <div className="pipeline-step">
                      <span className="pipeline-dot" />
                      <span className="pipeline-text">Disposition</span>
                    </div>
                  </div>
                </div>

                {/* Remand Clock Status Box */}
                <div className={`live-dossier-status-box live-dossier-status-box--${activeCase.statusType}`}>
                  <div className="status-box-header">
                    <div className="status-box-icon">
                      {activeCase.statusType === 'critical' ? (
                        <AlertTriangle size={18} />
                      ) : activeCase.statusType === 'warning' ? (
                        <Clock size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>
                    <div className="status-box-heading">
                      <div className="status-box-badge-text">{activeCase.status}</div>
                      <div className="status-box-sub">
                        {activeCase.daysInDetention} days in detention · Statutory cap: 28 days
                      </div>
                    </div>
                  </div>
                  <p className="status-box-summary">{activeCase.summary}</p>
                </div>

                {/* Dossier Card Footer Actions */}
                <div className="live-dossier-footer">
                  <Link
                    to={`/lookup/${encodeURIComponent(activeCase.id)}`}
                    className="live-dossier-action-btn"
                  >
                    <span>Inspect Full Case History</span>
                    <ExternalLink size={16} />
                  </Link>

                  <div className="live-dossier-tabs">
                    {DEMO_CASES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setActiveCaseIndex(i);
                          setSearchInput(DEMO_CASES[i].id);
                        }}
                        className={`dossier-dot-btn ${activeCaseIndex === i ? 'dossier-dot-btn--active' : ''}`}
                        aria-label={`View sample case ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. NATIONAL DETENTION QUANTITATIVE METRICS                   */}
      {/* ============================================================ */}
      <section className="landing-metrics-section">
        <div className="container">
          <div className="metrics-header">
            <div className="metrics-eyebrow">Empirical Ground Truth · Nigerian Correctional System</div>
            <h2 className="metrics-headline">The systemic bottleneck in numbers</h2>
          </div>

          <div className="metrics-grid">
            <div className="metric-cell">
              <div className="metric-number tabular-nums">64%</div>
              <div className="metric-title">Awaiting Trial Proportion</div>
              <p className="metric-detail">
                Nearly two-thirds of Nigeria's 81,000+ custodial inmates have never been convicted of a crime.
              </p>
            </div>

            <div className="metric-cell">
              <div className="metric-number tabular-nums">51,955+</div>
              <div className="metric-title">Citizens In Limbo</div>
              <p className="metric-detail">
                Detainees currently held across 244 custodial facilities awaiting police files, DPP advice, or trial dates.
              </p>
            </div>

            <div className="metric-cell metric-cell--accent">
              <div className="metric-number metric-number--red tabular-nums">28 Days</div>
              <div className="metric-title">Statutory Remand Ceiling</div>
              <p className="metric-detail">
                Maximum allowable detention under ACJA 2015 Sections 293–296 before mandatory court bail review.
              </p>
            </div>

            <div className="metric-cell">
              <div className="metric-number tabular-nums">36 + 1</div>
              <div className="metric-title">States & FCT Monitored</div>
              <p className="metric-detail">
                Centralized audit logs aggregating magistrate dockets, High Court registries, and pro-bono claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE ACJA REMAND LEGALITY CALCULATOR                */}
      {/* ============================================================ */}
      <section className="landing-calc-section">
        <div className="container">
          <div className="calc-card">
            <div className="calc-card-grid">
              {/* Left Column: Interactive Controls */}
              <div className="calc-controls-col">
                <div className="calc-kicker">
                  <Sliders size={18} />
                  <span>Interactive Legal Audit Tool</span>
                </div>
                <h2 className="calc-heading">Calculate ACJA 2015 Remand Legality</h2>
                <p className="calc-desc">
                  Under the Administration of Criminal Justice Act (ACJA) 2015, no citizen may be held indefinitely without trial. Adjust the slider to audit detention status under statutory law.
                </p>

                <div className="calc-slider-wrapper">
                  <div className="slider-readout">
                    <span className="slider-label">Detention Duration:</span>
                    <span className="slider-val tabular-nums">{detentionDays} Days</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="365"
                    value={detentionDays}
                    onChange={(e) => setDetentionDays(Number(e.target.value))}
                    className="calc-range-slider"
                    aria-label="Detention duration in days"
                  />

                  {/* Preset quick buttons */}
                  <div className="calc-presets">
                    <span className="presets-caption">Common milestones:</span>
                    {[14, 28, 60, 180, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDetentionDays(d)}
                        className={`preset-chip ${detentionDays === d ? 'preset-chip--active' : ''}`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Legal Readout */}
              <div className="calc-analysis-col">
                <div className={`analysis-box analysis-box--${remandAnalysis.tier}`}>
                  <div className="analysis-tier-badge">
                    <span className="analysis-dot" />
                    <span>{remandAnalysis.badge}</span>
                  </div>

                  <h3 className="analysis-verdict-title">{remandAnalysis.verdict}</h3>

                  <div className="analysis-law-rule">
                    <div className="law-rule-title">Statutory Rule Applied:</div>
                    <p className="law-rule-text">
                      {detentionDays <= 14
                        ? 'ACJA § 293(1): Court may order remand for a period not exceeding 14 days in the first instance.'
                        : detentionDays <= 28
                        ? 'ACJA § 295: On good cause shown, the court may extend remand once for a final period of 14 days.'
                        : 'ACJA § 296(4)-(6): If trial has not commenced after 28 days, the court shall issue hearing notice and must grant bail or unconditional release.'}
                    </p>
                  </div>

                  <div className="analysis-action-box">
                    <div className="action-box-label">Prescribed Remedy:</div>
                    <p className="action-box-text">{remandAnalysis.remedy}</p>
                  </div>

                  <div className="analysis-ctas">
                    <Link to="/pro-bono" className="analysis-btn-primary">
                      <span>Find Pro-Bono Counsel</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link to="/lookup" className="analysis-btn-secondary">
                      <span>Search Case Dossier</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. THREE PILLARS OF GAVEL WITH EDITORIAL IMAGERY             */}
      {/* ============================================================ */}
      <section className="landing-pillars-section container">
        <div className="pillars-header">
          <div className="pillars-eyebrow">Constitutional Due Process & Open Data</div>
          <h2 className="pillars-title">How GAVEL restores accountability</h2>
          <p className="pillars-subtitle">
            Combining cryptographic pseudonymity, automated delay tracking, and direct mobilization of pro-bono defense counsel.
          </p>
        </div>

        <div className="pillars-grid">
          {/* Pillar 1: Cryptographic Privacy with Image */}
          <div className="pillar-card pillar-card--featured">
            <div className="pillar-image-wrap">
              <img
                src={recordsTransparencyImg}
                alt="Judicial case records and digital ledger"
                className="pillar-image"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="pillar-image-scrim" />
              <div className="pillar-badge-overlay">01. Cryptographic Anonymity</div>
            </div>
            <div className="pillar-content">
              <h3 className="pillar-heading">Public Oversight Without Stigmatization</h3>
              <p className="pillar-text">
                Every arraigned detainee receives a secure, irreversible Case Hash ID (e.g. <code>GAV-26-XXXXXX</code>). Anyone can audit remand periods and hearing dates without publishing personal names, preventing permanent reputational harm for individuals who may never be convicted.
              </p>
              <div className="pillar-meta-row">
                <span className="pillar-meta-item">Presumption of Innocence</span>
                <span aria-hidden="true">/</span>
                <span className="pillar-meta-item">Public Transparency</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Forensic Bottleneck Identification */}
          <div className="pillar-card">
            <div className="pillar-icon-header">
              <div className="pillar-icon-box pillar-icon-box--amber">
                <Clock size={24} />
              </div>
              <span className="pillar-number">02. Bottleneck Isolation</span>
            </div>
            <div className="pillar-content">
              <h3 className="pillar-heading">Identify Why Proceedings Have Stalled</h3>
              <p className="pillar-text">
                GAVEL logs the exact procedural impediment delaying the case:
              </p>
              <ul className="pillar-list">
                <li>
                  <strong>Police Case File:</strong> Incomplete investigation files or lost dockets.
                </li>
                <li>
                  <strong>DPP Legal Advice:</strong> Administrative delays in Ministry of Justice counsel issuance.
                </li>
                <li>
                  <strong>Prison Transit Logistics:</strong> Inability of custodial vans to transport detainees to court.
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 3: Pro Bono Defense Mobilization with Image */}
          <div className="pillar-card pillar-card--featured">
            <div className="pillar-image-wrap">
              <img
                src={legalAttorneyImg}
                alt="Nigerian defense attorney in legal library"
                className="pillar-image"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="pillar-image-scrim" />
              <div className="pillar-badge-overlay">03. Defense Mobilization</div>
            </div>
            <div className="pillar-content">
              <h3 className="pillar-heading">Connecting Indigent Detainees to Lawyers</h3>
              <p className="pillar-text">
                Detainees whose remand limits have lapsed without legal representation are automatically highlighted in our Pro-Bono registry. Accredited Nigerian Bar Association attorneys claim these cases to file habeas corpus and bail summons.
              </p>
              <div className="pillar-action-wrap">
                <Link to="/pro-bono" className="pillar-action-link">
                  <span>Explore Pro-Bono Docket</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INTERACTIVE REGIONAL BACKLOG EXPLORER                     */}
      {/* ============================================================ */}
      <section className="landing-map-section container">
        <div className="map-explorer-card">
          <div className="map-explorer-content">
            <div className="map-kicker">Geographic Backlog Distribution</div>
            <h2 className="map-title">Explore detention delays across Nigeria</h2>
            <p className="map-subtitle">
              Backlog concentration varies dramatically between states due to court capacity, custodial transport fleets, and judicial vacancies.
            </p>

            {/* State selection buttons */}
            <div className="state-selector-tabs">
              {Object.keys(REGIONAL_STATS).map((stKey) => (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => setSelectedState(stKey)}
                  className={`state-tab-btn ${selectedState === stKey ? 'state-tab-btn--active' : ''}`}
                >
                  {stKey}
                </button>
              ))}
            </div>

            {/* State statistics card */}
            {(() => {
              const activeStat = REGIONAL_STATS[selectedState] || {
                state: `${selectedState} State`,
                detainees: '1,450',
                percentAwaiting: '54%',
                avgDays: '190 days',
                primaryBottleneck: 'Court Adjournments & File Transit',
                courtsCount: '18 Active Benches',
              };
              return (
                <div className="state-stat-highlight">
                  <div className="state-highlight-header">
                    <span className="state-highlight-name">{activeStat.state}</span>
                    <span className="state-highlight-tag">{activeStat.courtsCount}</span>
                  </div>

                  <div className="state-highlight-grid">
                    <div className="state-stat-item">
                      <div className="state-stat-val tabular-nums">{activeStat.detainees}</div>
                      <div className="state-stat-lbl">Awaiting Trial Inmates</div>
                    </div>
                    <div className="state-stat-item">
                      <div className="state-stat-val tabular-nums">{activeStat.percentAwaiting}</div>
                      <div className="state-stat-lbl">Custodial Share</div>
                    </div>
                    <div className="state-stat-item">
                      <div className="state-stat-val tabular-nums">{activeStat.avgDays}</div>
                      <div className="state-stat-lbl">Average Remand Stay</div>
                    </div>
                  </div>

                  <div className="state-bottleneck-row">
                    <span className="state-bottleneck-title">Dominant Delay Factor:</span>
                    <span className="state-bottleneck-desc">{activeStat.primaryBottleneck}</span>
                  </div>
                </div>
              );
            })()}

            <div className="map-action-wrap">
              <Link to="/backlog-map" className="map-primary-btn">
                <span>Open Full Interactive Choropleth Map</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="map-explorer-visual">
            <React.Suspense fallback={<div className="nigeria-map-skeleton-wrap"><div className="skeleton-radar-pulse" /></div>}>
              <NigeriaMap
                data={{
                  Lagos: { totalCases: 8, alertLevel: 'critical' },
                  Rivers: { totalCases: 5, alertLevel: 'severe' },
                  FCT: { totalCases: 4, alertLevel: 'severe' },
                  Kano: { totalCases: 4, alertLevel: 'warning' },
                  Kaduna: { totalCases: 3, alertLevel: 'warning' },
                  Oyo: { totalCases: 2, alertLevel: 'warning' },
                  Enugu: { totalCases: 2, alertLevel: 'warning' },
                }}
                selectedState={selectedState}
                onSelectState={(stKey) => setSelectedState(stKey)}
                theme="dark"
                compact={false}
                showLabels={true}
                showBeacons={true}
                showCircuits={true}
                allowZoom={false}
              />
            </React.Suspense>
            <div className="map-visual-legend">
              <div className="legend-label">Interactive Sovereign Vector Map (Click any state)</div>
              <div className="legend-scale">
                <span className="legend-step legend-step--low">Compliant</span>
                <span className="legend-step legend-step--mid">Moderate</span>
                <span className="legend-step legend-step--high">Severe Backlog</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. INTERACTIVE CIVIC & LEGAL FAQ                             */}
      {/* ============================================================ */}
      <section className="landing-faq-section container">
        <div className="faq-header">
          <div className="faq-eyebrow">Constitutional Due Process FAQ</div>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Answers for litigants, families, counsel, and civic advocates.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{item.q}</span>
                  <div className="faq-chevron-wrap">
                    <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'faq-chevron--rotated' : ''}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="faq-answer-body">
                    <p className="faq-answer-text">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HIGH-IMPACT CLOSING CALL TO ACTION                        */}
      {/* ============================================================ */}
      <section className="landing-cta-section container">
        <div className="cta-banner-box">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Check a remand status right now.</h2>
            <p className="cta-banner-desc">
              Search by Case Hash ID for an immediate audit of statutory remand dates, current procedural stage, and assigned legal counsel.
            </p>
            <div className="cta-banner-buttons">
              <Link to="/lookup" className="cta-btn-primary">
                <Search size={18} />
                <span>Search Case Hash ID</span>
              </Link>
              <Link to="/login" className="cta-btn-secondary">
                <UserCheck size={18} />
                <span>Judicial Officer Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
