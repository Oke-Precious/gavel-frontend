import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Search,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Modal from '../../components/Modal.jsx';
import { casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
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

function normalizeAlert(raw) {
  if (!raw) return 'compliant';
  const s = String(raw).toLowerCase();
  if (s.includes('critical')) return 'critical';
  if (s.includes('severe') || s.includes('orange')) return 'severe';
  if (s.includes('warning') || s.includes('amber')) return 'warning';
  return 'compliant';
}

const PAGE_SIZE = 10;

export default function CasesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRole } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bulk Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Cases
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await casesApi.list({ limit: 200 });
      const items = Array.isArray(data) ? data : (data?.cases ?? data?.items ?? []);
      if (items.length === 0) {
        setCases([]);
      } else {
        const normalized = items.map((c) => ({
          _id: c._id,
          caseHashId: c.hashId ?? '—',
          offense: c.offenseCategory ?? c.offense ?? c.title ?? '—',
          court: c.court ?? 'Not provided',
          state: c.state ?? 'Not provided',
          stage: c.stage ?? 'Not provided',
          daysInCustody: c.detentionDate ? daysInCustody(c.detentionDate) : null,
          alertLevel: c.detentionDate
            ? getAlertLevel(daysInCustody(c.detentionDate)).level
            : c.alertLevel ? normalizeAlert(c.alertLevel) : null,
          nextHearing: c.nextHearingDate ?? c.nextHearing ?? '—',
        }));
        setCases(normalized);
      }
    } catch (requestError) {
      setCases([]);
      setError({
        message: !requestError?.response
          ? 'Network error — check your connection and try again.'
          : requestError.response.status >= 500
            ? 'Something went wrong on our end. Please try again in a moment.'
            : requestError.response?.data?.message ?? 'Unable to load cases.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadCases, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadCases]);

  // Filtered dataset
  const filteredCases = useMemo(() => {
    return cases.filter((row) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.caseHashId.toLowerCase().includes(q) ||
        row.offense.toLowerCase().includes(q) ||
        row.court.toLowerCase().includes(q) ||
        row.state.toLowerCase().includes(q);

      const matchStage =
        !stageFilter ||
        row.stage.toLowerCase().replace(/[^a-z]/g, '').includes(
          stageFilter.replace(/_/g, '').toLowerCase()
        );

      const matchAlert = !alertFilter || row.alertLevel === alertFilter;

      return matchSearch && matchStage && matchAlert;
    });
  }, [cases, search, stageFilter, alertFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredCases.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // CSV Bulk Import Handler
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.warning('Please select a CSV file to upload.');
      return;
    }

    setIsImporting(true);
    try {
      await casesApi.bulkImport(importFile);
      toast.success(`Successfully imported cases from "${importFile.name}".`);
      setIsImportModalOpen(false);
      setImportFile(null);
      loadCases();
    } catch (err) {
      const msg = !err.response
        ? 'Network error — check your connection and try again.'
        : err.response?.data?.message || 'Unable to import cases.';
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      toast.info('Preparing CSV export download...');
      const blob = await casesApi.export('csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'gavel_cases_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV Export downloaded successfully.');
    } catch (err) {
      const msg = !err.response
        ? 'Network error — check your connection and try again.'
        : err.response?.data?.message || 'Unable to export cases.';
      toast.error(msg);
    }
  };

  // Columns definition
  const columns = [
    {
      key: 'caseHashId',
      label: 'Case Hash ID',
      render: (val) => <span className="cases-table__hash">{val}</span>,
    },
    { key: 'offense', label: 'Offense' },
    {
      key: 'court',
      label: 'Jurisdiction',
      render: (val, row) => `${val}, ${row.state}`,
    },
    { key: 'stage', label: 'Stage' },
    {
      key: 'daysInCustody',
      label: 'Days in Custody',
      render: (val) => (
        <span className="cases-table__days">
          {val == null ? '—' : `${val} ${val === 1 ? 'day' : 'days'}`}
        </span>
      ),
    },
    {
      key: 'alertLevel',
      label: 'Alert Level',
      render: (val) => val ? <StatusPill level={val} /> : '—',
    },
    { key: 'nextHearing', label: 'Next Hearing' },
    {
      key: '_id',
      label: 'Action',
      render: (_, row) => (
        <button
          className="cases-table__view-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/cases/${row._id}`);
          }}
        >
          View
        </button>
      ),
    },
  ];

  const filterSlot = (
    <div className="cases-page__filters">
      <div className="cases-page__search-wrap">
        <Search size={16} className="cases-page__search-icon" />
        <input
          type="search"
          className="cases-page__search-input"
          placeholder="Search by ID, offense, or court..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="cases-page__select-wrap">
        <select
          className="cases-page__select"
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
        >
          {STAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="cases-page__select-icon" />
      </div>

      <div className="cases-page__select-wrap">
        <select
          className="cases-page__select"
          value={alertFilter}
          onChange={(e) => { setAlertFilter(e.target.value); setPage(1); }}
        >
          {ALERT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="cases-page__select-icon" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        iconLeft={RefreshCw}
        onClick={loadCases}
      >
        Refresh
      </Button>
    </div>
  );

  return (
    <div className="cases-page">
      <div className="container cases-page__container">
        {/* Header Bar */}
        <div className="cases-page__header">
          <div className="cases-page__header-left">
            <h1 className="cases-page__title">Case Directory</h1>
            <p className="cases-page__subtitle">
              Manage, monitor, and update pre-trial detention cases across Nigeria.
            </p>
          </div>

          <div className="cases-page__header-actions">
            {hasRole('admin', 'clerk') && (
              <Button variant="secondary" size="md" iconLeft={Upload} onClick={() => setIsImportModalOpen(true)}>
                Import Cases
              </Button>
            )}
            {hasRole('admin', 'judge') && (
              <Button variant="secondary" size="md" iconLeft={Download} onClick={handleExportCSV}>
                Export CSV
              </Button>
            )}
            {hasRole('admin', 'clerk') && (
              <Button variant="primary" size="md" iconLeft={Plus} onClick={() => navigate('/cases/new')}>
                Add New Case
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
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
                  onPageChange: (p) => setPage(p),
                }
              : null
          }
          onRowClick={(row) => navigate(`/cases/${row._id}`)}
        />

        {/* Bulk CSV Import Modal */}
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
              <FileSpreadsheet size={40} className="import-modal__icon" />
              <p className="import-modal__text">Click to choose a CSV file</p>
              <p className="import-modal__subtext">Supported format: .csv (max 10MB)</p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="import-modal__file-input"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </label>

            {importFile && (
              <div className="import-modal__selected-file">
                <CheckCircle size={16} />
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
