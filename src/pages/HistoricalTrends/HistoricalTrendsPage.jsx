import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { analyticsApi, casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './HistoricalTrendsPage.css';

const MONTH_COUNT = 12;
const DAY_MS = 1000 * 60 * 60 * 24;

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function finiteNumber(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function validDate(...values) {
  for (const value of values) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function lastTwelveMonths(anchor = new Date()) {
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const offset = MONTH_COUNT - index - 1;
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    return { key: monthKey(start), label: monthLabel(start), start, end };
  });
}

function periodFrom(row) {
  const year = finiteNumber(row?._id?.year, row?.year);
  const month = finiteNumber(row?._id?.month, row?.month);
  if (year && month) return `${year}-${String(month).padStart(2, '0')}`;

  const candidate = row?.period ?? row?.date ?? row?.snapshotDate;
  if (!candidate) return null;
  const match = String(candidate).match(/^(\d{4})-(\d{1,2})/);
  if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}`;
  const date = validDate(candidate);
  return date ? monthKey(date) : null;
}

function directSnapshotSeries(data) {
  const grouped = new Map();
  let snapshotFieldsFound = false;

  listFrom(data, ['trends', 'rows', 'snapshots']).forEach((row) => {
    const period = periodFrom(row);
    const backlog = finiteNumber(
      row?.totalAwaitingTrial,
      row?.awaitingTrialCases,
      row?.backlog,
      row?.activeCases,
    );
    const average = finiteNumber(row?.avgWaitDays, row?.averageWaitDays, row?.avgWaitTime);
    if (!period || (backlog === null && average === null)) return;
    snapshotFieldsFound = true;

    const current = grouped.get(period) ?? { backlog: 0, averages: [], weights: [] };
    if (backlog !== null) current.backlog += backlog;
    if (average !== null) {
      current.averages.push(average);
      current.weights.push(backlog ?? 1);
    }
    grouped.set(period, current);
  });

  if (!snapshotFieldsFound || grouped.size === 0) return null;
  const periods = Array.from(grouped.keys()).sort().slice(-MONTH_COUNT);
  return periods.map((period) => {
    const item = grouped.get(period);
    const weightTotal = item.weights.reduce((sum, value) => sum + value, 0);
    const weightedAverage = item.averages.length
      ? item.averages.reduce((sum, value, index) => sum + value * item.weights[index], 0) / Math.max(weightTotal, 1)
      : 0;
    const date = new Date(`${period}-01T00:00:00`);
    return {
      key: period,
      label: monthLabel(date),
      backlog: Math.round(item.backlog),
      averageWaitDays: Math.round(weightedAverage),
    };
  });
}

function isClosed(caseRecord) {
  const status = String(caseRecord?.status ?? '').toLowerCase();
  const stage = String(caseRecord?.stage ?? '').toLowerCase();
  return status.includes('closed')
    || status.includes('resolved')
    || status.includes('discharged')
    || stage.includes('trial')
    || stage.includes('discharge');
}

function reconstructedSeries(cases) {
  return lastTwelveMonths().map((month) => {
    const waits = [];

    cases.forEach((caseRecord) => {
      const detentionDate = validDate(
        caseRecord?.remandStartDate,
        caseRecord?.detentionDate,
        caseRecord?.arrestDate,
        caseRecord?.createdAt,
      );
      if (!detentionDate || detentionDate > month.end) return;

      const closedDate = isClosed(caseRecord)
        ? validDate(caseRecord?.resolvedAt, caseRecord?.closedAt, caseRecord?.updatedAt)
        : null;
      if (closedDate && closedDate <= month.end) return;

      waits.push(Math.max(0, Math.floor((month.end.getTime() - detentionDate.getTime()) / DAY_MS)));
    });

    return {
      key: month.key,
      label: month.label,
      backlog: waits.length,
      averageWaitDays: waits.length
        ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length)
        : 0,
    };
  });
}

function errorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'The analytics service is temporarily unavailable. Please try again.';
  return error.response.data?.message ?? 'Unable to load historical trends.';
}

function pointsFor(rows, valueKey) {
  const maximum = Math.max(1, ...rows.map((row) => row[valueKey]));
  return rows.map((row, index) => {
    const x = rows.length === 1 ? 360 : 56 + (index / (rows.length - 1)) * 632;
    const y = 212 - (row[valueKey] / maximum) * 164;
    return { x, y, row };
  });
}

export default function HistoricalTrendsPage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [series, setSeries] = useState([]);
  const [sourceNote, setSourceNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTrends = useCallback(async () => {
    setLoading(true);
    setError('');
    setSourceNote('');

    const [trendsResult, casesResult] = await Promise.allSettled([
      analyticsApi.trends(),
      casesApi.list({ page: 1, limit: 200 }),
    ]);

    try {
      const direct = trendsResult.status === 'fulfilled'
        ? directSnapshotSeries(trendsResult.value)
        : null;

      if (direct?.length) {
        setSeries(direct);
        setSourceNote('Monthly values are supplied by the analytics snapshot service.');
      } else if (casesResult.status === 'fulfilled') {
        const cases = listFrom(casesResult.value, ['cases', 'items']);
        setSeries(reconstructedSeries(cases));
        setSourceNote('The current API exposes status-transition trends, so these month-end values are reconstructed from real case detention and closure dates.');
      } else {
        throw trendsResult.status === 'rejected' ? trendsResult.reason : casesResult.reason;
      }
    } catch (requestError) {
      const message = errorMessage(requestError);
      setSeries([]);
      setError(message);
      toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadTrends, 0);
    return () => window.clearTimeout(timer);
  }, [loadTrends]);

  const hasData = useMemo(
    () => series.some((row) => row.backlog > 0 || row.averageWaitDays > 0),
    [series],
  );

  return (
    <main className="historical-trends" aria-labelledby="historical-trends-title">
      <header className="historical-trends__header">
        <div>
          <p className="historical-trends__eyebrow">Historical trends</p>
          <h1 id="historical-trends-title">System Trends</h1>
          <p>Aggregate patterns only. No names or personal case details are included.</p>
        </div>
        <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadTrends} disabled={loading}>
          Refresh
        </Button>
      </header>

      <section aria-labelledby="backlog-over-time-title">
        <div className="historical-trends__section-heading">
          <h2 id="backlog-over-time-title">Backlog Over Time</h2>
          {!loading && !error && <p>{sourceNote}</p>}
        </div>

        {loading ? (
          <div className="historical-trends__charts" aria-label="Loading historical trends">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} padding="lg"><Skeleton variant="text" width="50%" /><Skeleton variant="card" height={300} /></Card>
            ))}
          </div>
        ) : error ? (
          <Card padding="lg" className="historical-trends__error" role="alert">
            <AlertOctagon size={24} aria-hidden="true" />
            <div>
              <h2>Historical trends unavailable</h2>
              <p>{error}</p>
            </div>
            <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadTrends}>Try again</Button>
          </Card>
        ) : (
          <>
            <p className="historical-trends__scroll-hint">Scroll each chart horizontally to review all 12 months.</p>
            <div className="historical-trends__charts">
              <LineChart
                title="Total Awaiting-Trial Cases (last 12 months)"
                rows={series}
                valueKey="backlog"
                valueLabel="cases"
                tone="indigo"
              />
              <LineChart
                title="Average Wait Time (days, last 12 months)"
                rows={series}
                valueKey="averageWaitDays"
                valueLabel="days"
                tone="severe"
              />
            </div>
            {!hasData && <p className="historical-trends__empty" role="status">No historical case activity is available for this period.</p>}
          </>
        )}
      </section>
    </main>
  );
}

function LineChart({ title, rows, valueKey, valueLabel, tone }) {
  const points = pointsFor(rows, valueKey);
  const maximum = Math.max(1, ...rows.map((row) => row[valueKey]));
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(' ');

  return (
    <Card padding="lg" className={`historical-chart historical-chart--${tone}`}>
      <h3>{title}</h3>
      <div className="historical-chart__scroll" tabIndex="0" aria-label={`Scrollable chart: ${title}`}>
        <div className="historical-chart__canvas">
          <svg viewBox="0 0 744 272" role="img" aria-labelledby={`${valueKey}-chart-title ${valueKey}-chart-description`}>
            <title id={`${valueKey}-chart-title`}>{title}</title>
            <desc id={`${valueKey}-chart-description`}>Monthly values for the most recent 12-month period.</desc>
            {[48, 103, 157, 212].map((y) => <line key={y} className="historical-chart__grid-line" x1="56" y1={y} x2="688" y2={y} />)}
            <text x="48" y="52" textAnchor="end">{maximum.toLocaleString()}</text>
            <text x="48" y="216" textAnchor="end">0</text>
            <polyline className="historical-chart__line" points={polyline} />
            {points.map(({ x, y, row }, index) => (
              <g key={row.key}>
                <circle cx={x} cy={y} r="5">
                  <title>{`${row.label}: ${row[valueKey].toLocaleString()} ${valueLabel}`}</title>
                </circle>
                {(index % 3 === 0 || index === points.length - 1) && <text x={x} y="244" textAnchor="middle">{row.label}</text>}
              </g>
            ))}
          </svg>
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Value</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.key}><th scope="row">{row.label}</th><td>{row[valueKey]} {valueLabel}</td></tr>)}</tbody>
      </table>
    </Card>
  );
}
