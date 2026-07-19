import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import '../../debugRender';
import './venue.css';
import normalizeExternalUrl from '../../../../../../lib/normalizeUrl.js';
import { getMapEmbedUrl, getMapsNavigationUrl } from '../../../../../../lib/mapService.js';

function normalizeVenue(data) {
  return {
    name: data?.venue?.name || '',
    address: data?.venue?.address || '',
    ceremonyTime: data?.venue?.ceremonyTime || '',
    receptionTime: data?.venue?.receptionTime || '',
    image: data?.venue?.image || '',
    mapUrl: data?.venue?.mapUrl || '',
    mapLat: data?.venue?.mapLat || data?.mapsLat || undefined,
    mapLng: data?.venue?.mapLng || data?.mapsLng || undefined,
    parkingInfo: data?.venue?.parkingInfo || data?.parkingInfo || '',
  };
}

function buildMapEmbedUrl(mapUrl, lat, lng, venueName, address) {
  return getMapEmbedUrl({
    venueName,
    venueAddress: address,
    latitude: lat,
    longitude: lng,
    mapsLink: mapUrl,
  });
}

export default function AuroraVenue({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Venue component mounted');
  }
  const [copied, setCopied] = useState(false);
  const venue = useMemo(() => normalizeVenue(data), [data]);
  const hasImage = Boolean(venue.image);
  const hasMap = Boolean(venue.mapUrl || venue.mapLat || venue.mapLng);
  const embedMapUrl = useMemo(() => buildMapEmbedUrl(venue.mapUrl, venue.mapLat, venue.mapLng, venue.name, venue.address), [venue.mapUrl, venue.mapLat, venue.mapLng, venue.name, venue.address]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Celebration at ${venue.name}`);
    const details = encodeURIComponent(`Ceremony: ${venue.ceremonyTime}\nReception: ${venue.receptionTime}\nAddress: ${venue.address}`);
    const location = encodeURIComponent(venue.address);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`, '_blank', 'noopener,noreferrer');
  };

  const mapUrl = getMapsNavigationUrl({
    venueName: venue.name,
    venueAddress: venue.address,
    latitude: venue.mapLat,
    longitude: venue.mapLng,
    mapsLink: venue.mapUrl,
  });

  return (
    <section className="aurora-venue" aria-labelledby="aurora-venue-title">
      <div className="aurora-venue__inner">
        <div className="aurora-venue__intro">
          <p className="aurora-venue__eyebrow">The destination</p>
          <h2 id="aurora-venue-title" className="aurora-venue__title">THE DESTINATION</h2>
          <p className="aurora-venue__copy">
            A private setting, sculpted with discretion and warmth, where the celebration unfolds with effortless grace.
          </p>
        </div>

        <div className="aurora-venue__layout">
          {hasImage ? (
            <motion.div
              className="aurora-venue__image-wrap"
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              whileInView={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img className="aurora-venue__image" src={venue.image} alt={venue.name} loading="lazy" />
              <div className="aurora-venue__image-overlay" />
              <div className="aurora-venue__particles" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span key={index} className="aurora-venue__particle" style={{ left: `${12 + index * 10}%`, top: `${16 + (index % 4) * 14}%` }} />
                ))}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            className="aurora-venue__card"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="aurora-venue__card-inner">
              <p className="aurora-venue__label">Venue</p>
              <h3 className="aurora-venue__name">{venue.name}</h3>
              <div className="aurora-venue__details">
                <div className="aurora-venue__detail">
                  <span className="aurora-venue__detail-title">Address</span>
                  <div className="aurora-venue__detail-value">{venue.address}</div>
                </div>
                <div className="aurora-venue__detail">
                  <span className="aurora-venue__detail-title">Ceremony</span>
                  <div className="aurora-venue__detail-value">{venue.ceremonyTime}</div>
                </div>
                <div className="aurora-venue__detail">
                  <span className="aurora-venue__detail-title">Reception</span>
                  <div className="aurora-venue__detail-value">{venue.receptionTime}</div>
                </div>
              </div>

              <div className="aurora-venue__actions">
                {mapUrl ? <a className="aurora-venue__button" href={normalizeExternalUrl(mapUrl)} target="_blank" rel="noopener noreferrer">Open in Google Maps</a> : null}
                <button type="button" className="aurora-venue__button" onClick={handleCopyAddress}>{copied ? 'Address copied' : 'Copy Address'}</button>
                <button type="button" className="aurora-venue__button" onClick={handleAddToCalendar}>Add to Calendar</button>
              </div>

              {hasMap ? (
                <div className="aurora-venue__map">
                  {embedMapUrl ? (
                    <iframe
                      className="aurora-venue__map-frame"
                      title={`${venue.name} map`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={embedMapUrl}
                    />
                  ) : (
                    <div className="aurora-venue__placeholder">
                      <div>
                        <strong>Map link available</strong>
                        <div>Open the location in Google Maps from the button above.</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
