import { useState } from 'react';
import { submitRsvp } from '../lib/guestApi';

export default function useRSVP(initialSlug, initialData = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const content = {
    title: (initialData?.rsvp?.title || initialData?.rsvpTitle) || 'We Would Be Honored',
    subtitle: (initialData?.rsvp?.subtitle || initialData?.rsvpSubtitle) || 'Your response will complete the invitation and remain treasured with the evening.',
    fields: initialData?.rsvp?.fields || {},
  };

  async function send(slug = initialSlug, { name, status, guestCount }) {
    setError('');
    if (!name || !slug) {
      throw new Error('name and slug required');
    }
    setBusy(true);
    try {
      await submitRsvp(slug, { name, status, guestCount });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Unable to submit RSVP');
      throw err;
    } finally {
      setBusy(false);
    }
  }

  return {
    content,
    busy,
    error,
    submitted,
    send,
  };
}
