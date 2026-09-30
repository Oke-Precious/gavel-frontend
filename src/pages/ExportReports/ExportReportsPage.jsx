import React, { useMemo, useState } from 'react';
import { Download, FileDown } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { reportsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './ExportReportsPage.css';

const DATA_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '365', label: 'Last 12 Months' },
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
];

const STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

function listFrom(data) {
  if (Array.isArray(data)) return data;
  return data?.cases ?? data?.items ?? data?.records ?? [];
}

function text(value, fallback = '') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function validDate(...values) {
  for (const value of values) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function extractState(caseRecord) {
  if (caseRecord?.state) return text(caseRecord.state);

  const description = text(caseRecord?.description);
  const match = description.match(/State jurisdiction:\s*([^\n]+)/i);
  return match?.[1]?.trim() || 'Not provided';
}

function normalizeCase(caseRecord) {
  return {
    caseHashId: text(caseRecord?.hashId ?? caseRecord?.caseHashId ?? caseRecord?.caseNumber, 'Not provided'),
    title: text(caseRecord?.title ?? caseRecord?.offense ?? caseRecord?.offenseCategory, 'Not provided'),
    state: extractState(caseRecord),
    court: text(caseRecord?.court, 'Not provided'),
    stage: text(caseRecord?.stage ?? caseRecord?.status, 'Not provided'),
    status: text(caseRecord?.status, 'Not provided'),
    detentionDate: text(caseRecord?.detentionDate ?? caseRecord?.remandStartDate ?? caseRecord?.arrestDate, 'Not provided'),
    createdAt: text(caseRecord?.createdAt, 'Not provided'),
    updatedAt: text(caseRecord?.updatedAt, 'Not provided'),
  };
}

function filterByRange(rows, dataRange) {
  if (dataRange === 'all') return rows;

  const days = Number(dataRange);
  if (!Number.isFinite(days)) return rows;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return rows.filter((row) => {
    const date = validDate(row.createdAt, row.updatedAt, row.detentionDate);
    return date ? date >= cutoff : false;
  });
}

function escapeCsvCell(value) {
  const raw = text(value);
  if (!/[",\n\r]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const headers = ['Case Hash ID', 'Title', 'State', 'Court', 'Stage', 'Status', 'Detention Date'];
  const body = rows.map((row) => [
    row.caseHashId,
    row.title,
    row.state,
    row.court,
    row.stage,
    row.status,
    row.detentionDate,
  ].map(escapeCsvCell).join(','));

  return [headers.join(','), ...body].join('\n');
}

function ascii(value) {
  return text(value).replace(/[^\x20-\x7E]/g, '-');
}

function escapePdfText(value) {
  return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdf(rows, summary) {
  const visibleRows = rows.slice(0, 28);
  const lines = [
    'GAVEL Case Export Report',
    `Data Range: ${summary.dataRangeLabel}`,
    `Scope: ${summary.scopeLabel}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Total Records: ${rows.length}`,
    '',
    ...visibleRows.map((row, index) => (
      `${index + 1}. ${row.caseHashId} | ${row.state} | ${row.stage} | ${row.status}`
    )),
  ];

  if (rows.length > visibleRows.length) {
    lines.push('');
    lines.push(`Showing first ${visibleRows.length} records. Download CSV or JSON for the full table.`);
  }

  const content = [
    'BT',
    '/F1 16 Tf',
    '50 760 Td',
    `(${escapePdfText(lines[0])}) Tj`,
    '/F1 10 Tf',
    ...lines.slice(1).flatMap((line) => ['0 -18 Td', `(${escapePdfText(line)}) Tj`]),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function downloadFile(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function errorMessage(error) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'The reports service is temporarily unavailable. Please try again.';
  return error.response.data?.message ?? 'Unable to generate report.';
}

export default function ExportReportsPage() {
  const { toast } = useToast();
  const [dataRange, setDataRange] = useState('all');
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('all');
  const [state, setState] = useState('Lagos');
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  const summary = useMemo(() => {
    const dataRangeLabel = DATA_RANGES.find((option) => option.value === dataRange)?.label ?? 'All Time';
    const scopeLabel = scope === 'single' ? state : 'All States';
    return { dataRangeLabel, scopeLabel };
  }, [dataRange, scope, state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await reportsApi.caseRecords();
      const normalized = listFrom(data).map(normalizeCase);
      const ranged = filterByRange(normalized, dataRange);
      const filtered = scope === 'single'
        ? ranged.filter((row) => row.state.toLowerCase() === state.toLowerCase())
        : ranged;

      const baseName = `gavel-report-${summary.scopeLabel.toLowerCase().replace(/\s+/g, '-')}-${fileStamp()}`;

      if (format === 'json') {
        downloadFile(
          JSON.stringify({ ...summary, generatedAt: new Date().toISOString(), records: filtered }, null, 2),
          `${baseName}.json`,
          'application/json',
        );
      } else if (format === 'pdf') {
        downloadFile(buildSimplePdf(filtered, summary), `${baseName}.pdf`, 'application/pdf');
      } else {
        downloadFile(toCsv(filtered), `${baseName}.csv`, 'text/csv;charset=utf-8');
      }

      setLastGenerated({
        count: filtered.length,
        format: format.toUpperCase(),
        range: summary.dataRangeLabel,
        scope: summary.scopeLabel,
      });
      toast.success(`${format.toUpperCase()} report generated successfully.`);
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="export-reports-page" aria-labelledby="export-reports-title">
      <div className="export-reports-page__shell">
        <header className="export-reports-page__header">
          <div>
            <p className="export-reports-page__eyebrow">Reports</p>
            <h1 id="export-reports-title">Export Reports</h1>
            <p>Generate aggregate case exports for oversight without exposing personal case data.</p>
          </div>
        </header>

        <Card padding="lg">
          <form className="export-reports-page__form" onSubmit={handleSubmit}>
            <div className="export-reports-page__grid">
              <label className="export-reports-page__field" htmlFor="report-data-range">
                <span>Data Range</span>
                <select
                  id="report-data-range"
                  value={dataRange}
                  onChange={(event) => setDataRange(event.target.value)}
                  disabled={loading}
                >
                  {DATA_RANGES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="export-reports-page__field" htmlFor="report-scope">
                <span>Scope</span>
                <select
                  id="report-scope"
                  value={scope}
                  onChange={(event) => setScope(event.target.value)}
                  disabled={loading}
                >
                  <option value="all">All States</option>
                  <option value="single">Single State</option>
                </select>
              </label>

              {scope === 'single' && (
                <label className="export-reports-page__field" htmlFor="report-state">
                  <span>State</span>
                  <select
                    id="report-state"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    disabled={loading}
                  >
                    {STATES.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <fieldset className="export-reports-page__format" disabled={loading}>
              <legend>Format</legend>
              <div className="export-reports-page__radio-row">
                {FORMAT_OPTIONS.map((option) => (
                  <label key={option.value} className="export-reports-page__radio">
                    <input
                      type="radio"
                      name="report-format"
                      value={option.value}
                      checked={format === option.value}
                      onChange={(event) => setFormat(event.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="export-reports-page__actions">
              <Button type="submit" variant="primary" size="md" iconLeft={FileDown} loading={loading}>
                Generate Report
              </Button>
            </div>
          </form>
        </Card>

        {lastGenerated && (
          <Card padding="md" className="export-reports-page__result" role="status">
            <Download size={18} aria-hidden="true" />
            <p>
              {lastGenerated.format} report generated for {lastGenerated.scope} ({lastGenerated.range}) with {lastGenerated.count.toLocaleString()} case {lastGenerated.count === 1 ? 'record' : 'records'}.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
