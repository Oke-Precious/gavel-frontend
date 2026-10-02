import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Hash,
  Search,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { publicApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateCaseHashId } from '../../utils/validators.js';
import './PublicLookupPage.css';

// Seeded live cases from backend for immediate public testing
const SAMPLE_CASES = [
  {
    hashId: 'GAV-26-AD447B',
    title: 'Civil Liberties Defense vs. Custodial Service',
    court: 'Ikeja High Court 3',
    stage: 'Pre-Trial',
    status: 'Active',
    detentionDays: '320+ Days',
    accent: 'rose',
  },
  {
    hashId: 'GAV-26-100697',
    title: 'State vs. Arraigned Detainee (Theft)',
    court: 'Ikeja Magistrate Court 4',
    stage: 'Pre-Trial',
    status: 'Active',
    detentionDays: '65 Days',
    accent: 'amber',
  },
  {
    hashId: 'GAV-26-3EF5FB',
    title: 'State vs. Federal Housing Commission',
    court: 'Lagos High Court 1',
    stage: 'Trial',
    status: 'Active',
    detentionDays: '42 Days',
    accent: 'emerald',
  },
  {
    hashId: 'GAV-26-8D1ABB',
    title: 'Apex Bank vs. Transcontinental Shipping',
    court: 'Abuja Federal High Court',
    stage: 'Judgment',
    status: 'Resolved',
    detentionDays: 'Resolved',
    accent: 'blue',
  },
];

export default function PublicLookupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseHashId, setCaseHashId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanId = caseHashId.trim().toUpperCase();
    const validationError = validateCaseHashId(cleanId);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const caseData = await publicApi.getCaseByHashId(cleanId);
      const finalHash = caseData?.hashId || cleanId;
      navigate(`/lookup/${encodeURIComponent(finalHash)}`);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate(`/lookup/not-found/${encodeURIComponent(cleanId)}`);
      } else if (!err.response) {
        toast.error('Network error — check your connection and try again.');
      } else {
        toast.error(err.response?.data?.message || 'Unable to look up this case right now.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleId) => {
    setCaseHashId(sampleId);
  };

  const handleCopy = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    toast.success(`Copied ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="lookup-page">
      <div className="container lookup-main-container">
        {/* Header */}
        <div className="lookup-hero-header">
          <div className="lookup-kicker">
            <Scale size={16} />
            <span>Public Case Docket Verification</span>
          </div>
          <h1 className="lookup-title">Track a Case by Hash ID</h1>
          <p className="lookup-subtitle">
            Enter an official GAVEL Case Hash ID to inspect remand duration, procedural milestones,
            court dockets, and statutory ACJA 2015 compliance.
          </p>
        </div>

        {/* Search Card */}
        <div className="lookup-card-wrapper">
          <form onSubmit={handleSearch} className="lookup-search-card" noValidate>
            <div className="lookup-input-block">
              <label htmlFor="case-hash-id-input" className="lookup-label">
                <span>Case Hash ID</span>
                <span className="lookup-label-help">Format: GAV-YY-XXXXXX</span>
              </label>

              <div className="lookup-input-row">
                <div className="lookup-input-icon-wrap">
                  <Hash size={20} className="lookup-icon" />
                </div>
                <input
                  id="case-hash-id-input"
                  type="text"
                  className="lookup-input"
                  placeholder="e.g. GAV-26-AD447B"
                  value={caseHashId}
                  onChange={(e) => setCaseHashId(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  autoComplete="off"
                  required
                />
                <button
                  type="submit"
                  className="lookup-submit-btn"
                  disabled={isLoading || !caseHashId.trim()}
                >
                  {isLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Inspect Case</span>
                      <Search size={18} />
                    </>
                  )}
                </button>
              </div>

              <p className="lookup-privacy-disclaimer">
                <Lock size={14} className="text-emerald-600 inline-block mr-1 flex-shrink-0" />
                <span>
                  <strong>Privacy Safeguard:</strong> Names, photographs, and personal addresses are
                  permanently encrypted to preserve defendant privacy and presumption of innocence.
                </span>
              </p>
            </div>
          </form>

          {/* Sample Cases Carousel / Chips */}
          <div className="lookup-samples-section">
            <div className="lookup-samples-header">
              <span className="lookup-samples-caption">Select an active test case record:</span>
            </div>

            <div className="lookup-samples-grid">
              {SAMPLE_CASES.map((item) => (
                <div
                  key={item.hashId}
                  onClick={() => handleSelectSample(item.hashId)}
                  className={`lookup-sample-card ${caseHashId === item.hashId ? 'lookup-sample-card--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sample-card-top">
                    <span className="sample-card-id">{item.hashId}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.hashId);
                      }}
                      className="sample-card-copy-btn"
                      title="Copy ID"
                    >
                      {copiedId === item.hashId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="sample-card-title">{item.title}</div>
                  <div className="sample-card-meta">
                    <span>{item.court}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`sample-badge sample-badge--${item.accent}`}>{item.detentionDays}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case ID Anatomy & Privacy Guarantees */}
        <div className="lookup-explainer-grid">
          {/* Box 1: Anatomy of Hash ID */}
          <div className="explainer-card">
            <h3 className="explainer-card__title">
              <Hash size={18} className="text-blue-600" />
              <span>Anatomy of a GAVEL Hash ID</span>
            </h3>
            <p className="explainer-card__text">
              Every filed matter is assigned a deterministic cryptographic identifier structured as:
            </p>
            <div className="anatomy-breakdown">
              <div className="anatomy-token">
                <span className="token-code">GAV</span>
                <span className="token-meaning">National Case Registry Code</span>
              </div>
              <span className="anatomy-dash">-</span>
              <div className="anatomy-token">
                <span className="token-code">26</span>
                <span className="token-meaning">Filing Year (2026)</span>
              </div>
              <span className="anatomy-dash">-</span>
              <div className="anatomy-token">
                <span className="token-code">AD447B</span>
                <span className="token-meaning">6-Character Hash Digest</span>
              </div>
            </div>
            <p className="anatomy-helper">
              This ID is printed on judicial remand slips, police dockets, and correctional inmate receipts.
            </p>
          </div>

          {/* Box 2: Verification vs Privacy */}
          <div className="explainer-card">
            <h3 className="explainer-card__title">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>What You Can & Cannot See</span>
            </h3>
            <div className="guarantee-comparison">
              <div className="comparison-col">
                <span className="comparison-badge comparison-badge--public">Publicly Auditable</span>
                <ul className="comparison-list">
                  <li>Court jurisdiction & judicial bench</li>
                  <li>Current lifecycle stage (e.g. Pre-Trial)</li>
                  <li>Days elapsed in detention vs. ACJA cap</li>
                  <li>Reason for procedural stall or delay</li>
                  <li>Pro-bono counsel representation status</li>
                </ul>
              </div>

              <div className="comparison-col">
                <span className="comparison-badge comparison-badge--private">Fully Protected</span>
                <ul className="comparison-list">
                  <li>Accused person's full legal name</li>
                  <li>Residential home addresses</li>
                  <li>Facial photographs & biometrics</li>
                  <li>Family & contact phone numbers</li>
                  <li>Confidential defense legal notes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Link to Pro-Bono */}
        <div className="lookup-footer-banner">
          <div className="footer-banner-left">
            <h4>Has a loved one exceeded the 28-day ACJA remand limit?</h4>
            <p>Our volunteer network of Nigerian Bar Association lawyers claims unrepresented cases.</p>
          </div>
          <Link to="/pro-bono" className="footer-banner-btn">
            <span>Explore Pro-Bono Docket</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
