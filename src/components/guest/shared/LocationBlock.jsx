import { GuestCard, SectionHeading, GuestButton } from './GuestUI';
import Reveal from './Reveal';
import normalizeExternalUrl from '../../../lib/normalizeUrl.js';
import { getMapEmbedUrl, getMapsNavigationUrl, normalizeVenueData } from '../../../lib/mapService.js';

export default function LocationBlock({ theme, venueName, locationDescription, parkingInfo, mapsLink, t }) {
  if (!venueName && !mapsLink) return null;

  const normalized = normalizeVenueData({ venueName, venueAddress: locationDescription, mapsLink });
  const navigationUrl = getMapsNavigationUrl({ ...normalized, mapsLink });
  const embedSrc = getMapEmbedUrl({ ...normalized, mapsLink, venueName, venueAddress: locationDescription });

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
        {navigationUrl && (
          <a href={normalizeExternalUrl(navigationUrl)} target="_self" rel="noopener noreferrer">
            <GuestButton theme={theme}>{t.openMap}</GuestButton>
          </a>
        )}
      </GuestCard>
    </Reveal>
  );
}
