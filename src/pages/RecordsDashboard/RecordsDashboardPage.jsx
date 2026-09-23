import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  AlertTriangle,
  ChevronDown,
  FolderOpen,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { casesApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import '../Dashboard/DashboardPage.css';
import './RecordsDashboardPage.css';

const CUSTODY_FILTERS = [
  { value: '', label: 'All Custody Statuses' },
  { value: 'in_custody', label: 'In Custody' },
  { value: 'released', label: 'Released' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'unknown', label: 'Unknown' },
];

const LOCATION_FILTERS = [
  { value: '', label: 'All File Locations' },
  { value: 'provided', label: 'Location Provided' },
  { value: 'missing', label: 'Missing Location' },
];

const PAGE_SIZE = 10;

function getCaseHashId(caseRecord) {
  return caseRecord.hashId ?? caseRecord.caseHashId ?? caseRecord.caseNumber ?? '—';
}

function getFileLocation(caseRecord) {
  return (
    caseRecord.fileLocation ||
    caseRecord.recordsOffice ||
    caseRecord.physicalFileLocation ||
    caseRecord.custodyFileLocation ||
    (caseRecord.court ? `${caseRecord.court} Records Office` : 'Not provided')
  );
}

function normalizeCustodyStatus(caseRecord) {
  const raw = String(caseRecord.custodyStatus ?? caseRecord.detentionStatus ?? caseRecord.status ?? '').toLowerCase();
  const stage = String(caseRecord.stage ?? '').toLowerCase();

  if (raw.includes('transfer') || stage.includes('transfer')) {
    return { key: 'transferred', label: 'Transferred', tone: 'neutral' };
  }

  if (
    raw.includes('release') ||
    raw.includes('resolved') ||
    raw.includes('discharge') ||
    raw.includes('closed') ||
    stage.includes('discharge')
  ) {
    return { key: 'released', label: 'Released', tone: 'compliant' };
  }

  if (raw || caseRecord.detentionDate || stage.includes('remand') || stage.includes('trial')) {
    return { key: 'in_custody', label: 'In Custody', tone: 'critical' };
  }

  return { key: 'unknown', label: 'Unknown', tone: 'neutral' };
}

function daysSinceLastUpdate(caseRecord) {
  const rawDate =
    caseRecord.lastStatusUpdate ||
    caseRecord.statusUpdatedAt ||
    caseRecord.updatedAt ||
    caseRecord.lastUpdatedAt ||
    caseRecord.createdAt;
  const date = new Date(rawDate);

  if (!rawDate || Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getErrorMessage(error) {
  if (!error?.response) {
    return 'Network error — check your connection and try again.';
  }

  if (error.response.status >= 500) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }

  return error.response?.data?.message ?? 'Could not load file tracking records.';
}

function deriveSummary(rows) {
  return {
    total: rows.length,
    inCustody: rows.filter((row) => row.custodyKey === 'in_custody').length,
    missingLocation: rows.filter((row) => row.fileLocation === 'Not provided').length,
    needsUpdate: rows.filter((row) => row.daysSinceLastUpdate == null || row.daysSinceLastUpdate > 7).length,
  };
}

export default function RecordsDashboardPage() {
  const navigate = useNavigate();
  const { user, roleLabel } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [custodyFilter, setCustodyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchCases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      // Real backend endpoint: GET /cases
      const data = await casesApi.list({ limit: 200 });
      const items = Array.isArray(data) ? data : (data?.cases ?? data?.items ?? []);

      const normalized = items.map((caseRecord) => {
        const custodyStatus = normalizeCustodyStatus(caseRecord);
        const fileLocation = getFileLocation(caseRecord);
        const daysSinceUpdate = daysSinceLastUpdate(caseRecord);

        return {
          _id: caseRecord._id,
          caseHashId: getCaseHashId(caseRecord),
          fileLocation,
          custodyKey: custodyStatus.key,
          custodyStatus: custodyStatus.label,
          custodyTone: custodyStatus.tone,
          daysSinceLastUpdate: daysSinceUpdate,
        };
      });

      setAllRows(normalized);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setAllRows([]);
      setError(message);
      if (!silent) toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(fetchCases, 0);
    return () => window.clearTimeout(loadTimer);
  }, [fetchCases]);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        row.caseHashId.toLowerCase().includes(query) ||
        row.fileLocation.toLowerCase().includes(query);

      const matchesCustody = !custodyFilter || row.custodyKey === custodyFilter;
      const matchesLocation =
        !locationFilter ||
        (locationFilter === 'missing'
          ? row.fileLocation === 'Not provided'
          : row.fileLocation !== 'Not provided');

      return matchesSearch && matchesCustody && matchesLocation;
    });
  }, [allRows, custodyFilter, locationFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const stats = useMemo(() => deriveSummary(allRows), [allRows]);

  const columns = [
    {
      key: 'caseHashId',
      label: 'Case Hash ID',
      sortable: false,
      render: (value) => <span className="dash-table__hash">{value}</span>,
    },
    {
      key: 'fileLocation',
      label: 'File Location',
      sortable: false,
      render: (value) => (
        <span className={value === 'Not provided' ? 'dash-table__empty-cell' : 'records-table__location'}>
          {value}
        </span>
      ),
    },
    {
      key: 'custodyStatus',
      label: 'Custody Status',
      sortable: false,
      render: (value, row) => <Badge tone={row.custodyTone}>{value}</Badge>,
    },
    {
      key: 'daysSinceLastUpdate',
      label: 'Days Since Last Update',
      sortable: false,
      render: (value) => (
        <span className="dash-table__days">
          {value == null ? '—' : `${value} ${value === 1 ? 'day' : 'days'}`}
        </span>
      ),
    },
    {
      key: '_id',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button
          type="button"
          className="dash-table__view-btn"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/cases/${row._id}`);
          }}
          aria-label={`Update case ${row.caseHashId}`}
        >
          Update
        </button>
      ),
    },
  ];

  const filterSlot = (
    <div className="dash__filters">
      <div className="dash__search-wrapper" role="search">
        <Search size={16} className="dash__search-icon" aria-hidden="true" />
        <input
          id="records-search"
          type="search"
          className="dash__search-input"
          placeholder="Search by Case Hash ID or file location"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Search records by Case Hash ID or file location"
        />
      </div>

      <div className="dash__select-wrapper">
        <select
          id="records-custody-filter"
          className="dash__select"
          value={custodyFilter}
          onChange={(event) => {
            setCustodyFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by custody status"
        >
          {CUSTODY_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="dash__select-icon" aria-hidden="true" />
      </div>

      <div className="dash__select-wrapper">
        <select
          id="records-location-filter"
          className="dash__select"
          value={locationFilter}
          onChange={(event) => {
            setLocationFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by file location availability"
        >
          {LOCATION_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="dash__select-icon" aria-hidden="true" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        iconLeft={RefreshCw}
        onClick={() => fetchCases(true)}
        aria-label="Refresh file tracking records"
        className="dash__refresh-btn"
      >
        Refresh
      </Button>
    </div>
  );

  return (
    <div className="dash records-dash">
      <div className="dash__header">
        <div className="dash__header-left">
          <h1 className="dash__title">File Tracking</h1>
        </div>

        <div className="dash__header-right">
          <div className="dash__persona" aria-label={`Current role: ${roleLabel ?? 'Records Officer'}`}>
            <div className="dash__persona-btn">
              <span className="dash__persona-label-text">Viewing as:</span>
              <span className="dash__persona-current">{roleLabel ?? 'Records Officer'}</span>
            </div>
          </div>

          <div className="dash__user-chip">
            <div className="dash__avatar" aria-hidden="true">
              {user?.firstName?.[0] ?? 'I'}{user?.lastName?.[0] ?? 'M'}
            </div>
            <div className="dash__user-info">
              <span className="dash__user-name">
                {user?.firstName ?? 'Ibrahim'} {user?.lastName ?? 'Musa'}
              </span>
              <span className="dash__user-role">{roleLabel ?? 'Records Officer'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash__stats" aria-label="File tracking summary statistics">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card stat-card--skeleton">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="card" height={36} width="40%" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<Archive size={20} strokeWidth={1.75} />}
              label="Tracked Files"
              value={stats.total}
              variant="default"
            />
            <StatCard
              icon={<FolderOpen size={20} strokeWidth={1.75} />}
              label="In Custody"
              value={stats.inCustody}
              variant="critical"
            />
            <StatCard
              icon={<MapPin size={20} strokeWidth={1.75} />}
              label="Missing Location"
              value={stats.missingLocation}
              variant="warning"
            />
            <StatCard
              icon={<AlertTriangle size={20} strokeWidth={1.75} />}
              label="Needs Update"
              value={stats.needsUpdate}
              variant="severe"
            />
          </>
        )}
      </div>

      <div className="dash__table-section">
        <DataTable
          columns={columns}
          data={pageRows}
          loading={loading}
          error={error}
          rowIdKey="_id"
          filterSlot={filterSlot}
          emptyMessage="No file tracking records match your filters."
          pagination={
            filteredRows.length > PAGE_SIZE
              ? {
                  page: safePage,
                  totalPages,
                  totalItems: filteredRows.length,
                  limit: PAGE_SIZE,
                  onPageChange: (nextPage) => setPage(nextPage),
                }
              : null
          }
          onRowClick={(row) => navigate(`/cases/${row._id}`)}
        />

        {!loading && !error && (
          <p className="dash__count-line" aria-live="polite">
            Showing {pageRows.length} of {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
            {filteredRows.length !== allRows.length && ` (filtered from ${allRows.length})`}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, variant }) {
  return (
    <div className={`stat-card stat-card--${variant}`} role="figure" aria-label={`${label}: ${value}`}>
      <div className="stat-card__header">
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}
