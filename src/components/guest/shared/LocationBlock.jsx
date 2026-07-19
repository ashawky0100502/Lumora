import { GuestCard, SectionHeading, GuestButton } from './GuestUI';
import Reveal from './Reveal';

// Turns whatever the couple pasted into StepLocation into something that
// can actually render inside an <iframe> — a raw Google Maps share link
// isn't embeddable as-is, so this pulls the most reliable thing out of
// what we have: literal coordinates if the share link contains them
// (most do, as an "@lat,lng,zoom" segment), otherwise the venue name/
// address as a text query. No API key needed — maps.google.com's
// `output=embed` works unauthenticated for this.
function buildMapEmbedSrc({ mapsLink, venueName, locationDescription }) {
  if (mapsLink) {
    const coordMatch = mapsLink.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (coordMatch) {
      const [, lat, lng] = coordMatch;
      return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    }
  }
  const query = [venueName, locationDescription].filter(Boolean).join(', ');
  if (query) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }
  if (mapsLink) {
    return `https://www.google.com/maps?q=${encodeURIComponent(mapsLink)}&output=embed`;
  }
  return null;
}

export default function LocationBlock({ theme, venueName, locationDescription, parkingInfo, mapsLink, t }) {
  if (!venueName && !mapsLink) return null;

  const embedSrc = buildMapEmbedSrc({ mapsLink, venueName, locationDescription });

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <GuestCard theme={theme} className="text-center">
        <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
        {venueName && (
          <div className="mb-2 text-[1.15rem]" style={{ color: theme.ink, fontFamily: theme.displayFont }}>
            {venueName}
          </div>
        )}
        {locationDescription && (
          <p className="mb-4 text-[0.92rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
            {locationDescription}
          </p>
        )}
        {parkingInfo && (
          <p className="mb-4 text-[0.8rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
            {t.parking}: {parkingInfo}
          </p>
        )}
        {embedSrc && (
          <div className="mb-5 overflow-hidden rounded-xl border" style={{ borderColor: theme.surfaceBorder }}>
            <iframe
              src={embedSrc}
              width="100%"
              height="220"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={venueName || 'Map'}
            />
          </div>
        )}
        {mapsLink && (
          <a href={normalizeExternalUrl(mapsLink)} target="_blank" rel="noopener noreferrer">
            <GuestButton theme={theme}>{t.openMap}</GuestButton>
          </a>
        )}
      </GuestCard>
    </Reveal>
  );
}
