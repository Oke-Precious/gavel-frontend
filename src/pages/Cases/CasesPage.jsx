import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { casesApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { daysInCustody } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './CasesPage.css';

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

function normalizeAlert(raw) {
  if (!raw) return 'compliant';

  const value = String(raw).toLowerCase();
  if (value.includes('critical')) return 'critical';
  if (value.includes('severe') || value.includes('orange')) return 'severe';
  if (value.includes('warning') || value.includes('amber')) return 'warning';
  return 'compliant';
}

function normalizeStage(raw) {
  if (!raw) return '—';

  const value = String(raw).toLowerCase().replace(/[_-]/g, ' ');
  if (value.includes('trial') || value.includes('discharge')) return 'Trial or Discharge';
  if (value.includes('dpp') || value.includes('adjournment')) return 'DPP Advice / Adjournment';
  if (value.includes('charge') || value.includes('remand') || value.includes('pre trial')) return 'Charge & Remand';
  if (value.includes('arrest')) return 'Arrest';
  return raw;
}

function normalizeStageFilterValue(stage) {
  return String(stage ?? '').toLowerCase().replace(/[^a-z]/g, '');
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function extractState(caseRecord) {
  if (caseRecord.state) return caseRecord.state;

  const description = String(caseRecord.description ?? '');
  const match = description.match(/State jurisdiction:\s*([^\n]+)/i);
  return match?.[1]?.trim() || 'Not provided';
}

function uniqueOptions(rows, key) {
  return Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter((value) => value && value !== 'Not provided' && value !== '—'),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function getErrorMessage(error) {
  if (!error?.response) {
    return 'Network error — check your connection and try again.';
  }

  if (error.response.status >= 500) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }

  return error.response?.data?.message ?? 'Unable to load cases.';
}

export default function CasesPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadCases = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      // Real backend endpoint: GET /cases
      const data = await casesApi.list({ limit: 200 });
      const items = Array.isArray(data) ? data : (data?.cases ?? data?.items ?? []);

      const normalized = items.map((caseRecord) => {
        const custodyDays = caseRecord.detentionDate ? daysInCustody(caseRecord.detentionDate) : null;

        return {
          _id: caseRecord._id,
          caseHashId: caseRecord.hashId ?? caseRecord.caseHashId ?? caseRecord.caseNumber ?? '—',
          offense: caseRecord.offenseCategory ?? caseRecord.offense ?? caseRecord.title ?? '—',
          stage: normalizeStage(caseRecord.stage ?? caseRecord.status),
          state: extractState(caseRecord),
          court: caseRecord.court ?? 'Not provided',
          daysInCustody: custodyDays,
          alertLevel: custodyDays != null
            ? getAlertLevel(custodyDays).level
            : caseRecord.alertLevel ? normalizeAlert(caseRecord.alertLevel) : null,
          nextHearing: formatDate(caseRecord.nextHearingDate ?? caseRecord.nextHearing),
        };
      });

      setCases(normalized);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setCases([]);
      setError(message);
      if (!silent) toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadCases, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadCases]);

  const stateOptions = useMemo(() => uniqueOptions(cases, 'state'), [cases]);
  const courtOptions = useMemo(() => uniqueOptions(cases, 'court'), [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter((row) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        row.caseHashId.toLowerCase().includes(query) ||
        row.offense.toLowerCase().includes(query) ||
        row.court.toLowerCase().includes(query) ||
        row.state.toLowerCase().includes(query);

      const matchesStage =
        !stageFilter ||
        normalizeStageFilterValue(row.stage).includes(
          stageFilter.replace(/_/g, '').toLowerCase(),
        );

      const matchesAlert = !alertFilter || row.alertLevel === alertFilter;
      const matchesState = !stateFilter || row.state === stateFilter;
      const matchesCourt = !courtFilter || row.court === courtFilter;

      return matchesSearch && matchesStage && matchesAlert && matchesState && matchesCourt;
    });
  }, [alertFilter, cases, courtFilter, search, stageFilter, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredCases.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setStageFilter('');
    setAlertFilter('');
    setStateFilter('');
    setCourtFilter('');
    setPage(1);
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();

    if (!importFile) {
      toast.warning('Please select a CSV file to upload.');
      return;
    }

    setIsImporting(true);

    try {
      // Real backend endpoint: POST /cases/bulk-import
      await casesApi.bulkImport(importFile);
      toast.success(`Successfully imported cases from "${importFile.name}".`);
      setIsImportModalOpen(false);
      setImportFile(null);
      await loadCases(true);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError).replace('load cases', 'import cases'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info('Preparing CSV export download...');
      // Real backend endpoint: GET /cases/export?format=csv
      const blob = await casesApi.export('csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'gavel_cases_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV export downloaded successfully.');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError).replace('load cases', 'export cases'));
    }
  };

  const columns = [
    {
      key: 'caseHashId',
      label: 'Case Hash ID',
      sortable: false,
      render: (value) => <span className="cases-table__hash">{value}</span>,
    },
    { key: 'offense', label: 'Offense', sortable: false },
    { key: 'stage', label: 'Stage', sortable: false },
    {
      key: 'daysInCustody',
      label: 'Days in Custody',
      sortable: false,
      render: (value) => (
        <span className="cases-table__days">
          {value == null ? '—' : `${value} ${value === 1 ? 'day' : 'days'}`}
        </span>
      ),
    },
    {
      key: 'alertLevel',
      label: 'Alert Level',
      sortable: false,
      render: (value) => value ? <StatusPill level={value} /> : '—',
    },
    {
      key: 'nextHearing',
      label: 'Next Hearing',
      sortable: false,
      render: (value) => value ?? <span className="cases-table__empty-cell">—</span>,
    },
    {
      key: '_id',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button
          type="button"
          className="cases-table__view-btn"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/cases/${row._id}`);
          }}
          aria-label={`View case ${row.caseHashId}`}
        >
          View
        </button>
      ),
    },
  ];

  const filterSlot = (
    <div className="cases-page__filters" aria-label="Advanced case filters">
      <div className="cases-page__search-wrap" role="search">
        <Search size={16} className="cases-page__search-icon" aria-hidden="true" />
        <input
          id="cases-search"
          type="search"
          className="cases-page__search-input"
          placeholder="Search by Case Hash ID, offense, state, or court"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Search cases"
        />
      </div>

      <FilterSelect
        id="cases-stage-filter"
        label="Filter by stage"
        value={stageFilter}
        onChange={(value) => {
          setStageFilter(value);
          setPage(1);
        }}
        options={STAGE_OPTIONS}
      />

      <FilterSelect
        id="cases-alert-filter"
        label="Filter by alert level"
        value={alertFilter}
        onChange={(value) => {
          setAlertFilter(value);
          setPage(1);
        }}
        options={ALERT_OPTIONS}
      />

      <FilterSelect
        id="cases-state-filter"
        label="Filter by state"
        value={stateFilter}
        onChange={(value) => {
          setStateFilter(value);
          setPage(1);
        }}
        options={[
          { value: '', label: 'All States' },
          ...stateOptions.map((state) => ({ value: state, label: state })),
        ]}
      />

      <FilterSelect
        id="cases-court-filter"
        label="Filter by court"
        value={courtFilter}
        onChange={(value) => {
          setCourtFilter(value);
          setPage(1);
        }}
        options={[
          { value: '', label: 'All Courts' },
          ...courtOptions.map((court) => ({ value: court, label: court })),
        ]}
      />

      <div className="cases-page__filter-actions">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetFilters}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconLeft={RefreshCw}
          onClick={() => loadCases(true)}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div className="cases-page">
      <div className="container cases-page__container">
        <div className="cases-page__header">
          <div className="cases-page__header-left">
            <h1 className="cases-page__title">All Cases</h1>
            <p className="cases-page__subtitle">
              Full case list with advanced filters for stage, alert level, state, and court.
            </p>
          </div>

          <div className="cases-page__header-actions">
            {hasRole('admin', 'clerk') && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                iconLeft={Upload}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import Cases
              </Button>
            )}
            {hasRole('admin', 'judge') && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                iconLeft={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            )}
            {hasRole('admin', 'clerk') && (
              <Button
                type="button"
                variant="primary"
                size="md"
                iconLeft={Plus}
                onClick={() => navigate('/cases/new')}
              >
                Add New Case
              </Button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pageRows}
          loading={loading}
          error={error}
          rowIdKey="_id"
          filterSlot={filterSlot}
          emptyMessage="No cases match your filters."
          pagination={
            filteredCases.length > PAGE_SIZE
              ? {
                  page: safePage,
                  totalPages,
                  totalItems: filteredCases.length,
                  limit: PAGE_SIZE,
                  onPageChange: (nextPage) => setPage(nextPage),
                }
              : null
          }
          onRowClick={(row) => navigate(`/cases/${row._id}`)}
        />

        {!loading && !error && (
          <p className="cases-page__count-line" aria-live="polite">
            Showing {pageRows.length} of {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
            {filteredCases.length !== cases.length && ` (filtered from ${cases.length})`}
          </p>
        )}

        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Bulk Import Cases (CSV)"
          size="md"
        >
          <form onSubmit={handleImportSubmit} noValidate>
            <p className="import-modal__description">
              Upload a standard GAVEL CSV case manifest to create or update multiple case records at once.
            </p>

            <label htmlFor="csv-file-input" className="import-modal__dropzone">
              <FileSpreadsheet size={40} className="import-modal__icon" aria-hidden="true" />
              <p className="import-modal__text">Click to choose a CSV file</p>
              <p className="import-modal__subtext">Supported format: .csv</p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="import-modal__file-input"
                onChange={(event) => setImportFile(event.target.files[0] ?? null)}
                disabled={isImporting}
              />
            </label>

            {importFile && (
              <div className="import-modal__selected-file">
                <CheckCircle size={16} aria-hidden="true" />
                <span>Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <div className="import-modal__actions">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isImporting}
                disabled={!importFile}
              >
                Upload & Process
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div className="cases-page__select-wrap">
      <select
        id={id}
        className="cases-page__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={`${id}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="cases-page__select-icon" aria-hidden="true" />
    </div>
  );
}
