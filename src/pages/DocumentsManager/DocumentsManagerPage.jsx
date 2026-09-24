import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { casesApi, documentsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import '../UpdateCaseStatus/UpdateCaseStatusPage.css';
import './DocumentsManagerPage.css';

const SAMPLE_DOCUMENTS = [
  {
    id: 'sample-arrest-report',
    name: 'Arrest Report.pdf',
    uploadedAt: 'Sample file card',
    size: '',
    sample: true,
  },
  {
    id: 'sample-bail-application',
    name: 'Bail Application.pdf',
    uploadedAt: 'Sample file card',
    size: '',
    sample: true,
  },
];

function getErrorMessage(error, fallback) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response?.data?.message ?? fallback;
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export default function DocumentsManagerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseRecord, setCaseRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [caseData, documentPayload] = await Promise.all([
        casesApi.getById(id),
        documentsApi.list(id),
      ]);
      setCaseRecord(caseData);
      setDocuments(normalizeDocuments(documentPayload));
    } catch (requestError) {
      setCaseRecord(null);
      setDocuments([]);
      setError(getErrorMessage(requestError, 'Unable to load case documents.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadDocuments, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadDocuments]);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.warning('Please select a document to upload.');
      return;
    }

    setUploading(true);

    try {
      await documentsApi.upload(id, selectedFile, description.trim());
      toast.success(`Document "${selectedFile.name}" uploaded successfully.`);
      setUploadOpen(false);
      setSelectedFile(null);
      setDescription('');
      await loadDocuments();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'Unable to upload this document.'));
    } finally {
      setUploading(false);
    }
  };

  const displayedDocuments = documents.length ? documents : SAMPLE_DOCUMENTS;

  if (loading) {
    return (
      <div className="case-operation-page">
        <div className="case-operation-page__shell">
          <Skeleton variant="text" width="240px" height={32} />
          <div className="documents-manager__grid">
            <Skeleton variant="card" height={160} />
            <Skeleton variant="card" height={160} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-operation-page">
        <div className="case-operation-page__shell case-operation-page__shell--narrow">
          <Card padding="xl">
            <EmptyState
              icon="alert"
              message="Unable to Load Documents"
              subtext={error}
              actionLabel="Try Again"
              onAction={loadDocuments}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="case-operation-page">
      <div className="case-operation-page__shell">
        <button type="button" className="case-operation-page__back" onClick={() => navigate(`/cases/${id}`)} disabled={uploading}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Case</span>
        </button>

        <div className="documents-manager__header">
          <div>
            <h1>Documents Manager</h1>
            <p>{caseRecord?.hashId ?? caseRecord?.caseNumber ?? 'Case documents'}</p>
          </div>
          <Button type="button" variant="primary" size="md" iconLeft={Upload} onClick={() => setUploadOpen(true)}>
            Upload Document
          </Button>
        </div>

        <div className="documents-manager__grid" aria-label="Case documents">
          {displayedDocuments.map((document) => (
            <Card key={document.id} padding="lg" className="documents-manager__file-card">
              <div className="documents-manager__file-icon" aria-hidden="true">
                <FileText size={24} />
              </div>
              <div className="documents-manager__file-body">
                {document.fileUrl ? (
                  <a href={documentsApi.fileUrl(document.fileUrl)} target="_blank" rel="noreferrer">
                    {document.name}
                  </a>
                ) : (
                  <span>{document.name}</span>
                )}
                <p>
                  {document.uploadedAt}
                  {document.size ? ` - ${document.size}` : ''}
                </p>
              </div>
              <span className="documents-manager__visibility">Visible to: Legal Aid, Admin</span>
            </Card>
          ))}
        </div>

        {!documents.length && (
          <p className="documents-manager__empty-note" aria-live="polite">
            These sample cards show the document layout. Uploaded files from this case will appear here.
          </p>
        )}
      </div>

      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        size="md"
        closeOnBackdrop={!uploading}
        showCloseButton={!uploading}
      >
        <form onSubmit={handleUpload} className="case-operation-form" noValidate>
          <div className="case-operation-field">
            <label htmlFor="document-file">Document File</label>
            <input
              id="document-file"
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              disabled={uploading}
              required
            />
          </div>

          <div className="case-operation-field">
            <label htmlFor="document-description">Document Description</label>
            <input
              id="document-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Arrest Report, Bail Application"
              disabled={uploading}
            />
          </div>

          <div className="case-operation-actions">
            <Button type="button" variant="ghost" size="md" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" iconLeft={Upload} loading={uploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
