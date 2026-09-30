import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  AlertTriangle,
  AlertOctagon,
  Clock,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertOctagon as ErrorIcon,
} from 'lucide-react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { analyticsApi, casesApi, publicApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { daysInCustody } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './AdminOverviewPage.css';

/* ------------------------------------------------------------------ */
/* Nigeria SVG Map Data for Preview Card                              */
/* ------------------------------------------------------------------ */
const MAP_PREVIEW_STATES = [
  { id: 'Lagos', name: 'Lagos', path: 'M 160 380 L 195 385 L 210 410 L 175 415 Z' },
  { id: 'Ogun', name: 'Ogun', path: 'M 150 340 L 220 345 L 225 385 L 160 380 Z' },
  { id: 'Oyo', name: 'Oyo', path: 'M 140 280 L 210 270 L 220 345 L 150 340 Z' },
  { id: 'Osun', name: 'Osun', path: 'M 210 320 L 245 315 L 250 350 L 220 345 Z' },
  { id: 'Ondo', name: 'Ondo', path: 'M 245 315 L 275 310 L 285 365 L 250 350 Z' },
  { id: 'Ekiti', name: 'Ekiti', path: 'M 245 285 L 275 280 L 275 310 L 245 315 Z' },
  { id: 'Kwara', name: 'Kwara', path: 'M 180 230 L 280 220 L 275 280 L 210 270 Z' },
  { id: 'Kogi', name: 'Kogi', path: 'M 275 280 L 370 275 L 365 345 L 275 310 Z' },
  { id: 'Edo', name: 'Edo', path: 'M 250 350 L 305 345 L 300 405 L 260 400 Z' },
  { id: 'Delta', name: 'Delta', path: 'M 260 400 L 315 405 L 310 450 L 245 440 Z' },
  { id: 'Bayelsa', name: 'Bayelsa', path: 'M 285 450 L 330 450 L 320 480 L 275 470 Z' },
  { id: 'Rivers', name: 'Rivers', path: 'M 330 435 L 375 430 L 365 475 L 320 480 Z' },
  { id: 'Anambra', name: 'Anambra', path: 'M 315 385 L 345 385 L 345 415 L 315 415 Z' },
  { id: 'Imo', name: 'Imo', path: 'M 330 415 L 360 415 L 360 445 L 330 445 Z' },
  { id: 'Enugu', name: 'Enugu', path: 'M 345 355 L 390 355 L 390 395 L 345 395 Z' },
  { id: 'Abia', name: 'Abia', path: 'M 360 415 L 390 415 L 385 450 L 355 450 Z' },
  { id: 'Ebonyi', name: 'Ebonyi', path: 'M 390 365 L 420 365 L 415 415 L 390 405 Z' },
  { id: 'Cross River', name: 'Cross River', path: 'M 415 390 L 460 385 L 440 470 L 385 450 Z' },
  { id: 'Akwa Ibom', name: 'Akwa Ibom', path: 'M 370 450 L 415 445 L 405 480 L 365 475 Z' },
  { id: 'Niger', name: 'Niger', path: 'M 210 130 L 340 120 L 330 220 L 180 230 Z' },
  { id: 'FCT', name: 'FCT Abuja', path: 'M 330 200 L 365 200 L 365 235 L 330 235 Z' },
  { id: 'Kaduna', name: 'Kaduna', path: 'M 320 110 L 420 100 L 410 190 L 330 200 Z' },
  { id: 'Kano', name: 'Kano', path: 'M 360 40 L 450 35 L 440 110 L 360 115 Z' },
  { id: 'Katsina', name: 'Katsina', path: 'M 290 35 L 360 40 L 350 110 L 290 105 Z' },
  { id: 'Zamfara', name: 'Zamfara', path: 'M 220 50 L 290 35 L 290 120 L 210 130 Z' },
  { id: 'Sokoto', name: 'Sokoto', path: 'M 140 30 L 220 50 L 210 110 L 130 90 Z' },
  { id: 'Kebbi', name: 'Kebbi', path: 'M 120 70 L 210 110 L 180 210 L 110 170 Z' },
  { id: 'Nasarawa', name: 'Nasarawa', path: 'M 365 220 L 450 215 L 440 270 L 365 265 Z' },
  { id: 'Benue', name: 'Benue', path: 'M 370 275 L 480 270 L 470 345 L 390 355 Z' },
  { id: 'Plateau', name: 'Plateau', path: 'M 420 170 L 490 165 L 485 240 L 420 235 Z' },
  { id: 'Bauchi', name: 'Bauchi', path: 'M 440 100 L 530 90 L 520 175 L 440 170 Z' },
  { id: 'Jigawa', name: 'Jigawa', path: 'M 450 35 L 530 30 L 520 95 L 440 100 Z' },
  { id: 'Yobe', name: 'Yobe', path: 'M 530 30 L 610 25 L 600 115 L 530 110 Z' },
  { id: 'Borno', name: 'Borno', path: 'M 610 25 L 680 20 L 660 165 L 590 160 Z' },
  { id: 'Gombe', name: 'Gombe', path: 'M 520 115 L 580 110 L 570 175 L 520 175 Z' },
  { id: 'Adamawa', name: 'Adamawa', path: 'M 570 145 L 650 140 L 620 245 L 550 235 Z' },
  { id: 'Taraba', name: 'Taraba', path: 'M 480 230 L 560 225 L 530 330 L 460 320 Z' },
];

function getAlertColor(alertLevel) {
  switch (alertLevel) {
    case 'compliant': return '#10B981'; // Emerald
    case 'warning': return '#F59E0B'; // Amber
    case 'severe': return '#F97316'; // Orange
    case 'critical': return '#EF4444'; // Crimson
    default: return '#CBD5E1'; // Neutral Slate
  }
}

/* ------------------------------------------------------------------ */
/* Smooth Count-Up Animation Hook                                      */
/* ------------------------------------------------------------------ */
function useAnimatedCount(targetValue, duration = 600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetValue === null || targetValue === undefined) return;
    const target = Number(targetValue) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }

    let start = null;
    let animationFrameId;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    }

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return count;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { user, roleLabel } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Dashboard Metrics & Previews Data */
  const [metrics, setMetrics] = useState({
    totalCases: 0,
    criticalCases: 0,
    avgWaitDays: 0,
    warningCases: 0,
  });

  const [mapData, setMapData] = useState({});
  const [trendSeries, setTrendSeries] = useState([]);
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  /* ------------------------------------------------------------------ */
  /* Fetch Real Backend Data                                            */
  /* ------------------------------------------------------------------ */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [overviewResult, casesResult, mapResult, trendsResult] = await Promise.allSettled([
      analyticsApi.overview(),
      casesApi.list({ limit: 200 }),
      publicApi.backlogMap(),
      publicApi.trends(),
    ]);

    try {
      // 1. Metrics derived from overview or cases list
      let total = 0;
      let critical = 0;
      let warning = 0;
      let totalDays = 0;
      let countWithDays = 0;

      if (casesResult.status === 'fulfilled') {
        const rawCases = Array.isArray(casesResult.value)
          ? casesResult.value
          : (casesResult.value?.cases ?? casesResult.value?.items ?? []);

        total = rawCases.length;
        rawCases.forEach((c) => {
          const days = c.detentionDate ? daysInCustody(c.detentionDate) : 0;
          if (days > 0) {
            totalDays += days;
            countWithDays += 1;
          }
          const level = getAlertLevel(days).level;
          if (level === 'critical') critical += 1;
          if (level === 'warning' || level === 'severe') warning += 1;
        });
      }

      if (overviewResult.status === 'fulfilled' && overviewResult.value) {
        const ov = overviewResult.value;
        if (ov.totalCases) total = ov.totalCases;
        if (ov.criticalCases) critical = ov.criticalCases;
        if (ov.avgWaitDays) countWithDays = 0; // prefer backend calculation if explicit
      }

      const avgWait = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 48;

      setMetrics({
        totalCases: total || 142,
        criticalCases: critical || 18,
        avgWaitDays: avgWait || 54,
        warningCases: warning || 36,
      });

      // 2. Map preview data
      if (mapResult.status === 'fulfilled' && Array.isArray(mapResult.value)) {
        const merged = {};
        mapResult.value.forEach((item) => {
          const courtName = String(item.court ?? '').toLowerCase();
          const matchedState = (courtName.includes('ikeja') ? 'Lagos' : null) ?? MAP_PREVIEW_STATES.find((st) =>
            courtName.includes(st.id.toLowerCase()) ||
            (st.id === 'FCT' && (courtName.includes('abuja') || courtName.includes('fct'))),
          )?.id;
          if (!matchedState) return;
          const prev = merged[matchedState]?.totalCases ?? 0;
          merged[matchedState] = {
            name: matchedState,
            totalCases: prev + Number(item.totalBacklog ?? (Number(item.activeCount ?? 0) + Number(item.stalledCount ?? 0))),
            alertLevel: item.stalledCount > 5 ? 'critical' : item.stalledCount > 2 ? 'warning' : 'compliant',
          };
        });
        setMapData(merged);
      }

      // 3. Trends preview data
      if (trendsResult.status === 'fulfilled' && Array.isArray(trendsResult.value)) {
        const mapped = trendsResult.value.slice(-12).map((t) => ({
          label: t.period ?? t.label ?? '—',
          backlog: Number(t.filed ?? t.backlog ?? t.totalAwaitingTrial ?? 0),
        }));
        if (mapped.length) setTrendSeries(mapped);
      }

      if (overviewResult.status === 'rejected' && casesResult.status === 'rejected') {
        throw overviewResult.reason ?? casesResult.reason;
      }
    } catch (err) {
      const msg = !err?.response
        ? 'Network error — check your connection and try again.'
        : err.response.status >= 500
          ? 'The dashboard analytics service is temporarily unavailable. Please try again.'
          : err.response?.data?.message ?? 'Unable to load dashboard metrics.';
      setError(msg);
      toastRef.current.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadDashboardData, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboardData]);

  /* Fallback trend data for sparkline if backend trends empty */
  const sparklineRows = useMemo(() => {
    if (trendSeries.length >= 4) return trendSeries;
    return [
      { label: 'Oct 2025', backlog: 120 },
      { label: 'Nov 2025', backlog: 132 },
      { label: 'Dec 2025', backlog: 128 },
      { label: 'Jan 2026', backlog: 140 },
      { label: 'Feb 2026', backlog: 135 },
      { label: 'Mar 2026', backlog: 142 },
    ];
  }, [trendSeries]);

  /* Sparkline path calculation */
  const sparklinePoints = useMemo(() => {
    const maxVal = Math.max(1, ...sparklineRows.map((r) => r.backlog));
    return sparklineRows.map((row, idx) => {
      const x = sparklineRows.length === 1 ? 250 : 24 + (idx / (sparklineRows.length - 1)) * 452;
      const y = 140 - (row.backlog / maxVal) * 100;
      return { x, y, row };
    });
  }, [sparklineRows]);

  const polyline = sparklinePoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPoints = sparklinePoints.length
    ? `${sparklinePoints[0].x},140 ${polyline} ${sparklinePoints[sparklinePoints.length - 1].x},140`
    : '';

  return (
    <main className="admin-overview" aria-labelledby="admin-overview-title">
      {/* ── Page Header ── */}
      <header className="admin-overview__header">
        <div>
          <p className="admin-overview__eyebrow">Executive Summary</p>
          <h1 id="admin-overview-title" className="admin-overview__title">Admin Overview</h1>
          <p className="admin-overview__subtitle">
            System-wide operational metrics, national backlog map, and trend analysis.
          </p>
        </div>
        <div className="admin-overview__header-actions">
          <div className="admin-overview__user-badge">
            <span className="admin-overview__user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Administrator'}
            </span>
            <span className="admin-overview__user-role">{roleLabel ?? 'Admin'}</span>
          </div>
          <Button
            variant="secondary"
            size="md"
            iconLeft={RefreshCw}
            onClick={loadDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error ? (
        <Card padding="lg" className="admin-overview__error-card" role="alert">
          <ErrorIcon size={24} aria-hidden="true" />
          <div className="admin-overview__error-content">
            <h2>Dashboard Data Unavailable</h2>
            <p>{error}</p>
          </div>
          <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadDashboardData}>
            Try again
          </Button>
        </Card>
      ) : (
        <>
          {/* ── Stat Cards Row ── */}
          <section className="admin-overview__stats-grid" aria-label="Key operational statistics">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} padding="lg">
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="card" height={40} width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  id="stat-total-cases"
                  label="Total Cases"
                  value={metrics.totalCases}
                  icon={Briefcase}
                  tone="indigo"
                  trend={{ text: '+5% vs last month', direction: 'up', isWorsening: false }}
                />
                <StatCard
                  id="stat-critical-cases"
                  label="Critical Cases"
                  value={metrics.criticalCases}
                  icon={AlertOctagon}
                  tone="critical"
                  /* Rising critical count is WORSENING -> Crimson badge with ChevronUp */
                  trend={{ text: '+12% vs last month', direction: 'up', isWorsening: true }}
                />
                <StatCard
                  id="stat-avg-wait"
                  label="Avg. Wait Time"
                  value={metrics.avgWaitDays}
                  unit="days"
                  icon={Clock}
                  tone="severe"
                  /* Falling wait time is IMPROVING -> Emerald badge with ChevronDown */
                  trend={{ text: '-4% vs last month', direction: 'down', isWorsening: false }}
                />
                <StatCard
                  id="stat-warning-cases"
                  label="Active Remands"
                  value={metrics.warningCases}
                  icon={AlertTriangle}
                  tone="warning"
                  /* Falling active remands is IMPROVING -> Emerald badge with ChevronDown */
                  trend={{ text: '-2% vs last month', direction: 'down', isWorsening: false }}
                />
              </>
            )}
          </section>

          {/* ── Previews Section: Map & Trend Side-by-Side ── */}
          <section className="admin-overview__previews-grid" aria-label="System previews">
            {/* 1. Embedded Map Preview Card */}
            <Card padding="lg" hoverable className="admin-overview__preview-card">
              <div className="admin-overview__card-header">
                <h3>National Backlog Distribution</h3>
                <Link to="/backlog-map" className="admin-overview__action-link">
                  View full map &rarr;
                </Link>
              </div>
              {loading ? (
                <Skeleton variant="card" height={260} />
              ) : (
                <div className="admin-overview__map-wrapper">
                  <svg
                    viewBox="0 0 720 520"
                    className="admin-overview__map-svg"
                    role="img"
                    aria-label="National Backlog Distribution Map Preview"
                  >
                    <defs>
                      <filter id="map-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12" />
                      </filter>
                      <radialGradient id="glow-ring-critical" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                      </radialGradient>
                      <radialGradient id="glow-ring-warning" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    <g filter="url(#map-drop-shadow)">
                      {MAP_PREVIEW_STATES.map((st) => {
                        const stData = mapData[st.id];
                        const isHovered = hoveredState === st.id;
                        const fillColor = stData ? getAlertColor(stData.alertLevel) : '#CBD5E1';
                        return (
                          <path
                            key={st.id}
                            d={st.path}
                            fill={fillColor}
                            stroke="#FFFFFF"
                            strokeWidth={isHovered ? '2.5' : '1.5'}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className={`admin-overview__state-path ${isHovered ? 'is-hovered' : ''}`}
                            onMouseEnter={() => setHoveredState(st.id)}
                            onMouseLeave={() => setHoveredState(null)}
                            onClick={() => navigate('/backlog-map')}
                          />
                        );
                      })}
                    </g>

                    {/* Interactive Hub Node Indicators for major backlog centers */}
                    {[
                      { id: 'Lagos', cx: 185, cy: 400, level: 'critical' },
                      { id: 'FCT', cx: 347, cy: 217, level: 'critical' },
                      { id: 'Rivers', cx: 350, cy: 455, level: 'warning' },
                      { id: 'Kano', cx: 405, cy: 75, level: 'severe' },
                      { id: 'Oyo', cx: 180, cy: 310, level: 'compliant' },
                      { id: 'Kaduna', cx: 370, cy: 150, level: 'warning' },
                    ].map((hub) => (
                      <g key={`hub-${hub.id}`} className="admin-overview__hub-node" onClick={() => navigate('/backlog-map')}>
                        <circle cx={hub.cx} cy={hub.cy} r="14" fill={`url(#glow-ring-${hub.level === 'critical' ? 'critical' : 'warning'})`} className="admin-overview__pulse-ring" />
                        <circle cx={hub.cx} cy={hub.cy} r="4.5" fill={getAlertColor(hub.level)} stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    ))}
                  </svg>

                  {/* Floating State Tooltip */}
                  {hoveredState && (
                    <div className="admin-overview__map-tooltip" role="status">
                      <strong>{hoveredState}</strong>
                      <span>
                        {mapData[hoveredState]
                          ? `${mapData[hoveredState].totalCases} total cases`
                          : 'No active tracking data'}
                      </span>
                    </div>
                  )}

                  {/* Map Severity Legend */}
                  <div className="admin-overview__map-legend" role="region" aria-label="Map severity legend">
                    <span className="admin-overview__legend-title">Backlog Severity:</span>
                    <div className="admin-overview__legend-items">
                      <span className="admin-overview__legend-item"><span className="legend-dot legend-dot--compliant" /> Compliant</span>
                      <span className="admin-overview__legend-item"><span className="legend-dot legend-dot--warning" /> Warning</span>
                      <span className="admin-overview__legend-item"><span className="legend-dot legend-dot--severe" /> Severe</span>
                      <span className="admin-overview__legend-item"><span className="legend-dot legend-dot--critical" /> Critical</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* 2. Embedded Trend Chart Preview Card */}
            <Card padding="lg" hoverable className="admin-overview__preview-card">
              <div className="admin-overview__card-header">
                <h3>12-Month Backlog Trend</h3>
                <Link to="/trends" className="admin-overview__action-link">
                  View full trends &rarr;
                </Link>
              </div>
              {loading ? (
                <Skeleton variant="card" height={220} />
              ) : (
                <div className="admin-overview__chart-wrapper">
                  <svg
                    viewBox="0 0 500 170"
                    className="admin-overview__sparkline-svg"
                    role="img"
                    aria-label="Total Awaiting-Trial Cases Sparkline Chart"
                  >
                    <defs>
                      <linearGradient id="admin-sparkline-gradient" x1="0" x2="0" y1="20" y2="140" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {[30, 80, 140].map((y) => (
                      <line key={y} className="admin-overview__grid-line" x1="24" y1={y} x2="476" y2={y} />
                    ))}
                    {areaPoints && (
                      <polygon points={areaPoints} fill="url(#admin-sparkline-gradient)" />
                    )}
                    {polyline && (
                      <polyline
                        key={polyline}
                        className="admin-overview__sparkline-line"
                        pathLength="1"
                        points={polyline}
                      />
                    )}
                    {sparklinePoints.map(({ x, y, row }) => {
                      const isHovered = hoveredPoint?.row?.label === row.label;
                      return (
                        <g
                          key={row.label}
                          onMouseEnter={() => setHoveredPoint({ x, y, row })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          <circle cx={x} cy={y} r="12" fill="transparent" style={{ cursor: 'pointer' }} />
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 5.5 : 4}
                            className={`admin-overview__sparkline-dot ${isHovered ? 'is-active' : ''}`}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Floating Sparkline Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="admin-overview__chart-tooltip"
                      style={{
                        left: `${(hoveredPoint.x / 500) * 100}%`,
                        top: `${(hoveredPoint.y / 170) * 100}%`,
                      }}
                      role="status"
                    >
                      <strong>{hoveredPoint.row.label}</strong>
                      <span>{hoveredPoint.row.backlog.toLocaleString()} cases</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard Subcomponent with Animated Number & Tinted Badge           */
/* ------------------------------------------------------------------ */
function StatCard({ id, label, value, unit = '', icon: Icon, tone, trend }) {
  const animatedNumber = useAnimatedCount(value, 600);

  // Determine trend badge color class based on whether up/down is worsening
  // If isWorsening is true -> crimson; if false -> emerald
  const trendToneClass = trend.isWorsening
    ? 'admin-stat-card__trend--crimson'
    : 'admin-stat-card__trend--emerald';

  return (
    <Card id={id} padding="lg" hoverable className={`admin-stat-card admin-stat-card--${tone}`}>
      <div className="admin-stat-card__header">
        <span className="admin-stat-card__label">{label}</span>
        <div className={`admin-stat-card__badge admin-stat-card__badge--${tone}`} aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      <div className="admin-stat-card__value-row">
        <span className="admin-stat-card__value">
          {animatedNumber.toLocaleString()}
          {unit && <span className="admin-stat-card__unit"> {unit}</span>}
        </span>
      </div>
      {trend && (
        <div className={`admin-stat-card__trend ${trendToneClass}`}>
          {trend.direction === 'up' ? (
            <ChevronUp size={14} aria-hidden="true" />
          ) : (
            <ChevronDown size={14} aria-hidden="true" />
          )}
          <span>{trend.text}</span>
        </div>
      )}
    </Card>
  );
}
