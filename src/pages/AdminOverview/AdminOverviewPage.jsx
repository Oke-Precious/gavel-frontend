import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertOctagon, Briefcase, Clock3, Map, RefreshCw, TrendingUp } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { analyticsApi, casesApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { daysInCustody } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './AdminOverviewPage.css';

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function numberFrom(source, paths) {
  for (const path of paths) {
    const value = path.split('.').reduce((result, key) => result?.[key], source);
    if (value !== undefined && value !== null && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function caseDays(item) {
  const explicit = numberFrom(item, ['daysInCustody', 'detentionDays', 'waitDays']);
  if (explicit !== null) return explicit;
  const startDate = item?.remandStartDate ?? item?.detentionDate ?? item?.arrestDate;
  return startDate ? daysInCustody(startDate) : null;
}

function isCritical(item) {
  const alert = String(item?.alertLevel ?? item?.alert ?? '').toLowerCase();
  if (alert) return alert.includes('critical');
  const days = caseDays(item);
  return days !== null && getAlertLevel(days).level === 'critical';
}

function normalizeHeatmap(data) {
  return listFrom(data, ['heatmap', 'rows']).map((row, index) => ({
    id: row?._id ? JSON.stringify(row._id) : `${row?.court ?? 'court'}-${index}`,
    court: row?.court ?? row?._id?.court ?? 'Not provided',
    stage: row?.stage ?? row?._id?.stage ?? 'Not provided',
    count: Number(row?.count ?? row?.total ?? 0),
  }));
}

function normalizeTrends(data) {
  const totals = new Map();
  listFrom(data, ['trends', 'rows']).forEach((row) => {
    const year = row?._id?.year ?? row?.year;
    const month = row?._id?.month ?? row?.month;
    const period = row?.period ?? row?.label ?? (year && month
      ? `${year}-${String(month).padStart(2, '0')}`
      : null);
    if (!period) return;
    totals.set(period, (totals.get(period) ?? 0) + Number(row?.count ?? row?.total ?? 0));
  });

  return Array.from(totals, ([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12);
}

function chartPoints(rows) {
  if (!rows.length) return '';
  const max = Math.max(...rows.map((row) => row.count), 1);
  return rows.map((row, index) => {
    const x = rows.length === 1 ? 300 : 24 + (index / (rows.length - 1)) * 552;
    const y = 184 - (row.count / max) * 152;
    return `${x},${y}`;
  }).join(' ');
}

function errorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'The analytics service is temporarily unavailable. Please try again.';
  return error.response.data?.message ?? 'Unable to load the Admin Overview.';
}

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { user, roleLabel } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [overview, setOverview] = useState(null);
  const [cases, setCases] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, heatmapData, trendsData, casesData] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.heatmap(),
        analyticsApi.trends(),
        casesApi.list({ page: 1, limit: 200 }),
      ]);
      setOverview(overviewData ?? {});
      setHeatmap(normalizeHeatmap(heatmapData));
      setTrends(normalizeTrends(trendsData));
      setCases(listFrom(casesData, ['cases', 'items']));
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadOverview, 0);
    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  const metrics = useMemo(() => {
    const total = numberFrom(overview, ['cases.total', 'cases.totalCases', 'totalCases', 'total'])
      ?? cases.length;
    const criticalFromApi = numberFrom(overview, ['cases.critical', 'cases.criticalCases', 'criticalCases', 'critical']);
    const critical = criticalFromApi ?? cases.filter(isCritical).length;
    const averageFromApi = numberFrom(overview, [
      'cases.avgWaitTime',
      'cases.averageWaitTime',
      'cases.averageWaitDays',
      'avgWaitTime',
      'averageWaitDays',
    ]);
    const waits = cases.map(caseDays).filter((value) => value !== null);
    const average = averageFromApi ?? (waits.length
      ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length)
      : 0);
    return { total, critical, average };
  }, [cases, overview]);

  const topCourt = useMemo(
    () => [...heatmap].sort((a, b) => b.count - a.count)[0],
    [heatmap],
  );
  const points = useMemo(() => chartPoints(trends), [trends]);
  const firstName = user?.firstName?.trim();

  return (
    <main className="admin-overview" aria-labelledby="admin-overview-title">
      <header className="admin-overview__header">
        <div>
          <p className="admin-overview__eyebrow">System-wide oversight</p>
          <h1 id="admin-overview-title">Admin Overview</h1>
          <p className="admin-overview__subtitle">
            {firstName ? `Welcome back, ${firstName}. ` : ''}Monitor detention delay and court pressure without exposing personal case data.
          </p>
        </div>
        <div className="admin-overview__identity" aria-label={`Viewing as ${roleLabel ?? 'Admin'}`}>
          <span>{roleLabel ?? 'Admin'}</span>
          <strong>{user?.firstName} {user?.lastName}</strong>
        </div>
      </header>

      {loading ? (
        <div aria-label="Loading Admin Overview">
          <section className="admin-overview__stats">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} padding="lg"><Skeleton variant="card" height={88} /></Card>
            ))}
          </section>
          <section className="admin-overview__previews">
            <Card padding="lg"><Skeleton variant="card" height={260} /></Card>
            <Card padding="lg"><Skeleton variant="card" height={260} /></Card>
          </section>
        </div>
      ) : error ? (
        <Card padding="lg" className="admin-overview__error" role="alert">
          <AlertOctagon size={24} aria-hidden="true" />
          <div>
            <h2>Admin overview unavailable</h2>
            <p>{error}</p>
          </div>
          <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadOverview}>
            Try again
          </Button>
        </Card>
      ) : (
        <>
          <section className="admin-overview__stats" aria-label="System case statistics">
            <MetricCard icon={Briefcase} label="Total Cases" value={metrics.total.toLocaleString()} />
            <MetricCard icon={AlertOctagon} label="Critical" value={metrics.critical.toLocaleString()} critical />
            <MetricCard icon={Clock3} label="Avg. Wait Time" value={`${metrics.average.toLocaleString()} days`} />
          </section>

          <section className="admin-overview__previews" aria-label="Analytics previews">
            <Card padding="lg" className="admin-overview__preview-card">
              <div className="admin-overview__card-heading">
                <div>
                  <p className="admin-overview__eyebrow">Heatmap preview</p>
                  <h2>Cases by court and stage</h2>
                </div>
                <Map size={22} aria-hidden="true" />
              </div>
              <div className="admin-overview__map-frame">
                <img src="/Nigeria Choropleth Map.png" alt="Nigeria choropleth map preview" />
              </div>
              <p className="admin-overview__preview-note">
                {topCourt
                  ? `${topCourt.court} has the highest reported court-stage group at ${topCourt.count.toLocaleString()} cases.`
                  : 'No court heatmap data is available yet.'}
              </p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/heatmap')}>View heatmap</Button>
            </Card>

            <Card padding="lg" className="admin-overview__preview-card">
              <div className="admin-overview__card-heading">
                <div>
                  <p className="admin-overview__eyebrow">Trend preview</p>
                  <h2>Case status changes</h2>
                </div>
                <TrendingUp size={22} aria-hidden="true" />
              </div>
              {trends.length ? (
                <>
                  <div className="admin-overview__chart" aria-hidden="true">
                    <svg viewBox="0 0 600 216" role="img">
                      <line x1="24" y1="184" x2="576" y2="184" />
                      <line x1="24" y1="32" x2="24" y2="184" />
                      <polyline points={points} />
                      {points.split(' ').map((point, index) => {
                        const [cx, cy] = point.split(',');
                        return <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="4" />;
                      })}
                    </svg>
                  </div>
                  <ul className="admin-overview__trend-summary" aria-label="Recent status change totals">
                    {trends.slice(-4).map((row) => (
                      <li key={row.period}><span>{row.period}</span><strong>{row.count.toLocaleString()}</strong></li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="admin-overview__empty">No historical trend data is available yet.</p>
              )}
            </Card>
          </section>
        </>
      )}
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, critical = false }) {
  return (
    <Card padding="lg" className={`admin-overview__metric${critical ? ' admin-overview__metric--critical' : ''}`} role="figure" aria-label={`${label}: ${value}`}>
      <div className="admin-overview__metric-label"><Icon size={20} aria-hidden="true" /> {label}</div>
      <strong>{value}</strong>
    </Card>
  );
}
