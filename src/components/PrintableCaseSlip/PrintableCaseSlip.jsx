import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, X, Shield, Calendar, MapPin, Scale, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { daysInCustody } from '../../utils/formatDate.js';
import './PrintableCaseSlip.css';

export default function PrintableCaseSlip({ caseData, isOpen, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const caseHashId = caseData?.caseHashId || caseData?.id || 'GAV-26-DEMO';
  const verifyUrl = `${window.location.origin}/case/${encodeURIComponent(caseHashId)}`;

  useEffect(() => {
    if (caseHashId) {
      QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [caseHashId, verifyUrl]);

  if (!isOpen) return null;

  const daysHeld = caseData?.remandStartDate ? daysInCustody(caseData.remandStartDate) : 42;
  const isOverdue = daysHeld > 28;
  const daysOverdue = Math.max(0, daysHeld - 28);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="case-slip-modal-backdrop" onClick={onClose}>
      <div className="case-slip-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar (Hidden in Print) */}
        <div className="case-slip-modal-header no-print">
          <div className="case-slip-header-title">
            <FileText size={18} className="text-cyan" />
            <span>Official ACJA Section 296 Remand Docket Slip</span>
          </div>
          <div className="case-slip-header-actions">
            <button
              type="button"
              className="case-slip-print-btn"
              onClick={handlePrint}
              autoFocus
            >
              <Printer size={16} />
              <span>Print Slip / Save PDF</span>
            </button>
            <button
              type="button"
              className="case-slip-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Docket Slip Document */}
        <div className="case-slip-document" id="printable-docket-area">
          {/* Header & Crest */}
          <div className="slip-official-header">
            <div className="slip-emblem">
              <Scale size={32} />
            </div>
            <div className="slip-header-text">
              <h2>FEDERAL REPUBLIC OF NIGERIA</h2>
              <h3>STATUTORY REMAND OVERSIGHT DOCKET</h3>
              <p className="slip-statutory-notice">
                Pursuant to Section 296, Administration of Criminal Justice Act (ACJA 2015)
              </p>
            </div>
            <div className="slip-doc-id-box">
              <span className="slip-doc-label">OFFICIAL HASH</span>
              <strong className="slip-doc-hash">{caseHashId}</strong>
            </div>
          </div>

          <div className="slip-divider-line" />

          {/* Main Body Matrix: Left Details, Right QR Code */}
          <div className="slip-content-grid">
            <div className="slip-details-col">
              <div className="slip-field-row">
                <span className="slip-field-label">PUBLIC CASE HASH ID:</span>
                <span className="slip-field-value mono bold">{caseHashId}</span>
              </div>
              <div className="slip-field-row">
                <span className="slip-field-label">JUDICIAL DIVISION:</span>
                <span className="slip-field-value">{caseData?.court || 'Ikeja High Court 3, Lagos'}</span>
              </div>
              <div className="slip-field-row">
                <span className="slip-field-label">CUSTODIAL FACILITY:</span>
                <span className="slip-field-value">{caseData?.custodialCenter || 'Kirikiri Maximum Custodial Centre'}</span>
              </div>
              <div className="slip-field-row">
                <span className="slip-field-label">OFFENSE CATEGORY:</span>
                <span className="slip-field-value">{caseData?.offenseCategory || 'Non-Capital Offense / Petty Arraignment'}</span>
              </div>
              <div className="slip-field-row">
                <span className="slip-field-label">FILE LOCATION / CUSTODY:</span>
                <span className="slip-field-value bold text-accent">
                  {caseData?.fileLocation || 'Directorate of Public Prosecutions (DPP) — Legal Advice'}
                </span>
              </div>
              <div className="slip-field-row">
                <span className="slip-field-label">ASSIGNED DEFENSE COUNSEL:</span>
                <span className="slip-field-value">{caseData?.assignedCounsel || 'Legal Aid Council of Nigeria (LACON)'}</span>
              </div>
            </div>

            {/* Verification QR Code Box */}
            <div className="slip-qr-col">
              <div className="slip-qr-box">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt={`QR Code for ${caseHashId}`} className="slip-qr-img" />
                ) : (
                  <div className="slip-qr-loading">Generating QR...</div>
                )}
                <span className="slip-qr-hint">Scan with camera to verify custody status on live ledger</span>
              </div>
            </div>
          </div>

          {/* Statutory Custody Status Banner */}
          <div className={`slip-statutory-box ${isOverdue ? 'is-overdue' : 'is-compliant'}`}>
            <div className="slip-statutory-badge">
              {isOverdue ? (
                <>
                  <AlertTriangle size={18} />
                  <span>STATUTORY LIMIT EXCEEDED</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>STATUTORY REMAND COMPLIANT</span>
                </>
              )}
            </div>
            <div className="slip-statutory-counts">
              <div className="slip-count-cell">
                <span className="count-label">Days in Custody</span>
                <strong className="count-val">{daysHeld} Days</strong>
              </div>
              <div className="slip-count-cell">
                <span className="count-label">ACJA Legal Limit</span>
                <strong className="count-val">28 Days</strong>
              </div>
              <div className="slip-count-cell">
                <span className="count-label">Status Delta</span>
                <strong className="count-val highlight">
                  {isOverdue ? `+${daysOverdue} Days Overdue` : `${28 - daysHeld} Days Remaining`}
                </strong>
              </div>
            </div>
          </div>

          {/* Legal Certification and Signatures */}
          <div className="slip-signatures-section">
            <div className="slip-sig-block">
              <div className="slip-sig-line" />
              <span className="slip-sig-role">Correctional Records Officer Signature</span>
              <span className="slip-sig-sub">Nigerian Correctional Service (NCoS)</span>
            </div>
            <div className="slip-seal-stamp">
              <div className="slip-seal-inner">
                <span>GAVEL OFFICIAL</span>
                <strong>ACJA 2015</strong>
                <span>AUDIT DOCKET</span>
              </div>
            </div>
            <div className="slip-sig-block">
              <div className="slip-sig-line" />
              <span className="slip-sig-role">Legal Aid Liaison / Court Registrar</span>
              <span className="slip-sig-sub">Magistrate / High Court Registry</span>
            </div>
          </div>

          {/* Privacy & Anti-Stigma Notice */}
          <div className="slip-footer-notice">
            <Shield size={12} className="slip-shield-icon" />
            <span>
              PRIVACY COMPLIANCE: In accordance with Section 36(5) of the 1999 Constitution (Presumption of Innocence), this docket uses a non-reversible cryptographic hash. It does not publish personal names or home addresses.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
