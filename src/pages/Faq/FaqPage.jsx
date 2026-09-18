import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import './FaqPage.css';

const FAQ_ITEMS = [
  {
    id: 'real-data',
    question: 'Is any of this real data?',
    answer: (
      <p>
        No. GAVEL is a concept platform built with synthetic data for demonstration
        purposes. It is not connected to any government or NGO system.
      </p>
    ),
  },
  {
    id: 'privacy',
    question: 'How is privacy protected?',
    answer: (
      <p>
        Public pages never display names or other identifying details. Cases are
        looked up using a Case Hash ID, and watching a case only requires an email
        address so GAVEL can send status-change alerts.
      </p>
    ),
  },
  {
    id: 'severe-warning',
    question: "What does 'Severe Warning' mean?",
    answer: (
      <p>
        Severe Warning means a person has been in custody for 91–180 days. It is the
        third of GAVEL&apos;s four alert levels and is already beyond the 28-day legal
        remand limit.
      </p>
    ),
  },
  {
    id: 'volunteer',
    question: 'Can I volunteer as a lawyer?',
    answer: (
      <p>
        Yes. A qualified lawyer can{' '}
        <Link to="/register">create a Volunteer Lawyer account</Link> and use the
        pro-bono matching flow to find and claim an unrepresented case.
      </p>
    ),
  },
];

export default function FaqPage() {
  const [openItemId, setOpenItemId] = useState(FAQ_ITEMS[0].id);

  const toggleItem = (itemId) => {
    setOpenItemId((currentItemId) => (currentItemId === itemId ? null : itemId));
  };

  return (
    <main className="faq-page">
      <div className="container faq-page__inner">
        <header className="faq-page__header">
          <h1>Frequently Asked Questions</h1>
          <p>Clear answers about GAVEL, case information, and privacy.</p>
        </header>

        <div className="faq-page__accordion">
          {FAQ_ITEMS.map(({ id, question, answer }) => {
            const isOpen = openItemId === id;
            const triggerId = `faq-trigger-${id}`;
            const panelId = `faq-panel-${id}`;

            return (
              <Card key={id} padding="sm" className="faq-page__item">
                <h2 className="faq-page__question">
                  <button
                    id={triggerId}
                    className="faq-page__trigger"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(id)}
                  >
                    <span>{question}</span>
                    <ChevronDown
                      className="faq-page__chevron"
                      data-open={isOpen}
                      size={20}
                      aria-hidden="true"
                    />
                  </button>
                </h2>

                {isOpen && (
                  <div
                    id={panelId}
                    className="faq-page__answer"
                    role="region"
                    aria-labelledby={triggerId}
                  >
                    {answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
