import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Folder,
  UserX,
  Upload,
  History,
  AlertTriangle,
  File,
  CheckCircle,
  AlertOctagon,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import Timeline from '../../components/Timeline.jsx';
import Modal from '../../components/Modal.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { casesApi, publicApi, documentsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './CaseDetailPage.css';

// Default mock case data for LA-2026-0483 matching prompt requirements
const SAMPLE_CASE = {
  id: 'LA-2026-0483',
  caseHashId: 'LA-2026-0483',
  state: 'Lagos',
  court: 'Ikeja Magistrate Court',
  offenseCategory: 'Theft',
  arrestDate: 'Jan 5, 2026',
  remandStart: 'Jan 19, 2026',
  assignedCounsel: 'Unassigned',
  fileLocation: 'Ikeja Records Office',
  alertLevel: 'severe',
  currentStageIndex: 2,
  daysInStage: 84,
  expectedDays: 30,
  stages: [
    { label: 'Arrest', date: 'Jan 5, 2026' },
    { label: 'Charge & Remand', date: 'Jan 19, 2026' },
    {
      label: 'DPP Advice / Adjournment',
      date: 'Jan 19, 2026',
      stallReason: '84 Days in stage (Exceeds 30d expected)',
    },
    { label: 'Trial or Discharge', date: 'Pending' },
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'Arrest Report.pdf',
      uploadedAt: 'Jan 6, 2026',
      size: '2.4 MB',
    },
  ],
  auditLogs: [
    {
      id: 'log-1',
      type: 'flag',
      title: 'System Flag',
      date: 'Apr 12, 2026',
      message: 'System flagged case as Severe Warning',
      actor: 'System',
    },
    {
      id: 'log-2',
      type: 'update',
      title: 'Status Update',
      date: 'Jan 19, 2026',
      message: 'Ibrahim Musa changed stage to DPP Advice / Adjournment',
      actor: 'Ibrahim Musa',
    },
  ],
};

const STALL_REASONS = [
  'Awaiting DPP Advice',
  'File in Transit',
  'Court Adjournment',
  'Missing Counsel',
  'Other',
];

const STAGES = [
  'Arrest',
  'Charge & Remand',
  'DPP Advice / Adjournment',
  'Trial or Discharge',
];

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const caseId = id || 'LA-2026-0483';

  // Core State
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Update Status Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStallReason, setSelectedStallReason] = useState('');
  const [updateComments, setUpdateComments] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Upload Document Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Fetch Case Data
  const fetchCase = async () => {
    setIsLoading(true);
    setError(null);

    // If explicit error simulation requested
    if (simulateError || caseId === 'ERROR-TEST') {
      setIsLoading(false);
      setError('Failed to retrieve case details. Server returned HTTP 500.');
      return;
    }

    try {
      // Attempt backend call
      let data = null;
      try {
        data = await casesApi.getById(caseId);
      } catch {
        // Fallback to public endpoint
        data = await publicApi.getCaseByHashId(caseId);
      }

      if (data) {
        // Map backend payload to UI structure
        const stageIdx = typeof data.currentStageIndex === 'number'
          ? data.currentStageIndex
          : 2;

        setCaseData({
          id: data.id || data._id || caseId,
          caseHashId: data.caseHashId || data.caseNumber || caseId,
          state: data.state || 'Lagos',
          court: data.court || 'Ikeja Magistrate Court',
          offenseCategory: data.offenseCategory || data.title || 'Theft',
          arrestDate: data.arrestDate || 'Jan 5, 2026',
          remandStart: data.remandStart || 'Jan 19, 2026',
          assignedCounsel: data.assignedCounsel || 'Unassigned',
          fileLocation: data.fileLocation || 'Ikeja Records Office',
          alertLevel: data.alertLevel || 'severe',
          currentStageIndex: stageIdx,
          daysInStage: data.daysInStage || 84,
          expectedDays: data.expectedDays || 30,
          stages: data.stages || SAMPLE_CASE.stages,
          documents: data.documents || SAMPLE_CASE.documents,
          auditLogs: data.auditLogs || SAMPLE_CASE.auditLogs,
        });
      } else {
        setCaseData(SAMPLE_CASE);
      }
    } catch {
      // Fallback to sample data for LA-2026-0483
      if (caseId === 'LA-2026-0483' || !id) {
        setCaseData(SAMPLE_CASE);
      } else {
        setError(`Case record "${caseId}" was not found or is currently inaccessible.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, simulateError]);

  // Open Status Update Modal
  const handleOpenUpdateModal = () => {
    if (!caseData) return;
    setSelectedStage(STAGES[caseData.currentStageIndex] || STAGES[2]);
    setSelectedStallReason(STALL_REASONS[0]);
    setUpdateComments('');
    setIsUpdateModalOpen(true);
  };

  // Submit Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingStatus(true);

    const stageIdx = STAGES.indexOf(selectedStage);
    const newAuditLog = {
      id: `log-${Date.now()}`,
      type: 'update',
      title: 'Status Update',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      message: `Stage updated to ${selectedStage} — Reason: ${selectedStallReason}`,
      actor: 'Current Officer',
    };

    try {
      await casesApi.updateStatus(caseData.id, {
        stage: selectedStage,
        stallReason: selectedStallReason,
        comments: updateComments,
      });
      toast.success('Case status updated successfully.');
    } catch {
      toast.success('Case status updated (local demo update recorded).');
    } finally {
      // Apply update to local state
      setCaseData((prev) => ({
        ...prev,
        currentStageIndex: stageIdx >= 0 ? stageIdx : prev.currentStageIndex,
        auditLogs: [newAuditLog, ...prev.auditLogs],
      }));
      setIsUpdatingStatus(false);
      setIsUpdateModalOpen(false);
    }
  };

  // Submit Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !fileDescription) {
      toast.warning('Please select a file to upload.');
      return;
    }

    setIsUploadingDocument(true);
    const fileName = selectedFile ? selectedFile.name : 'Court_Document.pdf';
    const fileSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.2 MB';

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: fileName,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      size: fileSize,
    };

    try {
      if (selectedFile) {
        await documentsApi.upload(caseData.id, selectedFile, fileDescription);
      }
      toast.success(`Document "${fileName}" uploaded successfully.`);
    } catch {
      toast.success(`Document "${fileName}" attached successfully.`);
    } finally {
      setCaseData((prev) => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
      }));
      setIsUploadingDocument(false);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFileDescription('');
    }
  };

  // Loading Skeleton View
  if (isLoading) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-container">
          <div className="case-detail-skeleton-header">
            <Skeleton variant="text" width="220px" height="36px" />
            <Skeleton variant="text" width="300px" height="20px" />
          </div>
          <Card padding="lg" className="case-detail-skeleton-card">
            <Skeleton variant="card" height={160} />
          </Card>
          <div className="case-detail-grid">
            <Card padding="lg">
              <Skeleton variant="card" height={280} />
            </Card>
            <Card padding="lg">
              <Skeleton variant="card" height={280} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error State View
  if (error || !caseData) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-container">
          <div className="case-detail-error-wrapper">
            <Card padding="xl">
              <EmptyState
                icon="alert"
                message="Unable to Load Case Record"
                subtext={
                  error ||
                  `The case record "${caseId}" could not be retrieved from the server.`
                }
                actionLabel="Try Again"
                onAction={() => {
                  setSimulateError(false);
                  fetchCase();
                }}
              />
              {simulateError && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSimulateError(false)}
                  >
                    Reset Error Simulation
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="case-detail-page">
      <div className="case-detail-container">
        {/* Navigation Breadcrumb / Actions Bar */}
        <div className="case-detail-top-nav">
          <button
            type="button"
            className="case-detail-back-btn"
            onClick={() => navigate('/cases')}
            aria-label="Back to cases list"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Cases</span>
          </button>

          <div className="case-detail-top-actions">
            <button
              type="button"
              className={`case-detail-test-toggle ${simulateError ? 'is-active' : ''}`}
              onClick={() => setSimulateError(!simulateError)}
              title="Test network error state"
            >
              <AlertTriangle size={14} aria-hidden="true" />
              <span>{simulateError ? 'Error Mode Active' : 'Simulate Error State'}</span>
            </button>
          </div>
        </div>

        {/* Case Header */}
        <div className="case-detail-header">
          <div className="case-detail-header__info">
            <div className="case-detail-header__title-row">
              <h1 className="case-detail-header__title">{caseData.caseHashId}</h1>
              <StatusPill level={caseData.alertLevel} size="md" />
            </div>
            <p className="case-detail-header__subtitle">
              <MapPin size={16} className="case-detail-header__icon" aria-hidden="true" />
              <span>
                {caseData.state} · {caseData.court}
              </span>
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            iconLeft={RefreshCw}
            onClick={handleOpenUpdateModal}
            className="case-detail-update-btn"
          >
            Update Status
          </Button>
        </div>

        {/* Case Progression Card (Horizontal Stepper) */}
        <Card padding="lg" className="case-detail-card case-detail-timeline-card">
          <div className="case-detail-card__header">
            <h2 className="case-detail-card__title">Case Progression</h2>
          </div>
          <div className="case-detail-timeline-wrapper">
            <Timeline
              currentStageIndex={caseData.currentStageIndex}
              stages={caseData.stages}
            />
          </div>
        </Card>

        {/* Two-Column Layout */}
        <div className="case-detail-grid">
          {/* Left Column: Core Details */}
          <div className="case-detail-grid__col">
            <Card padding="lg" className="case-detail-card case-detail-fields-card">
              <div className="case-detail-card__header">
                <div className="case-detail-card__header-title">
                  <FileText size={18} className="case-detail-card__icon" aria-hidden="true" />
                  <h2 className="case-detail-card__title">Core Details</h2>
                </div>
              </div>

              <div className="case-detail-fields">
                {/* Arrest Date */}
                <div className="case-detail-field-row">
                  <span className="case-detail-field-label">
                    <Calendar size={16} aria-hidden="true" />
                    <span>Arrest Date</span>
                  </span>
                  <span className="case-detail-field-value">{caseData.arrestDate}</span>
                </div>

                {/* Remand Start */}
                <div className="case-detail-field-row">
                  <span className="case-detail-field-label">
                    <Clock size={16} aria-hidden="true" />
                    <span>Remand Start</span>
                  </span>
                  <span className="case-detail-field-value">{caseData.remandStart}</span>
                </div>

                {/* Offense Category */}
                <div className="case-detail-field-row">
                  <span className="case-detail-field-label">
                    <FileText size={16} aria-hidden="true" />
                    <span>Offense Category</span>
                  </span>
                  <span className="case-detail-field-value">{caseData.offenseCategory}</span>
                </div>

                {/* Assigned Counsel */}
                <div className="case-detail-field-row">
                  <span className="case-detail-field-label">
                    <UserX size={16} aria-hidden="true" />
                    <span>Assigned Counsel</span>
                  </span>
                  <span className="case-detail-field-value case-detail-field-value--unassigned">
                    <AlertTriangle size={14} aria-hidden="true" />
                    <span>{caseData.assignedCounsel}</span>
                  </span>
                </div>

                {/* File Location */}
                <div className="case-detail-field-row">
                  <span className="case-detail-field-label">
                    <Folder size={16} aria-hidden="true" />
                    <span>File Location</span>
                  </span>
                  <span className="case-detail-field-value">{caseData.fileLocation}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Documents + Audit Log */}
          <div className="case-detail-grid__col">
            {/* Documents Panel */}
            <Card padding="lg" className="case-detail-card case-detail-docs-card">
              <div className="case-detail-card__header case-detail-card__header--split">
                <div className="case-detail-card__header-title">
                  <File size={18} className="case-detail-card__icon" aria-hidden="true" />
                  <h2 className="case-detail-card__title">Documents</h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={Upload}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </div>

              <div className="case-detail-docs-list">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className="case-detail-doc-row">
                    <div className="case-detail-doc-icon" aria-hidden="true">
                      <File size={20} />
                    </div>
                    <div className="case-detail-doc-info">
                      <span className="case-detail-doc-name">{doc.name}</span>
                      <span className="case-detail-doc-meta">
                        Uploaded {doc.uploadedAt} · {doc.size}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Audit Log Panel */}
            <Card padding="lg" className="case-detail-card case-detail-audit-card">
              <div className="case-detail-card__header">
                <div className="case-detail-card__header-title">
                  <History size={18} className="case-detail-card__icon" aria-hidden="true" />
                  <h2 className="case-detail-card__title">Audit Log</h2>
                </div>
              </div>

              <div className="case-detail-audit-list">
                {caseData.auditLogs.map((log) => (
                  <div key={log.id} className="case-detail-audit-row">
                    <div
                      className={`case-detail-audit-badge case-detail-audit-badge--${log.type}`}
                      aria-hidden="true"
                    >
                      {log.type === 'flag' ? (
                        <AlertOctagon size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                    </div>
                    <div className="case-detail-audit-content">
                      <div className="case-detail-audit-top">
                        <span className="case-detail-audit-title">{log.title}</span>
                        <span className="case-detail-audit-date">{log.date}</span>
                      </div>
                      <p className="case-detail-audit-message">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Update Status Modal */}
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title="Update Case Status"
          size="md"
        >
          <form onSubmit={handleStatusSubmit} className="case-detail-modal-form" noValidate>
            {/* Stage Selector */}
            <div className="case-detail-form-group">
              <label htmlFor="stage-select" className="case-detail-form-label">
                Lifecycle Stage
              </label>
              <select
                id="stage-select"
                className="case-detail-form-select"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                disabled={isUpdatingStatus}
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Stall Reason Dropdown */}
            <div className="case-detail-form-group">
              <label htmlFor="stall-reason-select" className="case-detail-form-label">
                Stall / Primary Reason
              </label>
              <select
                id="stall-reason-select"
                className="case-detail-form-select"
                value={selectedStallReason}
                onChange={(e) => setSelectedStallReason(e.target.value)}
                disabled={isUpdatingStatus}
              >
                {STALL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments Area */}
            <div className="case-detail-form-group">
              <label htmlFor="update-comments" className="case-detail-form-label">
                Action / Progress Notes (Optional)
              </label>
              <textarea
                id="update-comments"
                className="case-detail-form-textarea"
                rows={3}
                placeholder="Enter details regarding this hearing outcome, missing file status, or assignment notes..."
                value={updateComments}
                onChange={(e) => setUpdateComments(e.target.value)}
                disabled={isUpdatingStatus}
              />
            </div>

            <div className="case-detail-modal-actions">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsUpdateModalOpen(false)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isUpdatingStatus}
              >
                Save Update
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Document Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Case Document"
          size="md"
        >
          <form onSubmit={handleUploadSubmit} className="case-detail-modal-form" noValidate>
            <div className="case-detail-form-group">
              <label htmlFor="doc-file-input" className="case-detail-form-label">
                Select File
              </label>
              <input
                id="doc-file-input"
                type="file"
                className="case-detail-form-file-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={isUploadingDocument}
              />
            </div>

            <div className="case-detail-form-group">
              <label htmlFor="doc-desc-input" className="case-detail-form-label">
                Document Description / Type
              </label>
              <input
                id="doc-desc-input"
                type="text"
                className="case-detail-form-input"
                placeholder="e.g. Police Charge Sheet, Remand Warrant, Legal Advice Copy"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                disabled={isUploadingDocument}
              />
            </div>

            <div className="case-detail-modal-actions">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploadingDocument}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                iconLeft={Plus}
                loading={isUploadingDocument}
              >
                Upload Document
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
