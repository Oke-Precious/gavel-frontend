import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import { auditApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './SystemAuditLogPage.css';

const PAGE_SIZE = 12;

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function text(value, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimestamp(value) {
  const date = validDate(value);
  if (!date) return '-';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function userNameFrom(log) {
  const user = log?.user ?? log?.changedBy ?? log?.actor ?? log?.createdBy;
  if (typeof user === 'string') return user;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || user?.name || user?.email || log?.userName || log?.actorName || 'System';
}

function actionFrom(log) {
  return text(
    log?.action ??
      log?.event ??
      log?.type ??
      log?.status ??
      log?.newStatus ??
      log?.newValues?.status ??
      'Case update',
  );
}

function noteFrom(log) {
  return text(
    log?.note ??
      log?.comments ??
      log?.comment ??
      log?.reason ??
      log?.stallReason ??
      log?.changes?.note ??
      log?.newValues?.comments ??
      log?.newValues?.stallReason,
  );
}

function normalizeLog(log, index) {
  const timestamp = text(log?.createdAt ?? log?.updatedAt ?? log?.timestamp ?? log?.date, '');

  return {
    _id: text(log?._id ?? log?.id ?? `${log?.caseId ?? 'audit'}-${index}`),
    timestamp,
    timestampLabel: formatTimestamp(timestamp),
    user: userNameFrom(log),
    caseHashId: text(log?.caseHashId ?? log?.case?.hashId ?? log?.caseNumber),
    action: actionFrom(log),
    note: noteFrom(log),
  };
}

function errorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'The audit log service is temporarily unavailable. Please try again.';
  return error.response.data?.message ?? 'Unable to load the system audit log.';
}

export default function SystemAuditLogPage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFilter, setUserFilter] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const data = await auditApi.system();
      const normalized = listFrom(data, ['logs', 'items'])
        .map(normalizeLog)
        .sort((a, b) => (validDate(b.timestamp)?.getTime() ?? 0) - (validDate(a.timestamp)?.getTime() ?? 0));

      setLogs(normalized);
    } catch (requestError) {
      const message = errorMessage(requestError);
      setLogs([]);
      setError(message);
      if (!silent) toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadLogs, 0);
    return () => window.clearTimeout(timer);
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const cleanUser = userFilter.trim().toLowerCase();
    const cleanCase = caseFilter.trim().toLowerCase();
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return logs.filter((log) => {
      const timestamp = validDate(log.timestamp);
      const matchesUser = !cleanUser || log.user.toLowerCase().includes(cleanUser);
      const matchesCase = !cleanCase || log.caseHashId.toLowerCase().includes(cleanCase);
      const matchesStart = !start || (timestamp && timestamp >= start);
      const matchesEnd = !end || (timestamp && timestamp <= end);
      return matchesUser && matchesCase && matchesStart && matchesEnd;
    });
  }, [caseFilter, endDate, logs, startDate, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setUserFilter('');
    setCaseFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const columns = [
    { key: 'timestampLabel', label: 'Timestamp', sortable: false },
    { key: 'user', label: 'User', sortable: false },
    {
      key: 'caseHashId',
      label: 'Case Hash ID',
      sortable: false,
      render: (value) => <span className="system-audit-log__case-id">{value}</span>,
    },
    { key: 'action', label: 'Action', sortable: false },
    { key: 'note', label: 'Note', sortable: false },
  ];

  const filterSlot = (
    <div className="system-audit-log__filters" aria-label="System audit log filters">
      <div className="system-audit-log__search-wrap" role="search">
        <Search size={16} className="system-audit-log__search-icon" aria-hidden="true" />
        <input
          id="audit-user-filter"
          type="search"
          value={userFilter}
          onChange={(event) => {
            setUserFilter(event.target.value);
            setPage(1);
          }}
          placeholder="Filter by user"
          aria-label="Filter audit log by user"
        />
      </div>

      <div className="system-audit-log__search-wrap" role="search">
        <Search size={16} className="system-audit-log__search-icon" aria-hidden="true" />
        <input
          id="audit-case-filter"
          type="search"
          value={caseFilter}
          onChange={(event) => {
            setCaseFilter(event.target.value);
            setPage(1);
          }}
          placeholder="Filter by Case Hash ID"
          aria-label="Filter audit log by Case Hash ID"
        />
      </div>

      <label className="system-audit-log__date-field" htmlFor="audit-start-date">
        <span>From</span>
        <input
          id="audit-start-date"
          type="date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            setPage(1);
          }}
        />
      </label>

      <label className="system-audit-log__date-field" htmlFor="audit-end-date">
        <span>To</span>
        <input
          id="audit-end-date"
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
            setPage(1);
          }}
        />
      </label>

      <div className="system-audit-log__filter-actions">
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          Reset
        </Button>
        <Button type="button" variant="ghost" size="sm" iconLeft={RefreshCw} onClick={() => loadLogs(true)} disabled={loading}>
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <main className="system-audit-log" aria-labelledby="system-audit-log-title">
      <div className="system-audit-log__container">
        <header className="system-audit-log__header">
          <div>
            <p className="system-audit-log__eyebrow">System oversight</p>
            <h1 id="system-audit-log-title">System Audit Log</h1>
            <p>Review case-status activity across the platform without exposing personal case data.</p>
          </div>
        </header>

        <DataTable
          columns={columns}
          data={pageRows}
          loading={loading}
          error={error}
          rowIdKey="_id"
          filterSlot={filterSlot}
          emptyMessage="No audit entries match the selected filters."
          pagination={
            filteredLogs.length > PAGE_SIZE
              ? {
                  page: safePage,
                  totalPages,
                  totalItems: filteredLogs.length,
                  limit: PAGE_SIZE,
                  onPageChange: setPage,
                }
              : null
          }
        />

        {!loading && !error && (
          <p className="system-audit-log__count-line" aria-live="polite">
            Showing {pageRows.length} of {filteredLogs.length} audit {filteredLogs.length === 1 ? 'entry' : 'entries'}.
          </p>
        )}
      </div>
    </main>
  );
}
