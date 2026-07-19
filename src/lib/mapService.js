function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeCoordinate(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getQueryParam(url, name) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(name) || '';
  } catch {
    return '';
  }
}

function extractFromGoogleMapsUrl(rawUrl) {
  const normalizedUrl = normalizeText(rawUrl);
  if (!normalizedUrl) return null;
  // Heuristics: look for coordinates in many Google Maps URL shapes.
  //  - @LAT,LNG  (maps/place, /dir, etc)
  //  - q=LAT,LNG or q=encoded address
  //  - !3dLAT!4dLNG (share URLs)
  //  - pathname segments that contain place names
  const candidates = [];

  // @lat,lng in the path (most reliable)
  const latLngFromAt = normalizedUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (latLngFromAt) candidates.push({ latitude: Number(latLngFromAt[1]), longitude: Number(latLngFromAt[2]) });

  // q=lat,lng or q=address
  const latLngFromQuery = getQueryParam(normalizedUrl, 'q') || getQueryParam(normalizedUrl, 'query');
  if (latLngFromQuery) {
    const queryMatch = latLngFromQuery.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (queryMatch) candidates.push({ latitude: Number(queryMatch[1]), longitude: Number(queryMatch[2]) });
  }

  // Older share format: !3dLAT!4dLNG
  const latLngFromPlace = normalizedUrl.match(/!3d(-?\d+(?:\.\d+))!4d(-?\d+(?:\.\d+))/i);
  if (latLngFromPlace) candidates.push({ latitude: Number(latLngFromPlace[1]), longitude: Number(latLngFromPlace[2]) });

  const addressCandidates = [];

  // If q is present and is not coordinates, treat as address candidate
  const qParam = normalizeText(getQueryParam(normalizedUrl, 'q') || getQueryParam(normalizedUrl, 'query'));
  if (qParam && !/^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(qParam)) addressCandidates.push(qParam);

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname || '';
    const pathname = parsed.pathname || '';

    // If the URL is a short maps link, signal the caller by returning shortUrl flag
    if (/(^|\.)maps\.app\.goo\.gl$/.test(hostname) || /(^|\.)goo\.gl$/.test(hostname) || hostname.endsWith('goo.gl')) {
      return { shortUrl: true, shortUrlHost: hostname, original: normalizedUrl };
    }

    // extract place name from /place/<name>/ or pathname segments for address
    const placeMatch = pathname.match(/\/place\/([^/]+)/i);
    if (placeMatch && placeMatch[1]) addressCandidates.push(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).replace(/\+/g, ' '));

    // fallback: use last pathname segment if it looks like text
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length) {
      const last = parts[parts.length - 1];
      if (/[a-zA-Z\u0600-\u06FF0-9\-\+\s]/.test(last)) addressCandidates.push(decodeURIComponent(last.replace(/\+/g, ' ')));
    }
  } catch {
    // Ignore URL parsing issues.
  }

  const firstCoord = candidates.find((item) => item && Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  if (firstCoord) {
    return {
      latitude: firstCoord.latitude,
      longitude: firstCoord.longitude,
      venueAddress: addressCandidates.find(Boolean) || '',
      googlePlaceId: normalizeText(getQueryParam(normalizedUrl, 'cid') || getQueryParam(normalizedUrl, 'place_id')),
    };
  }

  return {
    latitude: null,
    longitude: null,
    venueAddress: addressCandidates.find(Boolean) || '',
    googlePlaceId: normalizeText(getQueryParam(normalizedUrl, 'cid') || getQueryParam(normalizedUrl, 'place_id')),
  };
}

// Resolve short Google Maps links by following redirects.
export async function resolveShortMapUrl(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    // prefer final URL
    return res.url || url;
  } catch {
    return url;
  }
  }

export function normalizeVenueData(input = {}) {
  const rawUrl = normalizeText(input.mapsLink || input.googleMapsUrl || input.mapUrl || '');
  const parsedFromUrl = rawUrl ? extractFromGoogleMapsUrl(rawUrl) : null;

  const venueName = normalizeText(input.venueName || input.name || input.venue?.name || '');
  const venueAddress = normalizeText(
    input.venueAddress || input.address || input.venue?.address || parsedFromUrl?.venueAddress || ''
  );
  const latitude = normalizeCoordinate(input.latitude ?? input.lat ?? input.venue?.latitude ?? parsedFromUrl?.latitude);
  const longitude = normalizeCoordinate(input.longitude ?? input.lng ?? input.venue?.longitude ?? parsedFromUrl?.longitude);
  const googlePlaceId = normalizeText(input.googlePlaceId || input.placeId || input.venue?.placeId || parsedFromUrl?.googlePlaceId || '');

  return {
    venueName,
    venueAddress,
    latitude,
    longitude,
    googlePlaceId,
  };
}

export function validateVenueData(input = {}) {
  const normalized = normalizeVenueData(input);
  const errors = [];

  if (!normalized.venueName && !normalized.venueAddress && normalized.latitude === null && normalized.longitude === null) {
    errors.push('Venue data is required.');
  }

  if (normalized.latitude !== null && normalized.latitude < -90) {
    errors.push('Latitude must be greater than or equal to -90.');
  }

  if (normalized.latitude !== null && normalized.latitude > 90) {
    errors.push('Latitude must be less than or equal to 90.');
  }

  if (normalized.longitude !== null && normalized.longitude < -180) {
    errors.push('Longitude must be greater than or equal to -180.');
  }

  if (normalized.longitude !== null && normalized.longitude > 180) {
    errors.push('Longitude must be greater than or equal to 180.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: normalized,
  };
}

export function getNavigationUrl(input = {}) {
  return getMapsNavigationUrl(input);
}

export function getMapsNavigationUrl(input = {}) {
  const normalized = normalizeVenueData(input);

  if (normalized.latitude !== null && normalized.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${normalized.latitude},${normalized.longitude}`;
  }

  if (normalized.venueAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalized.venueAddress)}`;
  }

  return '';
}

export function getMapEmbedUrl(input = {}) {
  const normalized = normalizeVenueData(input);

  if (normalized.latitude !== null && normalized.longitude !== null) {
    return `https://www.google.com/maps?q=${normalized.latitude},${normalized.longitude}&output=embed`;
  }

  if (normalized.venueAddress) {
    return `https://www.google.com/maps?q=${encodeURIComponent(normalized.venueAddress)}&output=embed`;
  }

  return '';
}

export default {
  normalizeVenueData,
  validateVenueData,
  getNavigationUrl,
  getMapsNavigationUrl,
  getMapEmbedUrl,
};

export function parseMapsLink(rawUrl) {
  return extractFromGoogleMapsUrl(rawUrl);
}
