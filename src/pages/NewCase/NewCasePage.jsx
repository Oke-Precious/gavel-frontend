import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Folder,
  Landmark,
  Save,
  Scale,
  User,
} from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { casesApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './NewCasePage.css';

const OFFENSES = [
  'Theft',
  'Assault',
  'Fraud / Financial Crime',
  'Drug Offense',
  'Burglary / Robbery',
  'Traffic Offense',
  'Public Disturbance',
  'Other',
];

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
  'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const STAGES = [
  'Arrest',
  'Charge & Remand',
  'DPP Advice / Adjournment',
  'Trial or Discharge',
];

const STATUSES = [
  'Active',
  'Stalled',
  'Resolved',
];

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStructuredNotes(fields) {
  return [
    fields.caseSummary,
    'Structured intake notes:',
    `Offense Category: ${fields.offenseCategory}`,
    `State Jurisdiction: ${fields.state}`,
    `Arrest Date: ${fields.arrestDate || 'Not provided'}`,
    `Remand Start: ${fields.remandStartDate || 'Not provided'}`,
    `Next Hearing: ${fields.nextHearingDate || 'Not provided'}`,
    `Assigned Counsel: ${fields.assignedCounsel || 'Unassigned'}`,
    `File Location: ${fields.fileLocation || 'Not provided'}`,
    fields.backgroundNotes,
  ].filter(Boolean).join('\n\n');
}

export default function NewCasePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [caseNumber, setCaseNumber] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [offenseCategory, setOffenseCategory] = useState(OFFENSES[0]);
  const [court, setCourt] = useState('');
  const [state, setState] = useState(STATES[24]);
  const [stage, setStage] = useState(STAGES[1]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [arrestDate, setArrestDate] = useState('');
  const [remandStartDate, setRemandStartDate] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [assignedCounsel, setAssignedCounsel] = useState('');
  const [fileLocation, setFileLocation] = useState('');
  const [plaintiffs, setPlaintiffs] = useState('');
  const [defendants, setDefendants] = useState('');
  const [isProBono, setIsProBono] = useState(false);
  const [caseSummary, setCaseSummary] = useState('');
  const [backgroundNotes, setBackgroundNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanCaseNumber = caseNumber.trim();
    const cleanCaseTitle = caseTitle.trim();
    const cleanCourt = court.trim();
    const cleanCaseSummary = caseSummary.trim();

    if (!cleanCaseNumber || !cleanCaseTitle || !cleanCourt || !arrestDate || !remandStartDate) {
      toast.warning('Please complete all required case identity and custody fields.');
      return;
    }

    if (new Date(remandStartDate) < new Date(arrestDate)) {
      toast.warning('Remand Start cannot be earlier than Arrest Date.');
      return;
    }

    setIsLoading(true);

    try {
      // Real backend endpoint: POST /cases
      const created = await casesApi.create({
        caseNumber: cleanCaseNumber,
        title: cleanCaseTitle,
        court: cleanCourt,
        stage,
        status,
        isProBono,
        detentionDate: remandStartDate,
        plaintiffs: splitLines(plaintiffs),
        defendants: splitLines(defendants),
        description: formatStructuredNotes({
          caseSummary: cleanCaseSummary,
          offenseCategory,
          state,
          arrestDate,
          remandStartDate,
          nextHearingDate,
          assignedCounsel: assignedCounsel.trim(),
          fileLocation: fileLocation.trim(),
          backgroundNotes: backgroundNotes.trim(),
        }),
      });

      const createdCase = created?.case ?? created;
      const targetId = createdCase?._id;

      if (!targetId) {
        throw new Error('The server created the case but did not return its record ID.');
      }

      toast.success(`Case record "${cleanCaseNumber}" created successfully.`);
      navigate(`/cases/${targetId}`);
    } catch (error) {
      const message = !error.response
        ? error.message || 'Network error — check your connection and try again.'
        : error.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : error.response?.data?.message || 'Unable to create this case.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-case-page">
      <div className="new-case-container">
        <div className="new-case-top-nav">
          <button
            type="button"
            className="new-case-back-btn"
            onClick={() => navigate('/cases')}
            disabled={isLoading}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Case Directory</span>
          </button>
        </div>

        <Card padding="lg" className="new-case-card">
          <div className="new-case-card__header">
            <h1 className="new-case-card__title">Register New Case</h1>
            <p className="new-case-card__subtitle">
              Create a privacy-conscious case record for remand tracking, file accountability, and role-based follow-up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="new-case-form" noValidate>
            <section className="new-case-section" aria-labelledby="case-identity-heading">
              <div className="new-case-section__header">
                <FileText size={18} className="new-case-section__icon" aria-hidden="true" />
                <h2 id="case-identity-heading" className="new-case-section__title">Case Identity</h2>
              </div>

              <div className="new-case-form__grid">
                <div className="new-case-field">
                  <label htmlFor="case-number" className="new-case-label">Court Case Number *</label>
                  <input
                    id="case-number"
                    type="text"
                    className="new-case-input"
                    placeholder="e.g. FHC/001/2026"
                    value={caseNumber}
                    onChange={(event) => setCaseNumber(event.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="case-title" className="new-case-label">Case Title *</label>
                  <input
                    id="case-title"
                    type="text"
                    className="new-case-input"
                    placeholder="e.g. Commissioner of Police v. Detainee"
                    value={caseTitle}
                    onChange={(event) => setCaseTitle(event.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="offense-category" className="new-case-label">Offense Category *</label>
                  <select
                    id="offense-category"
                    className="new-case-select"
                    value={offenseCategory}
                    onChange={(event) => setOffenseCategory(event.target.value)}
                    disabled={isLoading}
                  >
                    {OFFENSES.map((offense) => (
                      <option key={offense} value={offense}>{offense}</option>
                    ))}
                  </select>
                </div>

                <div className="new-case-field">
                  <label htmlFor="case-summary" className="new-case-label">Allegation Summary</label>
                  <input
                    id="case-summary"
                    type="text"
                    className="new-case-input"
                    placeholder="Brief non-confidential procedural summary"
                    value={caseSummary}
                    onChange={(event) => setCaseSummary(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            <section className="new-case-section" aria-labelledby="court-record-heading">
              <div className="new-case-section__header">
                <Landmark size={18} className="new-case-section__icon" aria-hidden="true" />
                <h2 id="court-record-heading" className="new-case-section__title">Court & Record Location</h2>
              </div>

              <div className="new-case-form__grid">
                <div className="new-case-field">
                  <label htmlFor="state-select" className="new-case-label">State Jurisdiction *</label>
                  <select
                    id="state-select"
                    className="new-case-select"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    disabled={isLoading}
                  >
                    {STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>{stateName}</option>
                    ))}
                  </select>
                </div>

                <div className="new-case-field">
                  <label htmlFor="court-name" className="new-case-label">Court / Judicial Center *</label>
                  <input
                    id="court-name"
                    type="text"
                    className="new-case-input"
                    placeholder="e.g. Ikeja Magistrate Court 4"
                    value={court}
                    onChange={(event) => setCourt(event.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="new-case-field new-case-field--full">
                  <label htmlFor="file-location" className="new-case-label">File Location</label>
                  <div className="new-case-input-wrap">
                    <Folder size={16} className="new-case-input-icon" aria-hidden="true" />
                    <input
                      id="file-location"
                      type="text"
                      className="new-case-input new-case-input--icon"
                      placeholder="e.g. Ikeja Records Office"
                      value={fileLocation}
                      onChange={(event) => setFileLocation(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="new-case-section" aria-labelledby="custody-heading">
              <div className="new-case-section__header">
                <Calendar size={18} className="new-case-section__icon" aria-hidden="true" />
                <h2 id="custody-heading" className="new-case-section__title">Custody & Lifecycle</h2>
              </div>

              <div className="new-case-form__grid">
                <div className="new-case-field">
                  <label htmlFor="arrest-date" className="new-case-label">Arrest Date *</label>
                  <input
                    id="arrest-date"
                    type="date"
                    className="new-case-input"
                    value={arrestDate}
                    onChange={(event) => setArrestDate(event.target.value)}
                    disabled={isLoading}
                    max={today}
                    required
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="remand-start-date" className="new-case-label">Remand Start *</label>
                  <input
                    id="remand-start-date"
                    type="date"
                    className="new-case-input"
                    value={remandStartDate}
                    onChange={(event) => setRemandStartDate(event.target.value)}
                    disabled={isLoading}
                    max={today}
                    required
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="stage-select" className="new-case-label">Current Lifecycle Stage *</label>
                  <select
                    id="stage-select"
                    className="new-case-select"
                    value={stage}
                    onChange={(event) => setStage(event.target.value)}
                    disabled={isLoading}
                  >
                    {STAGES.map((stageName) => (
                      <option key={stageName} value={stageName}>{stageName}</option>
                    ))}
                  </select>
                </div>

                <div className="new-case-field">
                  <label htmlFor="status-select" className="new-case-label">Case Status *</label>
                  <select
                    id="status-select"
                    className="new-case-select"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    disabled={isLoading}
                  >
                    {STATUSES.map((statusName) => (
                      <option key={statusName} value={statusName}>{statusName}</option>
                    ))}
                  </select>
                </div>

                <div className="new-case-field">
                  <label htmlFor="next-hearing-date" className="new-case-label">Next Hearing Date</label>
                  <input
                    id="next-hearing-date"
                    type="date"
                    className="new-case-input"
                    value={nextHearingDate}
                    onChange={(event) => setNextHearingDate(event.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="assigned-counsel" className="new-case-label">Assigned Counsel</label>
                  <div className="new-case-input-wrap">
                    <User size={16} className="new-case-input-icon" aria-hidden="true" />
                    <input
                      id="assigned-counsel"
                      type="text"
                      className="new-case-input new-case-input--icon"
                      placeholder="Unassigned"
                      value={assignedCounsel}
                      onChange={(event) => setAssignedCounsel(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="new-case-section" aria-labelledby="parties-heading">
              <div className="new-case-section__header">
                <Scale size={18} className="new-case-section__icon" aria-hidden="true" />
                <h2 id="parties-heading" className="new-case-section__title">Parties & Access Notes</h2>
              </div>

              <div className="new-case-form__grid">
                <div className="new-case-field">
                  <label htmlFor="plaintiffs" className="new-case-label">Plaintiffs / Complainants</label>
                  <textarea
                    id="plaintiffs"
                    className="new-case-textarea"
                    rows={3}
                    placeholder="One party per line"
                    value={plaintiffs}
                    onChange={(event) => setPlaintiffs(event.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="new-case-field">
                  <label htmlFor="defendants" className="new-case-label">Defendants / Accused</label>
                  <textarea
                    id="defendants"
                    className="new-case-textarea"
                    rows={3}
                    placeholder="One party per line"
                    value={defendants}
                    onChange={(event) => setDefendants(event.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="new-case-field new-case-field--full">
                  <label className="new-case-checkbox-field">
                    <input
                      type="checkbox"
                      className="new-case-checkbox"
                      checked={isProBono}
                      onChange={(event) => setIsProBono(event.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="new-case-checkbox-label">
                      Mark as unrepresented case requiring Pro-Bono volunteer legal counsel
                    </span>
                  </label>
                </div>

                <div className="new-case-field new-case-field--full">
                  <label htmlFor="case-background-notes" className="new-case-label">Case Background Notes</label>
                  <textarea
                    id="case-background-notes"
                    className="new-case-textarea"
                    rows={4}
                    placeholder="Enter non-confidential procedural context, missing file notes, bail status, or custody transfer information."
                    value={backgroundNotes}
                    onChange={(event) => setBackgroundNotes(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            <div className="new-case-actions">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => navigate('/cases')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                iconLeft={Save}
              >
                Create Case
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
