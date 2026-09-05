import React, { useState } from 'react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Modal from '../../components/Modal.jsx';
import DataTable from '../../components/DataTable.jsx';
import Timeline from '../../components/Timeline.jsx';
import RemandClock from '../../components/RemandClock.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Plus, Download, Trash2, Search, ArrowRight,
  Palette, Type, Square, AlignLeft, Clock,
  LayoutGrid, Table, GitBranch, Bell, AlertTriangle,
  Layers,
} from 'lucide-react';
import './StyleGuidePage.css';

/* ------------------------------------------------------------------ */
/* Section wrapper                                                      */
/* ------------------------------------------------------------------ */
function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="sg-section">
      <div className="sg-section__header">
        <Icon size={20} strokeWidth={1.75} className="sg-section__icon" aria-hidden="true" />
        <h2 className="sg-section__title">{title}</h2>
      </div>
      <div className="sg-section__body">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Swatch                                                               */
/* ------------------------------------------------------------------ */
function Swatch({ name, variable, hex, dark = false }) {
  return (
    <div className="sg-swatch">
      <div
        className={`sg-swatch__color${dark ? ' sg-swatch__color--dark' : ''}`}
        style={{ backgroundColor: `var(${variable})` }}
        aria-hidden="true"
      />
      <div className="sg-swatch__info">
        <span className="sg-swatch__name">{name}</span>
        <code className="sg-swatch__var">{variable}</code>
        <span className="sg-swatch__hex">{hex}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ErrorThrower — for demonstrating ErrorBoundary                       */
/* ------------------------------------------------------------------ */
function ErrorThrower() {
  const [shouldThrow, setShouldThrow] = useState(false);
  if (shouldThrow) throw new Error('Intentional demo error from Style Guide');
  return (
    <Button variant="danger" size="sm" onClick={() => setShouldThrow(true)}>
      Trigger render error
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Table sample data                                                    */
/* ------------------------------------------------------------------ */
const TABLE_COLUMNS = [
  { key: 'hashId',    label: 'Case Hash ID', sortable: true },
  { key: 'court',     label: 'Court',        sortable: true },
  { key: 'stage',     label: 'Stage',        sortable: false },
  { key: 'days',      label: 'Days',         sortable: true },
  {
    key: 'alertLevel',
    label: 'Status',
    sortable: false,
    render: (val) => <StatusPill level={val} size="sm" />,
  },
];

const TABLE_DATA = [
  { _id: '1', hashId: 'LA-2026-0483', court: 'Lagos High Court',              stage: 'Charge & Remand',          days: 14,  alertLevel: 'compliant' },
  { _id: '2', hashId: 'KN-2025-1187', court: 'Kano State High Court',         stage: 'DPP Advice / Adjournment', days: 67,  alertLevel: 'warning'   },
  { _id: '3', hashId: 'RV-2026-0092', court: 'Port Harcourt Magistrate Court', stage: 'Charge & Remand',         days: 112, alertLevel: 'severe'    },
  { _id: '4', hashId: 'EN-2024-2201', court: 'Enugu State High Court',         stage: 'Arrest',                  days: 203, alertLevel: 'critical'  },
];

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export default function StyleGuidePage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tableSort, setTableSort] = useState({ key: 'days', direction: 'desc' });

  function handleSort(key) {
    setTableSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <div className="sg-page">
      {/* -------- Page header -------- */}
      <header className="sg-header">
        <div className="container">
          <div className="sg-header__inner">
            <div>
              <h1 className="sg-header__title">GAVEL Design System</h1>
              <p className="sg-header__subtitle">
                Component showcase — every variant, state, and interaction in one place.
              </p>
            </div>
            <span className="sg-header__badge">v1.0 · .js/.jsx only</span>
          </div>

          {/* Nav anchors */}
          <nav className="sg-nav" aria-label="Style guide sections">
            {[
              ['#colors',       'Colors'],
              ['#typography',   'Typography'],
              ['#buttons',      'Buttons'],
              ['#status-pills', 'Status Pills'],
              ['#cards',        'Cards'],
              ['#remand-clock', 'Remand Clock'],
              ['#timeline',     'Timeline'],
              ['#data-table',   'Data Table'],
              ['#modal',        'Modal'],
              ['#toast',        'Toast'],
              ['#empty-state',  'Empty States'],
              ['#skeleton',     'Skeletons'],
              ['#error-boundary','Error Boundary'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="sg-nav__link">{label}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* -------- Sections -------- */}
      <div className="sg-body container">

        {/* 1. COLORS */}
        <Section id="colors" icon={Palette} title="Color Palette">
          <div className="sg-swatch-grid">
            <Swatch name="Navy"     variable="--color-navy"     hex="#0F172A" dark />
            <Swatch name="Indigo"   variable="--color-indigo"   hex="#4F46E5" dark />
            <Swatch name="BG"       variable="--color-bg"       hex="#F8FAFC" />
            <Swatch name="Surface"  variable="--color-surface"  hex="#FFFFFF" />
            <Swatch name="Text"     variable="--color-text"     hex="#1E293B" dark />
            <Swatch name="Muted"    variable="--color-text-muted" hex="#64748B" />
            <Swatch name="Border"   variable="--color-border"   hex="#E2E8F0" />
          </div>
          <h3 className="sg-subsection-title">Status Colors</h3>
          <div className="sg-swatch-grid">
            <Swatch name="Compliant" variable="--color-compliant" hex="#10B981" dark />
            <Swatch name="Warning"   variable="--color-warning"   hex="#F59E0B" dark />
            <Swatch name="Severe"    variable="--color-severe"    hex="#F97316" dark />
            <Swatch name="Critical"  variable="--color-critical"  hex="#EF4444" dark />
          </div>
        </Section>

        {/* 2. TYPOGRAPHY */}
        <Section id="typography" icon={Type} title="Typography Scale">
          <div className="sg-type-scale">
            <div className="sg-type-row">
              <span className="sg-type-label">H1 · 32px · Bold</span>
              <h1 className="sg-type-sample sg-type-sample--h1">Case Tracking for Nigeria</h1>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">H2 · 24px · Semibold</span>
              <h2 className="sg-type-sample sg-type-sample--h2">Awaiting Trial Overview</h2>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">H3 · 20px · Semibold</span>
              <h3 className="sg-type-sample sg-type-sample--h3">Case Hash ID: LA-2026-0483</h3>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">H4 · 16px · Semibold</span>
              <h4 className="sg-type-sample sg-type-sample--h4">Court: Lagos High Court</h4>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">Body · 16px · Regular</span>
              <p className="sg-type-sample">
                Every citizen has a right to a fair and speedy trial. GAVEL surfaces
                the cases that fall through the cracks of an overburdened system.
              </p>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">Caption · 14px</span>
              <p className="sg-type-sample sg-type-sample--caption">
                Last updated: 12 Aug 2025, 14:35 · Stall reason: Awaiting DPP Advice
              </p>
            </div>
            <div className="sg-type-row">
              <span className="sg-type-label">Small · 12px</span>
              <p className="sg-type-sample sg-type-sample--small">
                Case data is synthetic. Not affiliated with any government body.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. BUTTONS */}
        <Section id="buttons" icon={Square} title="Buttons">
          <h3 className="sg-subsection-title">Variants</h3>
          <div className="sg-row sg-row--wrap">
            <Button variant="primary"   iconLeft={Plus}>Primary</Button>
            <Button variant="secondary" iconLeft={Download}>Secondary</Button>
            <Button variant="danger"    iconLeft={Trash2}>Danger</Button>
            <Button variant="ghost"     iconLeft={Search}>Ghost</Button>
          </div>

          <h3 className="sg-subsection-title">Sizes</h3>
          <div className="sg-row sg-row--wrap sg-row--align-center">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>

          <h3 className="sg-subsection-title">States</h3>
          <div className="sg-row sg-row--wrap sg-row--align-center">
            <Button variant="primary" loading>Loading</Button>
            <Button variant="secondary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="primary" iconRight={ArrowRight}>Icon right</Button>
          </div>
        </Section>

        {/* 4. STATUS PILLS */}
        <Section id="status-pills" icon={AlignLeft} title="Status Pills">
          <p className="sg-description">
            Status is always communicated with icon + label + color — never color alone.
            The Critical variant pulses slowly to signal urgency without being obnoxious.
          </p>
          <h3 className="sg-subsection-title">md (default)</h3>
          <div className="sg-row sg-row--wrap sg-row--align-center">
            <StatusPill level="compliant" />
            <StatusPill level="warning" />
            <StatusPill level="severe" />
            <StatusPill level="critical" />
          </div>
          <h3 className="sg-subsection-title">sm</h3>
          <div className="sg-row sg-row--wrap sg-row--align-center">
            <StatusPill level="compliant" size="sm" />
            <StatusPill level="warning"   size="sm" />
            <StatusPill level="severe"    size="sm" />
            <StatusPill level="critical"  size="sm" />
          </div>
        </Section>

        {/* 5. CARDS */}
        <Section id="cards" icon={Layers} title="Cards">
          <p className="sg-description">
            Cards lift 2px on hover with shadow level 2. Three padding sizes available.
          </p>
          <div className="sg-cards-demo">
            <Card padding="sm">
              <p className="sg-card-label">Padding: sm</p>
              <p className="sg-card-value">LA-2026-0483</p>
            </Card>
            <Card padding="md" hoverable>
              <p className="sg-card-label">Padding: md · hoverable</p>
              <p className="sg-card-value">KN-2025-1187</p>
              <StatusPill level="warning" size="sm" />
            </Card>
            <Card padding="lg" hoverable>
              <p className="sg-card-label">Padding: lg · hoverable</p>
              <p className="sg-card-value">EN-2024-2201</p>
              <StatusPill level="critical" size="sm" />
            </Card>
          </div>
        </Section>

        {/* 6. REMAND CLOCK */}
        <Section id="remand-clock" icon={Clock} title="Remand Clock">
          <p className="sg-description">
            The Statutory Remand Clock visualises days in custody against Nigeria's
            28-day legal remand limit. The arc color and badge change with the alert level.
            The Critical clock pulses its SVG ring.
          </p>
          <div className="sg-clock-row">
            <div className="sg-clock-item">
              <RemandClock days={12} size="md" />
              <span className="sg-clock-label">12 days — Compliant</span>
            </div>
            <div className="sg-clock-item">
              <RemandClock days={45} size="md" />
              <span className="sg-clock-label">45 days — Warning</span>
            </div>
            <div className="sg-clock-item">
              <RemandClock days={110} size="md" />
              <span className="sg-clock-label">110 days — Severe</span>
            </div>
            <div className="sg-clock-item">
              <RemandClock days={203} size="md" />
              <span className="sg-clock-label">203 days — Critical</span>
            </div>
          </div>
          <h3 className="sg-subsection-title">Size variants</h3>
          <div className="sg-row sg-row--align-center sg-row--wrap">
            <RemandClock days={45} size="sm" />
            <RemandClock days={45} size="md" />
            <RemandClock days={45} size="lg" />
          </div>
        </Section>

        {/* 7. TIMELINE */}
        <Section id="timeline" icon={GitBranch} title="Case Lifecycle Timeline">
          <p className="sg-description">
            Horizontal on desktop, vertical on mobile. Completed stages are filled green,
            the active stage has an indigo ring, pending stages are grey.
          </p>
          {[0, 1, 2, 3].map((activeIdx) => (
            <div key={activeIdx} className="sg-timeline-demo">
              <span className="sg-timeline-label">Stage {activeIdx + 1} active</span>
              <Timeline
                currentStageIndex={activeIdx}
                stages={[
                  { label: 'Arrest',                  date: '03 Jan 2026' },
                  { label: 'Charge & Remand',         date: '07 Jan 2026', stallReason: activeIdx === 1 ? 'Awaiting DPP Advice' : undefined },
                  { label: 'DPP Advice / Adjournment',date: activeIdx >= 2 ? '14 Feb 2026' : undefined },
                  { label: 'Trial or Discharge' },
                ]}
              />
            </div>
          ))}
        </Section>

        {/* 8. DATA TABLE */}
        <Section id="data-table" icon={Table} title="Data Table">
          <p className="sg-description">
            Sortable columns (keyboard + mouse), skeleton loading rows,
            and a stacked-card view on mobile (resize to see it).
          </p>
          <DataTable
            columns={TABLE_COLUMNS}
            data={TABLE_DATA}
            rowIdKey="_id"
            sort={{ key: tableSort.key, direction: tableSort.direction, onSort: handleSort }}
            pagination={{
              page: tablePage,
              totalPages: 3,
              totalItems: 12,
              limit: 4,
              onPageChange: setTablePage,
            }}
            onRowClick={(row) => toast.info(`Clicked: ${row.hashId}`)}
          />
          <h3 className="sg-subsection-title">Loading state</h3>
          <DataTable columns={TABLE_COLUMNS} data={[]} loading={true} />
          <h3 className="sg-subsection-title">Empty state</h3>
          <DataTable columns={TABLE_COLUMNS} data={[]} emptyMessage="No cases match your filters." />
        </Section>

        {/* 9. MODAL */}
        <Section id="modal" icon={LayoutGrid} title="Modal">
          <p className="sg-description">
            Portal-rendered, focus-trapped, Escape-to-close, backdrop-click-to-close.
            Bottom-sheet on mobile.
          </p>
          <div className="sg-row">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open modal demo
            </Button>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm Status Update"
            size="md"
          >
            <p style={{ color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.6 }}>
              You are about to move case <strong>LA-2026-0483</strong> to{' '}
              <strong>DPP Advice / Adjournment</strong>. Please add a note explaining this change.
            </p>
            <textarea
              id="modal-note"
              aria-label="Status update note"
              placeholder="e.g. File received from DPP office on 12 Aug 2025…"
              rows={4}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--font-size-caption)',
                resize: 'vertical',
                marginBottom: '1.5rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                toast.success('Status updated successfully.');
                setModalOpen(false);
              }}>
                Confirm update
              </Button>
            </div>
          </Modal>
        </Section>

        {/* 10. TOAST */}
        <Section id="toast" icon={Bell} title="Toast Notifications">
          <p className="sg-description">
            Slide up from bottom-right (desktop) or top (mobile). Auto-dismiss with
            a countdown progress bar. Each type uses a semantically appropriate role.
          </p>
          <div className="sg-row sg-row--wrap">
            <Button
              variant="secondary"
              onClick={() => toast.success('Case LA-2026-0483 updated successfully.')}
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error('Failed to save changes. Please try again.')}
            >
              Error toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning('Case KN-2025-1187 has crossed 28 days in custody.')}
            >
              Warning toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info('Real-time update: Case EN-2024-2201 was just modified.')}
            >
              Info toast
            </Button>
          </div>
        </Section>

        {/* 11. EMPTY STATES */}
        <Section id="empty-state" icon={Search} title="Empty States">
          <p className="sg-description">
            Always include an icon, message, optional subtext, and a next-action button.
            Never a dead end.
          </p>
          <div className="sg-empty-grid">
            <Card padding="md">
              <EmptyState
                icon="search"
                message="No cases found"
                subtext="Try adjusting your search or clearing the filters."
                actionLabel="Clear filters"
                onAction={() => toast.info('Filters cleared.')}
              />
            </Card>
            <Card padding="md">
              <EmptyState
                icon="inbox"
                message="No documents attached"
                subtext="Upload a case file to get started."
                actionLabel="Upload document"
                onAction={() => toast.info('Upload dialog would open here.')}
              />
            </Card>
            <Card padding="md">
              <EmptyState
                icon="error"
                message="Couldn't load cases"
                subtext="Something went wrong fetching the data."
                actionLabel="Try again"
                onAction={() => toast.info('Retrying…')}
              />
            </Card>
          </div>
        </Section>

        {/* 12. SKELETON */}
        <Section id="skeleton" icon={Layers} title="Skeleton Loaders">
          <p className="sg-description">
            Shimmer gradient sweeps left-to-right at 1.5s. Shaped like the content
            they replace — never a generic spinner.
          </p>
          <div className="sg-skeleton-demo">
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">text · 1 line</span>
              <Skeleton variant="text" />
            </div>
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">text · 3 lines</span>
              <Skeleton variant="text" lines={3} />
            </div>
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">card</span>
              <Skeleton variant="card" height={100} />
            </div>
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">avatar / circle</span>
              <Skeleton variant="avatar" />
            </div>
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">table-row</span>
              <Skeleton variant="table-row" />
            </div>
            <div className="sg-skeleton-group">
              <span className="sg-skeleton-label">pill</span>
              <Skeleton variant="text" width={80} rounded />
            </div>
          </div>
        </Section>

        {/* 13. ERROR BOUNDARY */}
        <Section id="error-boundary" icon={AlertTriangle} title="Error Boundary">
          <p className="sg-description">
            Catches render errors anywhere in the component tree. Shows a calm
            fallback — never a blank screen. In DEV mode, surfaces the error message.
            In production, a generic "something went wrong" message is shown.
          </p>
          <Card padding="md">
            <ErrorBoundary>
              <ErrorThrower />
            </ErrorBoundary>
          </Card>
        </Section>

      </div>{/* end .sg-body */}
    </div>
  );
}
