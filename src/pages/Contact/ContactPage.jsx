import React, { useState } from 'react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmail, validateRequired } from '../../utils/validators.js';
import './ContactPage.css';

const CONTACT_ENDPOINT_AVAILABLE = false;

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (emailError) {
      toast.warning(emailError);
      return;
    }

    if (messageError) {
      toast.warning(messageError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!CONTACT_ENDPOINT_AVAILABLE) {
        throw new Error('Contact message delivery is not available yet.');
      }
    } catch (error) {
      toast.error(
        error.message ||
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
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                disabled={isSubmitting}
                rows={6}
                required
              />
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
        </Card>
      </div>
    </main>
  );
}
