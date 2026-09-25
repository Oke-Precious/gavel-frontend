import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { analyticsApi, casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './BottleneckHeatmapPage.css';

const STATES = ['Lagos', 'Kano', 'Rivers', 'Enugu', 'Kaduna', 'Ogun'];
const STALL_REASONS = [
  'Awaiting DPP Advice',
  'File in Transit',
  'Court Adjournment',
  'Missing Counsel',
  'Other',
];

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function canonicalValue(value, options) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === normalized) ?? null;
}

function extractState(caseRecord) {
  const direct = canonicalValue(caseRecord?.state, STATES);
  if (direct) return direct;

  const description = String(caseRecord?.description ?? '');
  const descriptionState = description.match(/State jurisdiction:\s*([^\n]+)/i)?.[1]?.trim();
  const fromDescription = canonicalValue(descriptionState, STATES);
  if (fromDescription) return fromDescription;

  const court = String(caseRecord?.court ?? '').toLowerCase();
  return STATES.find((state) => court.includes(state.toLowerCase())) ?? null;
}

function extractStallReason(source) {
  const candidates = [
    source?.stallReason,
    source?.reason,
    source?.changes?.stallReason,
    source?.newValues?.stallReason,
    source?.metadata?.stallReason,
  ];
  for (const candidate of candidates) {
    const reason = canonicalValue(candidate, STALL_REASONS);
    if (reason) return reason;
  }
  return null;
}

function emptyMatrix() {
  return Object.fromEntries(
    STATES.map((state) => [state, Object.fromEntries(STALL_REASONS.map((reason) => [reason, 0]))]),
  );
}

function addCount(matrix, state, reason, count = 1) {
  if (!state || !reason) return;
  matrix[state][reason] += Number.isFinite(Number(count)) ? Number(count) : 0;
}

function aggregateDirectHeatmap(data) {
  const matrix = emptyMatrix();
  let matchedRows = 0;

  listFrom(data, ['heatmap', 'rows']).forEach((row) => {
    const state = canonicalValue(row?.state ?? row?._id?.state, STATES);
    const reason = canonicalValue(row?.stallReason ?? row?._id?.stallReason, STALL_REASONS);
    if (!state || !reason) return;
    addCount(matrix, state, reason, row?.count ?? row?.total ?? 0);
    matchedRows += 1;
  });

  return { matrix, matchedRows };
}

async function addAuditHistory(matrix, cases) {
  const unresolved = [];

  cases.forEach((caseRecord) => {
    const state = extractState(caseRecord);
    if (!state) return;

    const embeddedHistory = listFrom(caseRecord?.statusHistory, ['logs', 'history']);
    if (embeddedHistory.length) {
      embeddedHistory.forEach((entry) => addCount(matrix, state, extractStallReason(entry)));
      return;
    }

    const currentReason = extractStallReason(caseRecord);
    if (currentReason) {
      addCount(matrix, state, currentReason);
      return;
    }

    const id = caseRecord?._id ?? caseRecord?.id;
    if (id) unresolved.push({ id, state });
  });

  let failedAudits = 0;
  const batchSize = 12;
  for (let index = 0; index < unresolved.length; index += batchSize) {
    const batch = unresolved.slice(index, index + batchSize);
    const results = await Promise.allSettled(batch.map((item) => casesApi.auditLog(item.id)));
    results.forEach((result, resultIndex) => {
      if (result.status === 'rejected') {
        failedAudits += 1;
        return;
      }
      const state = batch[resultIndex].state;
      listFrom(result.value, ['logs', 'history', 'items']).forEach((entry) => {
        addCount(matrix, state, extractStallReason(entry));
      });
    });
  }

  return failedAudits;
}

function errorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'The analytics service is temporarily unavailable. Please try again.';
  return error.response.data?.message ?? 'Unable to load the bottleneck heatmap.';
}

function intensity(value, maximum) {
  if (value <= 0 || maximum <= 0) return 'none';
  const ratio = value / maximum;
  if (ratio <= 0.25) return 'compliant';
  if (ratio <= 0.5) return 'warning';
  if (ratio <= 0.75) return 'severe';
  return 'critical';
}

export default function BottleneckHeatmapPage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [matrix, setMatrix] = useState(emptyMatrix);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partialWarning, setPartialWarning] = useState('');

  const loadHeatmap = useCallback(async () => {
    setLoading(true);
    setError('');
    setPartialWarning('');

    try {
      const [heatmapData, casesData] = await Promise.all([
        analyticsApi.heatmap(),
        casesApi.list({ page: 1, limit: 200 }),
      ]);
      const direct = aggregateDirectHeatmap(heatmapData);

      if (direct.matchedRows > 0) {
        setMatrix(direct.matrix);
      } else {
        const nextMatrix = emptyMatrix();
        const cases = listFrom(casesData, ['cases', 'items']);
        const failedAudits = await addAuditHistory(nextMatrix, cases);
        setMatrix(nextMatrix);
        if (failedAudits > 0) {
          setPartialWarning(`${failedAudits} case audit ${failedAudits === 1 ? 'record was' : 'records were'} unavailable, so these totals may be incomplete.`);
        }
      }
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadHeatmap, 0);
    return () => window.clearTimeout(timer);
  }, [loadHeatmap]);

  const maximum = useMemo(
    () => Math.max(0, ...STATES.flatMap((state) => STALL_REASONS.map((reason) => matrix[state][reason]))),
    [matrix],
  );
  const total = useMemo(
    () => STATES.reduce(
      (stateTotal, state) => stateTotal + STALL_REASONS.reduce(
        (reasonTotal, reason) => reasonTotal + matrix[state][reason],
        0,
      ),
      0,
    ),
    [matrix],
  );

  return (
    <main className="bottleneck" aria-labelledby="bottleneck-title">
      <header className="bottleneck__header">
        <div>
          <p className="bottleneck__eyebrow">Agency bottleneck heatmap</p>
          <h1 id="bottleneck-title">Where Cases Stall</h1>
          <p>System-wide status updates grouped by state and stall reason. No names or personal case details are shown.</p>
        </div>
        <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadHeatmap} disabled={loading}>
          Refresh
        </Button>
      </header>

      {loading ? (
        <Card padding="lg" aria-label="Loading bottleneck heatmap">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="card" height={360} />
        </Card>
      ) : error ? (
        <Card padding="lg" className="bottleneck__error" role="alert">
          <AlertOctagon size={24} aria-hidden="true" />
          <div>
            <h2>Heatmap unavailable</h2>
            <p>{error}</p>
          </div>
          <Button variant="secondary" size="md" iconLeft={RefreshCw} onClick={loadHeatmap}>
            Try again
          </Button>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="bottleneck__summary">
            <div>
              <h2>Where Cases Stall</h2>
              <p>{total.toLocaleString()} recorded stall {total === 1 ? 'event' : 'events'} across the six reporting states.</p>
            </div>
            <div className="bottleneck__legend" aria-label="Heatmap severity legend">
              <Legend tone="compliant" label="Compliant" />
              <Legend tone="warning" label="Warning" />
              <Legend tone="severe" label="Severe Warning" />
              <Legend tone="critical" label="Critical" />
            </div>
          </div>

          {partialWarning && <p className="bottleneck__warning" role="status">{partialWarning}</p>}
          <p className="bottleneck__scroll-hint">Scroll horizontally to view every stall reason.</p>

          <div className="bottleneck__table-wrap" tabIndex="0" aria-label="Scrollable bottleneck heatmap">
            <table className="bottleneck__table">
              <caption className="sr-only">Case stall events by Nigerian state and stall reason</caption>
              <thead>
                <tr>
                  <th scope="col">State</th>
                  {STALL_REASONS.map((reason) => <th key={reason} scope="col">{reason}</th>)}
                </tr>
              </thead>
              <tbody>
                {STATES.map((state) => (
                  <tr key={state}>
                    <th scope="row">{state}</th>
                    {STALL_REASONS.map((reason) => {
                      const value = matrix[state][reason];
                      const tone = intensity(value, maximum);
                      return (
                        <td key={reason} className={`bottleneck__cell bottleneck__cell--${tone}`}>
                          <span aria-label={`${state}, ${reason}: ${value} ${value === 1 ? 'case' : 'cases'}`}>
                            {value.toLocaleString()}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total === 0 && (
            <p className="bottleneck__empty" role="status">
              No stall reasons have been recorded for these states yet.
            </p>
          )}
        </Card>
      )}
    </main>
  );
}

function Legend({ tone, label }) {
  return <span><i className={`bottleneck__legend-swatch bottleneck__legend-swatch--${tone}`} aria-hidden="true" />{label}</span>;
}
