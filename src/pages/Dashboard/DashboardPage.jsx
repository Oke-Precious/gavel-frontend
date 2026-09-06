import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Search,
  ChevronDown,
  Bell,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { casesApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
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

const PERSONA_OPTIONS = [
  { value: 'judge', label: 'Legal Aid Officer' },
  { value: 'clerk', label: 'Records Officer' },
  { value: 'admin', label: 'Admin' },
  { value: 'lawyer', label: 'Volunteer Lawyer' },
  { value: 'public', label: 'Public Observer' },
];

const PAGE_SIZE = 10;

/* Fallback sample rows shown when the backend has no data or returns an error */
const SAMPLE_ROWS = [
  {
    _id: 'LA-2026-0483',
    caseHashId: 'LA-2026-0483',
    offense: 'Theft',
    stage: 'DPP Advice / Adjournment',
    daysInCustody: 142,
    alertLevel: 'severe',
    nextHearing: 'Mar 12, 2026',
  },
  {
    _id: 'KN-2025-1187',
    caseHashId: 'KN-2025-1187',
    offense: 'Assault',
    stage: 'Charge & Remand',
    daysInCustody: 31,
    alertLevel: 'warning',
    nextHearing: 'Feb 20, 2026',
  },
  {
    _id: 'RV-2026-0092',
    caseHashId: 'RV-2026-0092',
    offense: 'Drug Possession',
    stage: 'Arrest',
    daysInCustody: 6,
    alertLevel: 'compliant',
    nextHearing: 'Feb 28, 2026',
  },
  {
    _id: 'EN-2024-2201',
    caseHashId: 'EN-2024-2201',
    offense: 'Fraud',
    stage: 'DPP Advice / Adjournment',
    daysInCustody: 210,
    alertLevel: 'critical',
    nextHearing: null,
  },
];

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

  /* ── State ── */
  const [allRows, setAllRows] = useState([]);         // full dataset from backend (or sample)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [page, setPage] = useState(1);

  const [personaOpen, setPersonaOpen] = useState(false);
  const [personaLabel, setPersonaLabel] = useState('Legal Aid Officer');
  const personaRef = useRef(null);

  const [notifCount] = useState(3); // mocked

  /* ── Fetch cases from backend ── */
  const fetchCases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      // GET /cases — returns the officer's assigned cases
      const data = await casesApi.list({ limit: 200 });
      const items = Array.isArray(data) ? data : (data?.cases ?? data?.items ?? []);
      if (items.length === 0) {
        // Fall back to sample data for demo/portfolio viewing
        setAllRows(SAMPLE_ROWS);
      } else {
        const normalized = items.map((c) => ({
          _id: c._id ?? c.caseHashId ?? c.caseNumber,
          caseHashId: c.caseHashId ?? c.caseNumber ?? '—',
          offense: c.offenseCategory ?? c.offense ?? '—',
          stage: stageLabel(c.stage ?? c.status),
          daysInCustody: c.daysInCustody ?? c.detentionDays ?? 0,
          alertLevel: normalizeAlert(c.alertLevel ?? c.alert),
          nextHearing: fmtDate(c.nextHearingDate ?? c.nextHearing),
        }));
        setAllRows(normalized);
      }
    } catch (err) {
      // If network/auth error — show sample data + toast so the UI is never a dead end
      setAllRows(SAMPLE_ROWS);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Could not load cases.';
      setError(msg);
      if (!silent) toast.error(`Network error: ${msg} — showing sample data.`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  /* ── Close persona dropdown on outside click ── */
  useEffect(() => {
    function handleClick(e) {
      if (personaRef.current && !personaRef.current.contains(e.target)) {
        setPersonaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setPage(1);
  }, [search, stageFilter, alertFilter]);

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
        <span className="dash-table__days">{val} {val === 1 ? 'day' : 'days'}</span>
      ),
    },
    {
      key: 'alertLevel',
      label: 'Alert Level',
      sortable: false,
      render: (val) => <StatusPill level={val} />,
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
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search cases by Case Hash ID"
        />
      </div>

      {/* Stage filter */}
      <div className="dash__select-wrapper">
        <select
          id="dash-stage-filter"
          className="dash__select"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
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
          onChange={(e) => setAlertFilter(e.target.value)}
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
          {/* Persona Switcher */}
          <div className="dash__persona" ref={personaRef}>
            <button
              id="persona-switcher-btn"
              className="dash__persona-btn"
              onClick={() => setPersonaOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={personaOpen}
              aria-label="Switch persona"
            >
              <span className="dash__persona-label-text">Viewing as:</span>
              <span className="dash__persona-current">{personaLabel}</span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`dash__persona-chevron${personaOpen ? ' dash__persona-chevron--open' : ''}`}
                aria-hidden="true"
              />
            </button>
            {personaOpen && (
              <ul
                className="dash__persona-menu"
                role="listbox"
                aria-label="Select persona"
              >
                {PERSONA_OPTIONS.map((p) => (
                  <li
                    key={p.value}
                    role="option"
                    aria-selected={personaLabel === p.label}
                    className={`dash__persona-option${personaLabel === p.label ? ' dash__persona-option--active' : ''}`}
                    onClick={() => {
                      setPersonaLabel(p.label);
                      setPersonaOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setPersonaLabel(p.label);
                        setPersonaOpen(false);
                      }
                    }}
                    tabIndex={0}
                  >
                    {p.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notification bell */}
          <button
            className="dash__notif-btn"
            aria-label={`${notifCount} unread notifications`}
          >
            <Bell size={20} strokeWidth={1.75} />
            {notifCount > 0 && (
              <span className="dash__notif-badge" aria-hidden="true">
                {notifCount}
              </span>
            )}
          </button>

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
