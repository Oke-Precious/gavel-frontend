import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, UploadCloud } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import DataTable from '../../components/DataTable.jsx';
import { casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import '../UpdateCaseStatus/UpdateCaseStatusPage.css';
import './BulkImportCasesPage.css';

const SAMPLE_ROWS = [
  {
    id: 'sample-1',
    caseNumber: 'LA-2026-0483',
    title: 'Commissioner of Police v. Detainee',
    court: 'Ikeja Magistrate Court',
    stage: 'Charge & Remand',
    status: 'Active',
  },
  {
    id: 'sample-2',
    caseNumber: 'OG-2026-0118',
    title: 'State v. Unrepresented Accused',
    court: 'Abeokuta High Court',
    stage: 'DPP Advice / Adjournment',
    status: 'Stalled',
  },
  {
    id: 'sample-3',
    caseNumber: 'RV-2026-0209',
    title: 'Police v. Awaiting Trial Person',
    court: 'Port Harcourt Magistrate Court',
    stage: 'Arrest',
    status: 'Active',
  },
];

const PREVIEW_COLUMNS = [
  { key: 'caseNumber', label: 'Case Number', sortable: false },
  { key: 'title', label: 'Title', sortable: false },
  { key: 'court', label: 'Court', sortable: false },
  { key: 'stage', label: 'Stage', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
];

function getErrorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response?.data?.message ?? 'Unable to import cases.';
}

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function parseCsvPreview(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1, 4).map((line, index) => {
    const cells = parseCsvLine(line);
    const row = { id: `preview-${index}` };
    headers.forEach((header, headerIndex) => {
      row[header] = cells[headerIndex] ?? '';
    });
    return {
      id: row.id,
      caseNumber: row.caseNumber || row.case_number || '',
      title: row.title || '',
      court: row.court || '',
      stage: row.stage || '',
      status: row.status || '',
    };
  });
}

export default function BulkImportCasesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState(SAMPLE_ROWS);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);

  const previewLabel = useMemo(
    () => file ? `Previewing first ${previewRows.length} parsed rows from ${file.name}` : 'Sample CSV preview',
    [file, previewRows.length],
  );

  const readFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.warning('Please select a CSV file.');
      return;
    }

    setFile(selectedFile);
    const text = await selectedFile.text();
    const parsedRows = parseCsvPreview(text);
    setPreviewRows(parsedRows.length ? parsedRows : SAMPLE_ROWS);
  };

  const handleImport = async () => {
    if (!file) {
      toast.warning('Please choose a CSV file before importing.');
      return;
    }

    setImporting(true);
    try {
      await casesApi.bulkImport(file);
      toast.success(`Successfully imported cases from "${file.name}".`);
      navigate('/cases');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="case-operation-page">
      <div className="case-operation-page__shell">
        <button type="button" className="case-operation-page__back" onClick={() => navigate('/cases')} disabled={importing}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Cases</span>
        </button>

        <div className="bulk-import-page__header">
          <div>
            <h1>Bulk Import Cases</h1>
            <p>Upload a CSV file to create multiple case records through the backend import endpoint.</p>
          </div>
        </div>

        <Card padding="lg">
          <label
            htmlFor="bulk-import-file"
            className={`bulk-import-page__dropzone${dragging ? ' bulk-import-page__dropzone--active' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              readFile(event.dataTransfer.files?.[0]);
            }}
          >
            <UploadCloud size={40} aria-hidden="true" />
            <span>Drag a CSV file here or click to browse</span>
            {file && (
              <span className="bulk-import-page__selected">
                <CheckCircle size={16} aria-hidden="true" />
                {file.name}
              </span>
            )}
            <input
              ref={fileInputRef}
              id="bulk-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => readFile(event.target.files?.[0])}
              disabled={importing}
            />
          </label>
        </Card>

        <div className="bulk-import-page__preview-heading">
          <h2>{previewLabel}</h2>
        </div>

        <DataTable
          columns={PREVIEW_COLUMNS}
          data={previewRows}
          rowIdKey="id"
          emptyMessage="No parsed rows found in this CSV."
        />

        <div className="case-operation-actions">
          <Button type="button" variant="ghost" size="md" onClick={() => navigate('/cases')} disabled={importing}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="md" iconLeft={UploadCloud} loading={importing} disabled={!file} onClick={handleImport}>
            Import Cases
          </Button>
        </div>
      </div>
    </div>
  );
}
