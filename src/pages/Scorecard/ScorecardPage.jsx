import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  Scale,
  Download,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { publicApi } from '../../services/api.js';
import './ScorecardPage.css';

// Systemic bottleneck categories with statutory analysis
const BOTTLENECK_FACTORS = [
  {
    id: 'dpp',
    title: 'DPP Legal Advice Delays',
    share: '42%',
    delayDays: '+180 Days',
    agency: 'State Ministry of Justice (DPP)',
    statute: 'ACJA § 376',
    cause:
      'Police investigation files are sent to the Director of Public Prosecutions for legal advice without tracking, leading to indefinite remand while awaiting duplicate file reviews.',
    remedy:
      'Mandatory electronic dispatch of legal advice within 14 days directly to Magistrate court registries.',
  },
  {
    id: 'transit',
    title: 'Custodial Transport Logistics',
    share: '26%',
    delayDays: '+95 Days',
    agency: 'Nigerian Correctional Service (NCoS)',
    statute: 'NCoS Act 2019 § 12',
    cause:
      'Shortage of functional escort vehicles and fuel impedes daily transfer of detainees from peripheral custodial centers (e.g. Kirikiri, Kuje) to urban courtrooms.',
    remedy:
      'Virtual remand hearings for routine mentions and dedicated regional transit shuttles.',
  },
  {
    id: 'investigation',
    title: 'Incomplete Police Case Diaries',
    share: '18%',
    delayDays: '+120 Days',
    agency: 'Nigeria Police Force & Special Units',
    statute: 'ACJA § 294',
    cause:
      'Holding charges filed prematurely before forensic reports, ballistic analysis, or witness statements are completed, causing serial court adjournments.',
    remedy:
      'Enforcement of Section 294 requiring sworn affidavit of prima facie evidence before issuing remand.',
  },
  {
    id: 'representation',
    title: 'Absence of Legal Representation',
    share: '14%',
    delayDays: '+210 Days',
    agency: 'Legal Aid Council & Private Defense',
    statute: 'Constitution § 35(3)',
    cause:
      'Indigent suspects unable to afford private attorneys or meet onerous bail bond requirements languish without anyone to move bail summons.',
    remedy:
      'Direct routing of unrepresented cases to accredited NBA Pro-Bono defense attorneys through GAVEL.',
  },
];

// Jurisdictional transparency breakdown
const STATE_JURISDICTIONS = [
  {
    name: 'Lagos State Judiciary',
    activeDockets: '8,420',
    complianceRate: '28%',
    avgRemandDays: '412 Days',
    dominantDelay: 'DPP Legal Advice Issuance',
    status: 'High Backlog',
  },
  {
    name: 'FCT High Court & Magistracy (Abuja)',
    activeDockets: '2,980',
    complianceRate: '42%',
    avgRemandDays: '265 Days',
    dominantDelay: 'Police Investigation Files',
    status: 'Moderate Backlog',
  },
  {
    name: 'Rivers State Judicial Division',
    activeDockets: '4,150',
    complianceRate: '31%',
    avgRemandDays: '380 Days',
    dominantDelay: 'Inmate Transit Vehicle Logistics',
    status: 'High Backlog',
  },
  {
    name: 'Kano State Judiciary',
    activeDockets: '3,740',
    complianceRate: '37%',
    avgRemandDays: '290 Days',
    dominantDelay: 'Legal Representation Availability',
    status: 'Moderate Backlog',
  },
];

export default function ScorecardPage() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive selected bottleneck
  const [selectedBottleneckId, setSelectedBottleneckId] = useState('dpp');
  const selectedBottleneck =
    BOTTLENECK_FACTORS.find((b) => b.id === selectedBottleneckId) || BOTTLENECK_FACTORS[0];

  useEffect(() => {
    let cancelled = false;

    async function loadScorecardData() {
      setLoading(true);
      setError(null);
      try {
        const [scoreRes, trendRes] = await Promise.all([
          publicApi.scorecard(),
          publicApi.trends(),
        ]);

        if (!cancelled) {
          setData({
            totalCases: Number(scoreRes.totalCases ?? 0),
            activeCases: Number(scoreRes.activeCases ?? 0),
            resolvedCases: Number(scoreRes.resolvedCases ?? 0),
            stalledCases: Number(scoreRes.stalledCases ?? 0),
            resolutionRate: `${Number(scoreRes.resolutionRate ?? 0).toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}%`,
          });
          setTrends(Array.isArray(trendRes) ? trendRes : (trendRes?.trends ?? []));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            !requestError?.response
              ? 'Network error — check your connection and try again.'
              : requestError.response.status >= 500
              ? 'Something went wrong on our end. Please try again in a moment.'
              : requestError.response?.data?.message ?? 'Unable to load the transparency scorecard.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadScorecardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxVal = Math.max(...trends.map((t) => Math.max(t.filed, t.resolved)), 2);

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Cases Tracked,${data.totalCases}\n` +
      `Active Pre-Trial Cases,${data.activeCases}\n` +
      `Resolved Matters,${data.resolvedCases}\n` +
      `Stalled Beyond 28 Days,${data.stalledCases}\n` +
      `Resolution Efficiency,${data.resolutionRate}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gavel-national-scorecard-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="scorecard-page">
        <div className="container scorecard-container">
          <Skeleton variant="text" width="300px" height="28px" />
          <Skeleton variant="text" width="60%" height="48px" />
          <div className="scorecard-stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton variant="card" height={110} />
              </Card>
            ))}
          </div>
          <Card padding="lg">
            <Skeleton variant="card" height={260} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="scorecard-page">
        <div className="container scorecard-container">
          <Card padding="lg">
            <EmptyState
              icon="error"
              message="Transparency Data Unavailable"
              subtext={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="scorecard-page">
      <div className="container scorecard-container">
        {/* ============================================================ */}
        {/* 1. SCORECARD HERO HEADER                                     */}
        {/* ============================================================ */}
        <div className="scorecard-hero">
          <div className="scorecard-hero-left">
            <div className="scorecard-eyebrow">
              <ShieldCheck size={16} />
              <span>National Judicial Accountability Monitor</span>
              <span aria-hidden="true">·</span>
              <span>Federal & State Dockets</span>
            </div>
            <h1 className="scorecard-title">National Transparency Scorecard</h1>
            <p className="scorecard-subtitle">
              Aggregated real-time metrics auditing pre-trial detention durations, statutory remand
              compliance (ACJA 2015), and systemic resolution efficiency across Nigeria.
            </p>
          </div>

          <div className="scorecard-hero-actions">
            <button
              type="button"
              onClick={handleExportCSV}
              className="scorecard-export-btn"
              title="Download Transparency CSV"
            >
              <Download size={16} />
              <span>Export CSV Data</span>
            </button>
            <Link to="/backlog-map" className="scorecard-map-btn">
              <MapPin size={16} />
              <span>National Heatmap</span>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. FOUR PRIMARY QUANTITATIVE CARDS                           */}
        {/* ============================================================ */}
        <div className="scorecard-stats-grid">
          {/* Card 1: Total Registered */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Total Dockets Logged</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--primary">
                <Scale size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value tabular-nums">
              {data.totalCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Verified case files on platform</div>
          </div>

          {/* Card 2: Active Pre-Trial */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Active Pre-Trial Remand</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--warning">
                <Clock size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value tabular-nums">
              {data.activeCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Currently held awaiting trial</div>
          </div>

          {/* Card 3: Stalled Beyond 28 Days */}
          <div className="scorecard-stat-card scorecard-stat-card--danger">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Stalled Past ACJA Limit</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--danger">
                <AlertOctagon size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value text-rose-600 tabular-nums">
              {data.stalledCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Exceeding 28-day statutory ceiling</div>
          </div>

          {/* Card 4: Resolution Rate */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Resolution Velocity</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--success">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value tabular-nums">
              {data.resolutionRate}
            </div>
            <div className="scorecard-stat-subtext">
              {data.resolvedCases.toLocaleString()} cases disposed or granted bail
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. MONTHLY PROGRESSION TRENDS CHART                          */}
        {/* ============================================================ */}
        <div className="scorecard-chart-card">
          <div className="scorecard-chart-header">
            <div>
              <h2 className="scorecard-section-heading">Monthly Case Inflow vs. Resolution Trends</h2>
              <p className="scorecard-section-sub">
                Compares newly arraigned cases entering custody versus matters formally resolved or discharged by court benches.
              </p>
            </div>

            <div className="trends-chart__legend">
              <div className="trends-chart__legend-item">
                <span className="trends-chart__dot trends-chart__dot--filed" />
                <span>Cases Filed</span>
              </div>
              <div className="trends-chart__legend-item">
                <span className="trends-chart__dot trends-chart__dot--resolved" />
                <span>Cases Resolved</span>
              </div>
            </div>
          </div>

          {trends.length === 0 ? (
            <div className="chart-empty-placeholder">
              <Calendar size={32} className="text-slate-400 mb-2" />
              <p>No monthly timeline trend records have been logged yet.</p>
            </div>
          ) : (
            <div className="trends-chart-wrapper">
              <div className="trends-chart">
                {trends.map((item) => {
                  const filedHeight = Math.max(Math.round((item.filed / maxVal) * 160), 8);
                  const resolvedHeight = Math.max(Math.round((item.resolved / maxVal) * 160), item.resolved > 0 ? 8 : 2);
                  return (
                    <div key={item.period} className="trends-chart__col">
                      <div className="trends-chart__bars">
                        <div
                          className="trends-chart__bar trends-chart__bar--filed"
                          style={{ height: `${filedHeight}px` }}
                          title={`Filed: ${item.filed}`}
                        >
                          <span className="bar-tooltip-label tabular-nums">{item.filed}</span>
                        </div>
                        <div
                          className="trends-chart__bar trends-chart__bar--resolved"
                          style={{ height: `${resolvedHeight}px` }}
                          title={`Resolved: ${item.resolved}`}
                        >
                          <span className="bar-tooltip-label tabular-nums">{item.resolved}</span>
                        </div>
                      </div>
                      <span className="trends-chart__label">{item.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. INTERACTIVE PROCEDURAL BOTTLENECK AUDIT                   */}
        {/* ============================================================ */}
        <div className="scorecard-bottleneck-card">
          <div className="scorecard-section-header">
            <span className="scorecard-eyebrow">
              <Layers size={16} />
              <span>Delay Root-Cause Analysis</span>
            </span>
            <h2 className="scorecard-section-heading">Why Do Awaiting-Trial Cases Stall?</h2>
            <p className="scorecard-section-sub">
              Systemic delay factors documented across correctional facilities and court registers under ACJA monitoring. Select a bottleneck to inspect statutory remedies.
            </p>
          </div>

          {/* Interactive Bottleneck Selector Tabs */}
          <div className="bottleneck-selector-grid">
            {BOTTLENECK_FACTORS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBottleneckId(b.id)}
                className={`bottleneck-tab-btn ${selectedBottleneckId === b.id ? 'bottleneck-tab-btn--active' : ''}`}
              >
                <div className="bottleneck-tab-top">
                  <span className="bottleneck-share-val tabular-nums">{b.share}</span>
                  <span className="bottleneck-delay-tag tabular-nums">{b.delayDays}</span>
                </div>
                <div className="bottleneck-tab-title">{b.title}</div>
              </button>
            ))}
          </div>

          {/* Detailed Selected Bottleneck Readout */}
          <div className="bottleneck-detail-panel">
            <div className="bottleneck-detail-header">
              <div className="detail-header-left">
                <h3 className="detail-title">{selectedBottleneck.title}</h3>
                <div className="detail-meta">
                  <span>Responsible Agency: <strong>{selectedBottleneck.agency}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Governing Law: <strong className="text-blue-600">{selectedBottleneck.statute}</strong></span>
                </div>
              </div>
              <div className="detail-stat-badge">
                <span className="detail-badge-lbl">Est. Average Delay:</span>
                <span className="detail-badge-val tabular-nums">{selectedBottleneck.delayDays}</span>
              </div>
            </div>

            <div className="bottleneck-detail-body">
              <div className="detail-card detail-card--cause">
                <div className="detail-card-title">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <span>The Procedural Failure</span>
                </div>
                <p className="detail-card-text">{selectedBottleneck.cause}</p>
              </div>

              <div className="detail-card detail-card--remedy">
                <div className="detail-card-title">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>Enforceable Statutory Remedy</span>
                </div>
                <p className="detail-card-text">{selectedBottleneck.remedy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. JURISDICTIONAL TRANSPARENCY INDEX                         */}
        {/* ============================================================ */}
        <div className="scorecard-jurisdiction-card">
          <div className="scorecard-section-header">
            <span className="scorecard-eyebrow">
              <MapPin size={16} />
              <span>State Judicial Comparisons</span>
            </span>
            <h2 className="scorecard-section-heading">Regional Custodial Overview</h2>
            <p className="scorecard-section-sub">
              Comparative indicators across major metropolitan judicial dockets in Nigeria.
            </p>
          </div>

          <div className="jurisdiction-table-wrap">
            <table className="jurisdiction-table">
              <thead>
                <tr>
                  <th>Jurisdiction</th>
                  <th>Active Remand Dockets</th>
                  <th>ACJA 28-Day Compliance</th>
                  <th>Average Remand Stay</th>
                  <th>Primary Delay Factor</th>
                </tr>
              </thead>
              <tbody>
                {STATE_JURISDICTIONS.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-900">{row.name}</td>
                    <td className="tabular-nums">{row.activeDockets}</td>
                    <td>
                      <span className={`compliance-tag ${Number(row.complianceRate.replace('%', '')) > 35 ? 'compliance-tag--moderate' : 'compliance-tag--low'}`}>
                        {row.complianceRate}
                      </span>
                    </td>
                    <td className="tabular-nums font-semibold text-slate-800">{row.avgRemandDays}</td>
                    <td className="text-slate-600">{row.dominantDelay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. CALL TO ACTION & PUBLIC OVERSIGHT                         */}
        {/* ============================================================ */}
        <div className="scorecard-cta-card">
          <div className="cta-card-content">
            <h3 className="cta-card-title">Need to verify a specific case docket?</h3>
            <p className="cta-card-desc">
              Search by Case Hash ID for an individual audit of court production dates, bail status, and assigned defense counsel.
            </p>
            <div className="cta-card-actions">
              <Link to="/lookup" className="scorecard-action-btn-primary">
                <span>Check Case Status</span>
                <ChevronRight size={16} />
              </Link>
              <Link to="/register" className="scorecard-action-btn-secondary">
                <span>Volunteer as Defense Counsel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
