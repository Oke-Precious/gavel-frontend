import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Search,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { casesApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { daysInCustody } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './DashboardPage.css';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'arrest', label: 'Arrest' },
  { value: 'charge_remand', label: 'Charge & Remand' },
  { value: 'dpp_adjournment', label: 'DPP Advice / Adjournment' },
  { value: 'trial_discharge', label: 'Trial or Discharge' },
];

const ALERT_OPTIONS = [
  { value: '', label: 'All Alert Levels' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'warning', label: 'Warning' },
  { value: 'severe', label: 'Severe Warning' },
  { value: 'critical', label: 'Critical' },
];

const PAGE_SIZE = 10;

/* Map raw backend alert level → StatusPill level key */
function normalizeAlert(raw) {
  if (!raw) return 'compliant';
  const s = String(raw).toLowerCase();
  if (s.includes('critical')) return 'critical';
  if (s.includes('severe') || s.includes('orange')) return 'severe';
  if (s.includes('warning') || s.includes('amber')) return 'warning';
  return 'compliant';
}

/* Map backend stage string → display label */
function stageLabel(raw) {
  if (!raw) return '—';
  const s = String(raw).toLowerCase().replace(/[_-]/g, ' ');
  if (s.includes('dpp') || s.includes('adjournment')) return 'DPP Advice / Adjournment';
  if (s.includes('charge') || s.includes('remand')) return 'Charge & Remand';
  if (s.includes('trial') || s.includes('discharge')) return 'Trial or Discharge';
  if (s.includes('arrest')) return 'Arrest';
  return raw;
}

/* Format ISO date to "Mar 12, 2026" */
function fmtDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val; // already formatted string
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* Derive summary stats from row array */
function deriveSummary(rows) {
  return {
    total: rows.length,
    warning: rows.filter((r) => r.alertLevel === 'warning').length,
    severe: rows.filter((r) => r.alertLevel === 'severe').length,
    critical: rows.filter((r) => r.alertLevel === 'critical').length,
  };
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, roleLabel } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  /* ── State ── */
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [page, setPage] = useState(1);

  /* ── Fetch cases from backend ── */
  const fetchCases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      // GET /cases — returns the officer's assigned cases
      const data = await casesApi.list({ limit: 200 });
      const items = Array.isArray(data) ? data : (data?.cases ?? data?.items ?? []);
      if (items.length === 0) {
        setAllRows([]);
      } else {
        const normalized = items.map((c) => ({
          _id: c._id,
          caseHashId: c.hashId ?? '—',
          offense: c.offenseCategory ?? c.title ?? '—',
          stage: stageLabel(c.stage ?? c.status),
          daysInCustody: c.detentionDate ? daysInCustody(c.detentionDate) : null,
          alertLevel: c.detentionDate
            ? getAlertLevel(daysInCustody(c.detentionDate)).level
            : c.alertLevel ? normalizeAlert(c.alertLevel) : null,
          nextHearing: fmtDate(c.nextHearingDate ?? c.nextHearing),
        }));
        setAllRows(normalized);
      }
    } catch (err) {
      setAllRows([]);
      const msg = !err?.response
        ? 'Network error — check your connection and try again.'
        : err.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : err.response?.data?.message ?? 'Could not load cases.';
      setError(msg);
      if (!silent) toastRef.current.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(fetchCases, 0);
    return () => window.clearTimeout(loadTimer);
  }, [fetchCases]);

  /* ── Derived: filtered + paginated rows ── */
  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      const searchLc = search.trim().toLowerCase();
      const matchSearch =
        !searchLc ||
        row.caseHashId.toLowerCase().includes(searchLc) ||
        row.offense.toLowerCase().includes(searchLc);

      const matchStage =
        !stageFilter ||
        row.stage.toLowerCase().replace(/[^a-z]/g, '').includes(
          stageFilter.replace(/_/g, '').toLowerCase()
        );

      const matchAlert = !alertFilter || row.alertLevel === alertFilter;

      return matchSearch && matchStage && matchAlert;
    });
  }, [allRows, search, stageFilter, alertFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Stats (from full allRows, not filtered) ── */
  const stats = useMemo(() => deriveSummary(allRows), [allRows]);

  /* ── Table columns ── */
  const columns = [
    {
      key: 'caseHashId',
      label: 'Case Hash ID',
      sortable: false,
      render: (val) => <span className="dash-table__hash">{val}</span>,
    },
    { key: 'offense', label: 'Offense', sortable: false },
    { key: 'stage', label: 'Stage', sortable: false },
    {
      key: 'daysInCustody',
      label: 'Days in Custody',
      sortable: false,
      render: (val) => (
        <span className="dash-table__days">
          {val == null ? '—' : `${val} ${val === 1 ? 'day' : 'days'}`}
        </span>
      ),
    },
    {
      key: 'alertLevel',
      label: 'Alert Level',
      sortable: false,
      render: (val) => val ? <StatusPill level={val} /> : '—',
    },
    {
      key: 'nextHearing',
      label: 'Next Hearing',
      sortable: false,
      render: (val) => val ?? <span className="dash-table__empty-cell">—</span>,
    },
    {
      key: '_id',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button
          className="dash-table__view-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/cases/${row._id}`);
          }}
          aria-label={`View case ${row.caseHashId}`}
        >
          View
        </button>
      ),
    },
  ];

  /* ── Filter slot ── */
  const filterSlot = (
    <div className="dash__filters">
      {/* Search */}
      <div className="dash__search-wrapper" role="search">
        <Search size={16} className="dash__search-icon" aria-hidden="true" />
        <input
          id="dash-search"
          type="search"
          className="dash__search-input"
          placeholder="Search by Case Hash ID"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search cases by Case Hash ID"
        />
      </div>

      {/* Stage filter */}
      <div className="dash__select-wrapper">
        <select
          id="dash-stage-filter"
          className="dash__select"
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          aria-label="Filter by stage"
        >
          {STAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="dash__select-icon" aria-hidden="true" />
      </div>

      {/* Alert level filter */}
      <div className="dash__select-wrapper">
        <select
          id="dash-alert-filter"
          className="dash__select"
          value={alertFilter}
          onChange={(e) => { setAlertFilter(e.target.value); setPage(1); }}
          aria-label="Filter by alert level"
        >
          {ALERT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="dash__select-icon" aria-hidden="true" />
      </div>

      {/* Refresh */}
      <Button
        variant="ghost"
        size="sm"
        iconLeft={RefreshCw}
        onClick={() => fetchCases(true)}
        aria-label="Refresh cases"
        className="dash__refresh-btn"
      >
        Refresh
      </Button>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="dash">
      {/* ── Page header ── */}
      <div className="dash__header">
        <div className="dash__header-left">
          <h1 className="dash__title">My Caseload</h1>
        </div>
        <div className="dash__header-right">
          <div className="dash__persona" aria-label={`Current role: ${roleLabel}`}>
            <div className="dash__persona-btn">
              <span className="dash__persona-label-text">Viewing as:</span>
              <span className="dash__persona-current">{roleLabel}</span>
            </div>
          </div>

          {/* User chip */}
          <div className="dash__user-chip">
            <div className="dash__avatar" aria-hidden="true">
              {user?.firstName?.[0] ?? 'A'}{user?.lastName?.[0] ?? 'E'}
            </div>
            <div className="dash__user-info">
              <span className="dash__user-name">
                {user?.firstName ?? 'Amaka'} {user?.lastName ?? 'Eze'}
              </span>
              <span className="dash__user-role">{roleLabel ?? 'Legal Aid Officer'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash__stats" aria-label="Case summary statistics">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card stat-card--skeleton">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="card" height={36} width="40%" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              id="stat-total"
              icon={<Briefcase size={20} strokeWidth={1.75} />}
              label="Total Cases"
              value={stats.total}
              variant="default"
            />
            <StatCard
              id="stat-warning"
              icon={<AlertTriangle size={20} strokeWidth={1.75} />}
              label="Warning"
              value={stats.warning}
              variant="warning"
            />
            <StatCard
              id="stat-severe"
              icon={<AlertOctagon size={20} strokeWidth={1.75} />}
              label="Severe Warning"
              value={stats.severe}
              variant="severe"
            />
            <StatCard
              id="stat-critical"
              icon={<XCircle size={20} strokeWidth={1.75} />}
              label="Critical"
              value={stats.critical}
              variant="critical"
            />
          </>
        )}
      </div>

      {/* ── Data table ── */}
      <div className="dash__table-section">
        <DataTable
          columns={columns}
          data={pageRows}
          loading={loading}
          error={error ? error : null}
          rowIdKey="_id"
          filterSlot={filterSlot}
          emptyMessage="No cases match your filters."
          pagination={
            filtered.length > PAGE_SIZE
              ? {
                  page: safePage,
                  totalPages,
                  totalItems: filtered.length,
                  limit: PAGE_SIZE,
                  onPageChange: (p) => setPage(p),
                }
              : null
          }
          onRowClick={(row) => navigate(`/cases/${row._id}`)}
        />

        {/* Always-visible count line */}
        {!loading && !error && (
          <p className="dash__count-line" aria-live="polite">
            Showing {pageRows.length} of {filtered.length} case{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== allRows.length && ` (filtered from ${allRows.length})`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   StatCard sub-component
───────────────────────────────────────────── */
function StatCard({ id, icon, label, value, variant }) {
  return (
    <div id={id} className={`stat-card stat-card--${variant}`} role="figure" aria-label={`${label}: ${value}`}>
      <div className="stat-card__header">
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}
