import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import '../../debugRender';
import './footer.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function resolveName(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') {
    return [value?.firstName, value?.lastName].filter(Boolean).join(' ').trim();
  }
  return '';
}

function resolveSocials(data) {
  const socials = data?.socials || [];
  if (!Array.isArray(socials)) return [];
  return socials.filter(Boolean).map((item) => ({
    label: item?.label || item?.platform || '',
    url: item?.url || '',
    icon: item?.icon || item?.platform || '✦',
  })).filter((item) => item.url && item.label);
}

function resolveActions(data) {
  const actions = data?.actions || {};
  return {
    download: actions?.downloadInvitation !== false,
    share: actions?.shareInvitation !== false,
    location: actions?.openLocation !== false,
  };
}

export default function AuroraFooter({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Footer component mounted');
  }
  const bride = data?.names?.bride || '';
  const groom = data?.names?.groom || '';
  const date = data?.hero?.date || '';
  const venue = data?.venue?.name || '';
  const message = data?.footer?.message || 'Thank You For Being Part Of Our Story';
  const socials = useMemo(() => resolveSocials(data), [data]);
  const actions = useMemo(() => resolveActions(data), [data]);

  const handleDownload = (event) => {
    event.preventDefault();
    const downloadUrl = firstText(data?.downloadUrl, data?.pdfUrl);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    window.print();
  };

  const handleShare = async (event) => {
    event.preventDefault();
    const shareUrl = firstText(data?.shareUrl, data?.inviteUrl, window.location.href);
    const shareText = `${message} • ${[bride, groom].filter(Boolean).join(' & ') || 'Our celebration'}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Wedding Invitation', text: shareText, url: shareUrl });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        return;
      }

      window.prompt('Copy this invitation link', shareUrl);
    } catch {
      // Silent fallback for environments that block sharing gestures.
    }
  };

  const handleLocation = (event) => {
    event.preventDefault();
    const locationUrl = firstText(data?.venue?.mapUrl);
    const fallbackUrl = venue ? `https://www.google.com/maps?q=${encodeURIComponent(venue)}` : '';
    const targetUrl = locationUrl || fallbackUrl;

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="aurora-footer" aria-label="Closing message">
      <div className="aurora-footer__inner">
        <motion.div
          className="aurora-footer__content"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="aurora-footer__eyebrow">With gratitude</p>
          <h2 className="aurora-footer__message">{message}</h2>
          <p className="aurora-footer__copy">
            We are deeply grateful for every shared moment, every kind word, and every presence that made this celebration so meaningful.
          </p>

          <div className="aurora-footer__details">
            {(bride || groom) ? <div className="aurora-footer__detail">{[bride, groom].filter(Boolean).join(' & ')}</div> : null}
            {date ? <div className="aurora-footer__detail">{date}</div> : null}
            {venue ? <div className="aurora-footer__detail">{venue}</div> : null}
          </div>

          <div className="aurora-footer__divider" aria-hidden="true" />

          {socials.length ? (
            <div className="aurora-footer__socials" aria-label="Social links">
              {socials.map((social) => (
                <a key={social.label} className="aurora-footer__social" href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          ) : null}

          <div className="aurora-footer__actions">
            {actions.download ? (
              <button type="button" className="aurora-footer__action" onClick={handleDownload}>
                Download Invitation PDF
              </button>
            ) : null}
            {actions.share ? (
              <button type="button" className="aurora-footer__action" onClick={handleShare}>
                Share Invitation
              </button>
            ) : null}
            {actions.location ? (
              <button type="button" className="aurora-footer__action" onClick={handleLocation}>
                Open Location
              </button>
            ) : null}
          </div>

          <div className="aurora-footer__bottom">
            <p className="aurora-footer__signature">Crafted with love</p>
            <p className="aurora-footer__meta">Lumora • © 2026</p>
          </div>
        </motion.div>
      </div>

      <div className="aurora-footer__particles" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} className="aurora-footer__particle" style={{ left: `${10 + index * 8}%`, top: `${16 + (index % 4) * 16}%` }} />
        ))}
      </div>
    </footer>
  );
}
