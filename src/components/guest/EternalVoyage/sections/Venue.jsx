import useScrollReveal from './lib/useScrollReveal';
import { firstText } from './lib/builderData';
import normalizeExternalUrl from '../../../../lib/normalizeUrl.js';
import { getMapsNavigationUrl } from '../../../../lib/mapService.js';

/**
 * ETERNAL VOYAGE — Venue section (premium cinematic pass).
 *
 * StepLocation.jsx (the Builder step for this data) saves flat,
 * top-level fields onto `data` — `venueName`, `mapsLink`,
 * `locationDescription`, `parkingInfo` — the exact same fields the
 * shared `LocationBlock.jsx` reads for every other template. There
 * has never been a nested `data.venue`/`data.location` object or a
 * `data.mapUrl` key; those were resolved defensively "just in case"
 * but never matched what the Builder actually writes, which silently
 * dropped the address/map-link fields even when they were filled in.
 *
 * The "map" in this template has only ever been an outbound link to
 * whatever map URL the Builder already stored (`mapsLink`) — there is
 * no embedded map iframe/API anywhere in Eternal Voyage today. Per the
 * "use only the existing map, don't recreate Google Maps, don't create
 * new APIs" instruction, this pass does not stand up a new map embed.
 * Instead it keeps exactly that existing link/button, unchanged
 * (`href={mapsLink}`, same target/rel, Builder value untouched), and
 * elevates it into a premium glass "map frame" — a decorative luxury
 * surround (gold pin, soft glow, glass border) built entirely from CSS
 * and an inline SVG icon, with no network calls of its own.
 */
function resolveVenue(data) {
  const source = data?.venue || data?.location || {};

  const name = firstText(source.name, source.venueName, data?.venueName);
  const address = firstText(
    source.address,
    typeof source.location === 'string' ? source.location : '',
    data?.venueAddress,
    data?.locationDescription
  );
  const note = firstText(source.note, source.notes, source.description, data?.parkingInfo);
  const mapUrl = getMapsNavigationUrl({
    venueName: name,
    venueAddress: address,
    latitude: firstText(data?.latitude, data?.mapsLat, source?.latitude, source?.lat),
    longitude: firstText(data?.longitude, data?.mapsLng, source?.longitude, source?.lng),
    mapsLink: firstText(
      source.mapUrl,
      source.mapLink,
      source.googleMapsUrl,
      typeof source.map === 'string' ? source.map : '',
      data?.mapUrl,
      data?.mapsLink
    ),
  });

  return { name, address, note, mapUrl };
}

export default function Venue({ data }) {
  const { name, address, note, mapUrl } = resolveVenue(data);
  const [headerRef, headerVisible] = useScrollReveal();
  const [cardRef, cardVisible] = useScrollReveal();

  if (!name && !address && !mapUrl) return null;

  return (
    <section className="ev-venue" id="venue" data-section="venue">
      <div
        ref={headerRef}
        className={`ev-venue__header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <p className="ev-venue__eyebrow">The Destination</p>
        <h2 className="ev-venue__heading">Where Forever Begins</h2>
        <p className="ev-venue__subtitle">
          Join us as we exchange vows and step into forever, in a place chosen with love.
        </p>
        <span className="ev-venue__divider" aria-hidden="true" />
      </div>

      <div
        ref={cardRef}
        className={`ev-venue__card ev-reveal ${cardVisible ? 'ev-reveal--visible' : ''}`}
        style={{ transitionDelay: cardVisible ? '120ms' : '0ms' }}
      >
        {name && <h3 className="ev-venue__name">{name}</h3>}
        {address && <p className="ev-venue__address">{address}</p>}
        {note && <p className="ev-venue__note">{note}</p>}

        {mapUrl && (
          <div className="ev-venue__map-frame">
            <span className="ev-venue__map-frame-glow" aria-hidden="true" />
            <svg className="ev-venue__pin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 2C7.9 2 4.5 5.4 4.5 9.5c0 5.6 6.3 11.6 7.1 12.3.2.2.6.2.8 0 .8-.7 7.1-6.7 7.1-12.3C19.5 5.4 16.1 2 12 2zm0 10.2a2.7 2.7 0 110-5.4 2.7 2.7 0 010 5.4z"
                fill="currentColor"
              />
            </svg>
            <a
              className="ev-venue__map-btn"
              href={normalizeExternalUrl(mapUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
