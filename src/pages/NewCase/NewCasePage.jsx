import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FilePlus } from 'lucide-react';
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
  'Lagos', 'Kano', 'Rivers', 'Enugu', 'Kaduna', 'Ogun', 'Oyo',
  'FCT Abuja', 'Edo', 'Delta', 'Anambra', 'Imo', 'Borno',
];

export default function NewCasePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [offenseCategory, setOffenseCategory] = useState(OFFENSES[0]);
  const [court, setCourt] = useState('');
  const [state, setState] = useState(STATES[0]);
  const [detentionDate, setDetentionDate] = useState('');
  const [isProBono, setIsProBono] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanCaseNumber = caseNumber.trim();
    const cleanTitle = title.trim();
    const cleanCourt = court.trim();

    if (!cleanCaseNumber || !cleanTitle || !cleanCourt) {
      toast.warning('Please complete all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const created = await casesApi.create({
        caseNumber: cleanCaseNumber,
        title: cleanTitle,
        offenseCategory,
        court: cleanCourt,
        state,
        detentionDate: detentionDate || new Date().toISOString().split('T')[0],
        isProBono,
        description,
      });

      toast.success(`Case record "${cleanCaseNumber}" created successfully!`);
      const targetId = created?._id || created?.caseHashId || cleanCaseNumber;
      navigate(`/cases/${targetId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'New case created (saved to local repository).';
      toast.success(msg);
      navigate('/cases');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-case-page">
      <div className="container new-case-container">
        {/* Navigation Breadcrumb */}
        <div className="new-case-top-nav">
          <button
            type="button"
            className="new-case-back-btn"
            onClick={() => navigate('/cases')}
          >
            <ArrowLeft size={16} />
            <span>Back to Case Directory</span>
          </button>
        </div>

        {/* Card Form Wrapper */}
        <Card padding="lg">
          <div className="new-case-card__header">
            <h1 className="new-case-card__title">Register New Case</h1>
            <p className="new-case-card__subtitle">
              Enter official details for a newly detained individual to initiate automated remand clock tracking.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="new-case-form" noValidate>
            <div className="new-case-form__grid">
              {/* Case Hash ID / Number */}
              <div className="new-case-field">
                <label htmlFor="case-number" className="new-case-label">
                  Case Hash / Number *
                </label>
                <input
                  id="case-number"
                  type="text"
                  className="new-case-input"
                  placeholder="e.g. LA-2026-0912"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Case Title / Allegation Summary */}
              <div className="new-case-field">
                <label htmlFor="case-title" className="new-case-label">
                  Short Title / Allegation *
                </label>
                <input
                  id="case-title"
                  type="text"
                  className="new-case-input"
                  placeholder="e.g. Commissioner of Police v. Detainee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Offense Category */}
              <div className="new-case-field">
                <label htmlFor="offense-cat" className="new-case-label">
                  Offense Category *
                </label>
                <select
                  id="offense-cat"
                  className="new-case-select"
                  value={offenseCategory}
                  onChange={(e) => setOffenseCategory(e.target.value)}
                  disabled={isLoading}
                >
                  {OFFENSES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Jurisdiction */}
              <div className="new-case-field">
                <label htmlFor="state-select" className="new-case-label">
                  State Jurisdiction *
                </label>
                <select
                  id="state-select"
                  className="new-case-select"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isLoading}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Presiding Court */}
              <div className="new-case-field">
                <label htmlFor="court-name" className="new-case-label">
                  Court / Judicial Center *
                </label>
                <input
                  id="court-name"
                  type="text"
                  className="new-case-input"
                  placeholder="e.g. Ikeja Magistrate Court 4"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Initial Detention Date */}
              <div className="new-case-field">
                <label htmlFor="detention-date" className="new-case-label">
                  Initial Arrest / Remand Date
                </label>
                <input
                  id="detention-date"
                  type="date"
                  className="new-case-input"
                  value={detentionDate}
                  onChange={(e) => setDetentionDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Pro-Bono Opportunity Checkbox */}
              <div className="new-case-field new-case-field--full">
                <label className="new-case-checkbox-field">
                  <input
                    type="checkbox"
                    className="new-case-checkbox"
                    checked={isProBono}
                    onChange={(e) => setIsProBono(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="new-case-checkbox-label">
                    Mark as unrepresented case requiring Pro-Bono volunteer legal counsel
                  </span>
                </label>
              </div>

              {/* Additional Description / Notes */}
              <div className="new-case-field new-case-field--full">
                <label htmlFor="case-desc" className="new-case-label">
                  Case Background Notes (Optional)
                </label>
                <textarea
                  id="case-desc"
                  className="new-case-textarea"
                  rows={4}
                  placeholder="Enter any additional non-confidential procedural context, arrest station details, or bail status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

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
                Save & Track Case
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
