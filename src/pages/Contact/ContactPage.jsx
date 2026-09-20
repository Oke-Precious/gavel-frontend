import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { contactApi } from '../../services/api.js';
import { validateEmail, validateRequired } from '../../utils/validators.js';
import './ContactPage.css';

const CONTACT_CATEGORIES = [
  { value: 'general_question', label: 'General Question' },
  { value: 'report_issue', label: 'Report an Issue' },
  { value: 'privacy_concern', label: 'Privacy Concern' },
  { value: 'case_information_concern', label: 'Case Information Concern' },
  { value: 'volunteer_legal_aid', label: 'Volunteer / Legal Aid' },
];

const MAX_MESSAGE_LENGTH = 5000;

const INITIAL_FORM = {
  name: '',
  email: '',
  category: CONTACT_CATEGORIES[0].value,
  message: '',
};

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentMessageId, setSentMessageId] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = form.email.trim();
    const cleanMessage = form.message.trim();
    const emailError = validateEmail(cleanEmail);
    const messageError = validateRequired(cleanMessage, 'Message');
    const categoryError = validateRequired(form.category, 'Category');

    if (emailError) {
      toast.warning(emailError);
      return;
    }

    if (messageError) {
      toast.warning(messageError);
      return;
    }

    if (categoryError) {
      toast.warning(categoryError);
      return;
    }

    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      toast.warning(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Wire to real backend endpoint: POST /contact
      const data = await contactApi.submit({
        name: form.name.trim() || undefined,
        email: cleanEmail,
        category: form.category,
        message: cleanMessage,
      });

      setSentMessageId(data?.messageId || 'sent');
      setForm(INITIAL_FORM);
      toast.success('Message sent successfully.');
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      const firstFieldError = fieldErrors && Object.values(fieldErrors)[0];
      toast.error(
        firstFieldError ||
          error.response?.data?.message ||
          'We could not send your message. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      <div className="container contact-page__inner">
        <header className="contact-page__header">
          <p className="contact-page__eyebrow">Contact / Report Issue</p>
          <h1>Tell us what needs attention.</h1>
          <p>
            Use this form for questions, feedback, or to report something that
            affects privacy, dignity, accessibility, or the accuracy of the demo
            experience.
          </p>
        </header>

        <Card padding="lg" className="contact-page__card">
          {sentMessageId ? (
            <div className="contact-page__success" role="status" aria-live="polite">
              <div className="contact-page__success-icon">
                <CheckCircle size={34} aria-hidden="true" />
              </div>
              <h2>Message Sent</h2>
              <p>
                Thank you. Your report has been received and routed to the GAVEL
                admin inbox for review.
              </p>
              <div className="contact-page__success-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => setSentMessageId('')}
                  className="contact-page__submit"
                >
                  Send Another Message
                </Button>
                <Link to="/" className="contact-page__home-link">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form className="contact-page__form" onSubmit={handleSubmit} noValidate>
              <div className="contact-page__field">
                <label htmlFor="contact-name">Name (optional)</label>
                <input
                  id="contact-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>

              <div className="contact-page__field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="contact-page__field">
                <label htmlFor="contact-category">Category</label>
                <select
                  id="contact-category"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  {CONTACT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="contact-page__field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  maxLength={MAX_MESSAGE_LENGTH}
                  required
                />
                <span className="contact-page__hint">
                  {form.message.length}/{MAX_MESSAGE_LENGTH} characters
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="contact-page__submit"
              >
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
