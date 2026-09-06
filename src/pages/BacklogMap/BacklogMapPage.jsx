import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, ArrowRight, Shield, Clock, FileText, CheckCircle, AlertOctagon, XCircle } from 'lucide-react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { publicApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './BacklogMapPage.css';

// State data dictionary with required sample values
const STATE_DATA = {
  Lagos: {
    name: 'Lagos',
    totalCases: 312,
    avgWaitDays: 96,
    topStallReason: 'Court Adjournment',
    alertLevel: 'severe', // Orange #F97316
    court: 'Ikeja Magistrate Court',
    caseHashId: 'LA-2026-0483',
  },
  Kano: {
    name: 'Kano',
    totalCases: 184,
    avgWaitDays: 54,
    topStallReason: 'File in Transit',
    alertLevel: 'warning', // Amber #F59E0B
    court: 'Kano State High Court',
    caseHashId: 'KN-2025-1187',
  },
  Rivers: {
    name: 'Rivers',
    totalCases: 95,
    avgWaitDays: 22,
    topStallReason: 'Awaiting DPP Advice',
    alertLevel: 'compliant', // Emerald #10B981
    court: 'Port Harcourt Magistrate Court',
    caseHashId: 'RV-2026-0092',
  },
  Enugu: {
    name: 'Enugu',
    totalCases: 420,
    avgWaitDays: 215,
    topStallReason: 'Missing Counsel',
    alertLevel: 'critical', // Crimson #EF4444
    court: 'Enugu State High Court',
    caseHashId: 'EN-2024-2201',
  },
  Kaduna: {
    name: 'Kaduna',
    totalCases: 160,
    avgWaitDays: 68,
    topStallReason: 'Court Adjournment',
    alertLevel: 'warning', // Amber #F59E0B
    court: 'Kaduna Magistrate Court',
    caseHashId: 'KD-2026-0112',
  },
  Ogun: {
    name: 'Ogun',
    totalCases: 88,
    avgWaitDays: 19,
    topStallReason: 'Awaiting DPP Advice',
    alertLevel: 'compliant', // Emerald #10B981
    court: 'Abeokuta High Court',
    caseHashId: 'OG-2026-0044',
  },
};

// All 36 States + FCT for map rendering
const NIGERIA_STATES = [
  { id: 'Lagos', name: 'Lagos', path: 'M 160 380 L 195 385 L 210 410 L 175 415 Z', textPos: [180, 400] },
  { id: 'Ogun', name: 'Ogun', path: 'M 150 340 L 220 345 L 225 385 L 160 380 Z', textPos: [185, 365] },
  { id: 'Oyo', name: 'Oyo', path: 'M 140 280 L 210 270 L 220 345 L 150 340 Z', textPos: [180, 310] },
  { id: 'Osun', name: 'Osun', path: 'M 210 320 L 245 315 L 250 350 L 220 345 Z', textPos: [230, 335] },
  { id: 'Ondo', name: 'Ondo', path: 'M 245 315 L 275 310 L 285 365 L 250 350 Z', textPos: [265, 340] },
  { id: 'Ekiti', name: 'Ekiti', path: 'M 245 285 L 275 280 L 275 310 L 245 315 Z', textPos: [260, 298] },
  { id: 'Kwara', name: 'Kwara', path: 'M 180 230 L 280 220 L 275 280 L 210 270 Z', textPos: [235, 250] },
  { id: 'Kogi', name: 'Kogi', path: 'M 275 280 L 370 275 L 365 345 L 275 310 Z', textPos: [320, 305] },
  { id: 'Edo', name: 'Edo', path: 'M 250 350 L 305 345 L 300 405 L 260 400 Z', textPos: [280, 375] },
  { id: 'Delta', name: 'Delta', path: 'M 260 400 L 315 405 L 310 450 L 245 440 Z', textPos: [280, 425] },
  { id: 'Bayelsa', name: 'Bayelsa', path: 'M 285 450 L 330 450 L 320 480 L 275 470 Z', textPos: [302, 465] },
  { id: 'Rivers', name: 'Rivers', path: 'M 330 435 L 375 430 L 365 475 L 320 480 Z', textPos: [350, 455] },
  { id: 'Anambra', name: 'Anambra', path: 'M 315 385 L 345 385 L 345 415 L 315 415 Z', textPos: [330, 400] },
  { id: 'Imo', name: 'Imo', path: 'M 330 415 L 360 415 L 360 445 L 330 445 Z', textPos: [345, 430] },
  { id: 'Enugu', name: 'Enugu', path: 'M 345 355 L 390 355 L 390 395 L 345 395 Z', textPos: [367, 375] },
  { id: 'Abia', name: 'Abia', path: 'M 360 415 L 390 415 L 385 450 L 355 450 Z', textPos: [372, 432] },
  { id: 'Ebonyi', name: 'Ebonyi', path: 'M 390 365 L 420 365 L 415 415 L 390 405 Z', textPos: [405, 388] },
  { id: 'Cross River', name: 'Cross River', path: 'M 415 390 L 460 385 L 440 470 L 385 450 Z', textPos: [430, 425] },
  { id: 'Akwa Ibom', name: 'Akwa Ibom', path: 'M 370 450 L 415 445 L 405 480 L 365 475 Z', textPos: [390, 465] },
  { id: 'Niger', name: 'Niger', path: 'M 210 130 L 340 120 L 330 220 L 180 230 Z', textPos: [265, 175] },
  { id: 'FCT', name: 'FCT Abuja', path: 'M 330 200 L 365 200 L 365 235 L 330 235 Z', textPos: [347, 217] },
  { id: 'Kaduna', name: 'Kaduna', path: 'M 320 110 L 420 100 L 410 190 L 330 200 Z', textPos: [370, 150] },
  { id: 'Kano', name: 'Kano', path: 'M 360 40 L 450 35 L 440 110 L 360 115 Z', textPos: [405, 75] },
  { id: 'Katsina', name: 'Katsina', path: 'M 290 35 L 360 40 L 350 110 L 290 105 Z', textPos: [322, 72] },
  { id: 'Zamfara', name: 'Zamfara', path: 'M 220 50 L 290 35 L 290 120 L 210 130 Z', textPos: [252, 85] },
  { id: 'Sokoto', name: 'Sokoto', path: 'M 140 30 L 220 50 L 210 110 L 130 90 Z', textPos: [175, 70] },
  { id: 'Kebbi', name: 'Kebbi', path: 'M 120 70 L 210 110 L 180 210 L 110 170 Z', textPos: [155, 140] },
  { id: 'Nasarawa', name: 'Nasarawa', path: 'M 365 220 L 450 215 L 440 270 L 365 265 Z', textPos: [405, 242] },
  { id: 'Benue', name: 'Benue', path: 'M 370 275 L 480 270 L 470 345 L 390 355 Z', textPos: [430, 310] },
  { id: 'Plateau', name: 'Plateau', path: 'M 420 170 L 490 165 L 485 240 L 420 235 Z', textPos: [455, 202] },
  { id: 'Bauchi', name: 'Bauchi', path: 'M 440 100 L 530 90 L 520 175 L 440 170 Z', textPos: [482, 132] },
  { id: 'Jigawa', name: 'Jigawa', path: 'M 450 35 L 530 30 L 520 95 L 440 100 Z', textPos: [485, 62] },
  { id: 'Yobe', name: 'Yobe', path: 'M 530 30 L 610 25 L 600 115 L 530 110 Z', textPos: [568, 68] },
  { id: 'Borno', name: 'Borno', path: 'M 610 25 L 680 20 L 660 165 L 590 160 Z', textPos: [635, 92] },
  { id: 'Gombe', name: 'Gombe', path: 'M 520 115 L 580 110 L 570 175 L 520 175 Z', textPos: [548, 142] },
  { id: 'Adamawa', name: 'Adamawa', path: 'M 570 145 L 650 140 L 620 245 L 550 235 Z', textPos: [598, 190] },
  { id: 'Taraba', name: 'Taraba', path: 'M 480 230 L 560 225 L 530 330 L 460 320 Z', textPos: [515, 275] },
];

export default function BacklogMapPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedState, setSelectedState] = useState('Lagos');
  const [hoveredState, setHoveredState] = useState(null);
  const [mapData, setMapData] = useState(STATE_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Fetch Backlog Map API with fallback
  useEffect(() => {
    let cancelled = false;

    async function fetchMapData() {
      setLoading(true);
      setError(null);

      if (simulateError) {
        setLoading(false);
        setError('Failed to connect to national backlog service (HTTP 503).');
        return;
      }

      try {
        const res = await publicApi.backlogMap();
        if (!cancelled && res && Array.isArray(res) && res.length > 0) {
          const merged = { ...STATE_DATA };
          res.forEach((item) => {
            if (item.state && merged[item.state]) {
              merged[item.state] = {
                ...merged[item.state],
                totalCases: item.activeCases ?? item.totalCases ?? merged[item.state].totalCases,
                avgWaitDays: item.avgWaitDays ?? merged[item.state].avgWaitDays,
              };
            }
          });
          setMapData(merged);
        }
      } catch {
        if (!cancelled) {
          // Graceful fallback to default STATE_DATA
          setMapData(STATE_DATA);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMapData();
    return () => {
      cancelled = true;
    };
  }, [simulateError]);

  const activeData = mapData[selectedState] || {
    name: selectedState,
    totalCases: 'No Data',
    avgWaitDays: '—',
    topStallReason: 'No data recorded for this state',
    alertLevel: 'compliant',
    court: `${selectedState} State Court`,
    caseHashId: 'LA-2026-0483',
  };

  const getAlertColor = (alertLevel) => {
    switch (alertLevel) {
      case 'compliant': return '#10B981'; // Emerald
      case 'warning':   return '#F59E0B'; // Amber
      case 'severe':    return '#F97316'; // Orange
      case 'critical':   return '#EF4444'; // Crimson
      default:          return '#CBD5E1'; // Neutral Slate
    }
  };

  if (isLoading) {
    return (
      <div className="backlog-map-page">
        <div className="container backlog-map-container">
          <div className="backlog-map-skeleton-header">
            <Skeleton variant="text" width="300px" height="32px" />
            <Skeleton variant="text" width="500px" height="20px" />
          </div>
          <div className="backlog-map-grid">
            <Card padding="lg">
              <Skeleton variant="card" height={400} />
            </Card>
            <Card padding="lg">
              <Skeleton variant="card" height={400} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backlog-map-page">
        <div className="container backlog-map-container">
          <Card padding="xl" className="backlog-map-error-card">
            <EmptyState
              icon="alert"
              message="National Backlog Overview Unavailable"
              subtext={error || 'Unable to render the state backlog choropleth map.'}
              actionLabel="Try Again"
              onAction={() => {
                setSimulateError(false);
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="backlog-map-page">
      <div className="container backlog-map-container">
        {/* Page Header */}
        <div className="backlog-map-header">
          <div className="backlog-map-header__title-group">
            <h2 className="backlog-map-title">National Backlog Overview</h2>
            <p className="backlog-map-subheading">
              Each state's color reflects the average alert severity of its awaiting-trial cases.
            </p>
          </div>

          <button
            type="button"
            className={`backlog-map-test-toggle ${simulateError ? 'is-active' : ''}`}
            onClick={() => setSimulateError(!simulateError)}
            title="Test network error state"
          >
            <AlertTriangle size={14} aria-hidden="true" />
            <span>{simulateError ? 'Error Active' : 'Simulate Error State'}</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: Interactive Map + Side Stat Panel */}
        <div className="backlog-map-grid">
          {/* Column 1: Interactive SVG Map & Legend */}
          <div className="backlog-map-map-col">
            <Card padding="lg" className="backlog-map-card map-card">
              {/* Mobile State Selector */}
              <div className="backlog-map-mobile-select-row">
                <label htmlFor="state-mobile-select" className="backlog-map-mobile-label">
                  Select State:
                </label>
                <select
                  id="state-mobile-select"
                  className="backlog-map-mobile-select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  {Object.keys(STATE_DATA).map((st) => (
                    <option key={st} value={st}>
                      {st} ({STATE_DATA[st].totalCases} cases — {STATE_DATA[st].alertLevel.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive Vector SVG Map */}
              <div className="backlog-map-svg-wrapper">
                <svg
                  viewBox="0 0 720 520"
                  className="backlog-map-svg"
                  aria-label="Interactive map of Nigerian states"
                  role="img"
                >
                  <defs>
                    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {NIGERIA_STATES.map((st) => {
                    const stData = mapData[st.id];
                    const isSelected = selectedState === st.id;
                    const isHovered = hoveredState === st.id;
                    const fillColor = stData
                      ? getAlertColor(stData.alertLevel)
                      : '#CBD5E1';

                    return (
                      <g key={st.id}>
                        <path
                          d={st.path}
                          fill={fillColor}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? '3' : '1.5'}
                          className={`backlog-map-state-path${isSelected ? ' is-selected' : ''}${isHovered ? ' is-hovered' : ''}`}
                          onClick={() => {
                            setSelectedState(st.id);
                            if (!stData) {
                              toast.info(`No active tracking dataset registered for ${st.name} yet.`);
                            }
                          }}
                          onMouseEnter={() => setHoveredState(st.id)}
                          onMouseLeave={() => setHoveredState(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${st.name}: ${stData ? `${stData.totalCases} cases` : 'No Data'}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedState(st.id);
                            }
                          }}
                        />
                        <text
                          x={st.textPos[0]}
                          y={st.textPos[1]}
                          className={`backlog-map-state-label${isSelected ? ' is-selected' : ''}`}
                          pointerEvents="none"
                        >
                          {st.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip */}
                {hoveredState && (
                  <div className="backlog-map-tooltip">
                    <strong>{hoveredState}</strong>
                    {mapData[hoveredState] ? (
                      <span>
                        {mapData[hoveredState].totalCases} cases · {mapData[hoveredState].avgWaitDays} days avg
                      </span>
                    ) : (
                      <span>No active tracking data</span>
                    )}
                  </div>
                )}
              </div>

              {/* Legend below the map — four tiers labeled exactly per prompt */}
              <div className="backlog-map-legend" role="region" aria-label="Map severity legend">
                <span className="backlog-map-legend-title">Backlog Severity Legend:</span>
                <div className="backlog-map-legend-items">
                  <div className="backlog-map-legend-item">
                    <span className="legend-swatch legend-swatch--compliant" />
                    <span className="legend-label">Compliant</span>
                  </div>
                  <div className="backlog-map-legend-item">
                    <span className="legend-swatch legend-swatch--warning" />
                    <span className="legend-label">Warning</span>
                  </div>
                  <div className="backlog-map-legend-item">
                    <span className="legend-swatch legend-swatch--severe" />
                    <span className="legend-label">Severe Warning</span>
                  </div>
                  <div className="backlog-map-legend-item">
                    <span className="legend-swatch legend-swatch--critical" />
                    <span className="legend-label">Critical</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Side Panel (State Stat Card) */}
          <div className="backlog-map-side-col">
            <Card padding="lg" className="backlog-map-card stat-panel-card">
              <div className="stat-panel-header">
                <div className="stat-panel-title-group">
                  <MapPin size={20} className="stat-panel-pin-icon" aria-hidden="true" />
                  <h3 className="stat-panel-state-name">{activeData.name}</h3>
                </div>
                {activeData.alertLevel && (
                  <StatusPill level={activeData.alertLevel} size="md" />
                )}
              </div>

              <div className="stat-panel-metrics">
                {/* Metric 1: Total Cases */}
                <div className="stat-metric-box">
                  <div className="stat-metric-icon-wrap" aria-hidden="true">
                    <FileText size={18} />
                  </div>
                  <div className="stat-metric-content">
                    <span className="stat-metric-label">Total Cases</span>
                    <span className="stat-metric-value">{activeData.totalCases}</span>
                  </div>
                </div>

                {/* Metric 2: Average Wait Time */}
                <div className="stat-metric-box">
                  <div className="stat-metric-icon-wrap" aria-hidden="true">
                    <Clock size={18} />
                  </div>
                  <div className="stat-metric-content">
                    <span className="stat-metric-label">Average Wait Time</span>
                    <span className="stat-metric-value">
                      {typeof activeData.avgWaitDays === 'number'
                        ? `${activeData.avgWaitDays} days`
                        : activeData.avgWaitDays}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Top Stall Reason */}
                <div className="stat-metric-box">
                  <div className="stat-metric-icon-wrap" aria-hidden="true">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="stat-metric-content">
                    <span className="stat-metric-label">Top Stall Reason</span>
                    <span className="stat-metric-value stat-metric-value--reason">
                      {activeData.topStallReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link: View [State] Cases */}
              <div className="stat-panel-footer">
                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onClick={() => {
                    const targetId = activeData.caseHashId || 'LA-2026-0483';
                    navigate(`/cases/${targetId}`);
                  }}
                  className="stat-panel-cta"
                >
                  View {activeData.name} Cases
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
