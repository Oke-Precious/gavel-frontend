import React, { useCallback, useEffect, useState } from 'react';
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
import { casesApi, documentsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { daysInCustody, formatDate, formatDateTime } from '../../utils/formatDate.js';
import { getAlertLevel } from '../../utils/formatAlertLevel.js';
import './CaseDetailPage.css';

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

function stageIndex(stage) {
  const normalized = String(stage ?? '').toLowerCase();
  if (normalized.includes('trial') || normalized.includes('discharge') || normalized.includes('closed')) return 3;
  if (normalized.includes('dpp') || normalized.includes('adjourn')) return 2;
  if (normalized.includes('charge') || normalized.includes('remand') || normalized.includes('pre-trial')) return 1;
  return 0;
}

function normalizeDocuments(payload) {
  const documents = Array.isArray(payload) ? payload : (payload?.documents ?? []);
  return documents.map((document) => ({
    id: document._id ?? document.id,
    name: document.originalName ?? document.filename ?? document.fileName ?? document.name ?? 'Document',
    uploadedAt: formatDate(document.uploadedAt ?? document.createdAt),
    size: (document.size ?? document.fileSize)
      ? `${Math.ceil((document.size ?? document.fileSize) / 1024)} KB`
      : '',
    fileUrl: document.fileUrl,
  }));
}

function normalizeAuditLogs(payload) {
  const logs = Array.isArray(payload) ? payload : (payload?.history ?? payload?.auditLog ?? []);
  return logs.map((log) => ({
    id: log._id ?? log.id,
    type: log.type === 'flag' ? 'flag' : 'update',
    title: log.action ?? 'Status Update',
    date: formatDateTime(log.timestamp ?? log.createdAt),
    message: log.comments ?? log.note ?? `${log.previousStage ?? 'Previous stage'} → ${log.newStage ?? log.stage ?? 'Updated'}`,
  }));
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRole } = useAuth();

  const caseId = id;

  // Core State
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const fetchCase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [data, documentPayload, auditPayload] = await Promise.all([
        casesApi.getById(caseId),
        documentsApi.list(caseId).catch(() => []),
        casesApi.auditLog(caseId).catch(() => []),
      ]);
      const custodyDays = data.detentionDate ? daysInCustody(data.detentionDate) : null;
      const lawyers = Array.isArray(data.lawyers) ? data.lawyers : [];
      setCaseData({
        id: data._id ?? caseId,
        caseHashId: data.hashId ?? data.caseNumber ?? '—',
        state: data.state ?? 'Not provided',
        court: data.court ?? 'Not provided',
        offenseCategory: data.offenseCategory ?? data.title ?? 'Not provided',
        arrestDate: formatDate(data.arrestDate ?? data.detentionDate),
        remandStart: formatDate(data.remandStartDate ?? data.detentionDate),
        assignedCounsel: lawyers.length
          ? lawyers.map((lawyer) => `${lawyer.firstName ?? ''} ${lawyer.lastName ?? ''}`.trim()).join(', ')
          : 'Unassigned',
        fileLocation: data.fileLocation ?? 'Not provided',
        alertLevel: custodyDays == null ? null : getAlertLevel(custodyDays).level,
        currentStageIndex: stageIndex(data.stage),
        stages: STAGES.map((label) => ({ label })),
        documents: normalizeDocuments(documentPayload),
        auditLogs: normalizeAuditLogs(auditPayload),
      });
    } catch (requestError) {
      setCaseData(null);
      setError(!requestError?.response
        ? 'Network error — check your connection and try again.'
        : requestError.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : requestError.response?.data?.message ?? `Case record "${caseId}" was not found.`);
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(fetchCase, 0);
    return () => window.clearTimeout(loadTimer);
  }, [fetchCase]);

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
    if (!updateComments.trim()) {
      toast.warning('Note is required for every status update.');
      return;
    }
    setIsUpdatingStatus(true);

    try {
      await casesApi.updateStatus(caseData.id, {
        stage: selectedStage,
        stallReason: selectedStallReason,
        comments: updateComments.trim(),
      });
      await fetchCase();
      toast.success('Case status updated successfully.');
      setIsUpdateModalOpen(false);
    } catch (requestError) {
      const message = !requestError?.response
        ? 'Network error — check your connection and try again.'
        : requestError.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : requestError.response?.data?.message ?? 'Unable to update this case.';
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('Please select a file to upload.');
      return;
    }

    setIsUploadingDocument(true);
    const fileName = selectedFile ? selectedFile.name : 'Court_Document.pdf';
    try {
      const uploaded = await documentsApi.upload(caseData.id, selectedFile, fileDescription.trim());
      const [newDoc] = normalizeDocuments([uploaded?.document ?? uploaded]);
      toast.success(`Document "${fileName}" uploaded successfully.`);
      setCaseData((prev) => ({
        ...prev,
        documents: newDoc ? [newDoc, ...prev.documents] : prev.documents,
      }));
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFileDescription('');
    } catch (requestError) {
      const message = !requestError?.response
        ? 'Network error — check your connection and try again.'
        : requestError.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : requestError.response?.data?.message ?? 'Unable to upload this document.';
      toast.error(message);
    } finally {
      setIsUploadingDocument(false);
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
                onAction={fetchCase}
              />
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
        </div>

        {/* Case Header */}
        <div className="case-detail-header">
          <div className="case-detail-header__info">
            <div className="case-detail-header__title-row">
              <h1 className="case-detail-header__title">{caseData.caseHashId}</h1>
              {caseData.alertLevel && <StatusPill level={caseData.alertLevel} size="md" />}
            </div>
            <p className="case-detail-header__subtitle">
              <MapPin size={16} className="case-detail-header__icon" aria-hidden="true" />
              <span>
                {caseData.state} · {caseData.court}
              </span>
            </p>
          </div>

          {hasRole('admin', 'clerk', 'judge') && (
            <Button
              variant="primary"
              size="md"
              iconLeft={RefreshCw}
              onClick={handleOpenUpdateModal}
              className="case-detail-update-btn"
            >
              Update Status
            </Button>
          )}
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
                {hasRole('admin', 'clerk', 'lawyer') && (
                  <Button variant="secondary" size="sm" iconLeft={Upload} onClick={() => setIsUploadModalOpen(true)}>
                    Upload
                  </Button>
                )}
              </div>

              <div className="case-detail-docs-list">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className="case-detail-doc-row">
                    <div className="case-detail-doc-icon" aria-hidden="true">
                      <File size={20} />
                    </div>
                    <div className="case-detail-doc-info">
                      {doc.fileUrl ? (
                        <a
                          className="case-detail-doc-name"
                          href={documentsApi.fileUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {doc.name}
                        </a>
                      ) : (
                        <span className="case-detail-doc-name">{doc.name}</span>
                      )}
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
                New Stage
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
                Stall Reason
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
                Note
              </label>
              <textarea
                id="update-comments"
                className="case-detail-form-textarea"
                rows={3}
                placeholder="Enter details regarding this hearing outcome, missing file status, or assignment notes..."
                value={updateComments}
                onChange={(e) => setUpdateComments(e.target.value)}
                disabled={isUpdatingStatus}
                required
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
