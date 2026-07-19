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

  const candidates = [];

  const latLngFromAt = normalizedUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (latLngFromAt) {
    candidates.push({ latitude: Number(latLngFromAt[1]), longitude: Number(latLngFromAt[2]) });
  }

  const latLngFromQuery = getQueryParam(normalizedUrl, 'q') || getQueryParam(normalizedUrl, 'query');
  if (latLngFromQuery) {
    const queryMatch = latLngFromQuery.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (queryMatch) {
      candidates.push({ latitude: Number(queryMatch[1]), longitude: Number(queryMatch[2]) });
    }
  }

  const latLngFromPlace = normalizedUrl.match(/!3d(-?\d+(?:\.\d+))!4d(-?\d+(?:\.\d+))/i);
  if (latLngFromPlace) {
    candidates.push({ latitude: Number(latLngFromPlace[1]), longitude: Number(latLngFromPlace[2]) });
  }

  const addressCandidates = [];
  const placeName = normalizeText(getQueryParam(normalizedUrl, 'query') || getQueryParam(normalizedUrl, 'q'));
  if (placeName) addressCandidates.push(placeName);

  try {
    const parsed = new URL(normalizedUrl);
    const pathname = parsed.pathname || '';
    if (pathname && !pathname.startsWith('/maps')) {
      addressCandidates.push(pathname.replace(/^\/+|\/+$/g, ''));
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
  const normalized = normalizeVenueData(input);

  if (normalized.latitude !== null && normalized.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${normalized.latitude},${normalized.longitude}`;
  }

  if (normalized.venueAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalized.venueAddress)}`;
  }

  const fallbackUrl = normalizeText(input.mapsLink || input.googleMapsUrl || input.mapUrl || '');
  return fallbackUrl || '';
}

export function getMapsNavigationUrl(input = {}) {
  const normalized = normalizeVenueData(input);

  if (normalized.latitude !== null && normalized.longitude !== null) {
    return `geo:${normalized.latitude},${normalized.longitude}`;
  }

  if (normalized.venueAddress) {
    const encodedQuery = encodeURIComponent(normalized.venueAddress);
    return `geo:0,0?q=${encodedQuery}`;
  }

  const fallbackUrl = normalizeText(input.mapsLink || input.googleMapsUrl || input.mapUrl || '');
  return normalizeText(fallbackUrl);
}

export function getMapEmbedUrl(input = {}) {
  const normalized = normalizeVenueData(input);

  if (normalized.latitude !== null && normalized.longitude !== null) {
    return `https://www.google.com/maps?q=${normalized.latitude},${normalized.longitude}&output=embed`;
  }

  if (normalized.venueAddress) {
    return `https://www.google.com/maps?q=${encodeURIComponent(normalized.venueAddress)}&output=embed`;
  }

  const fallbackUrl = normalizeText(input.mapsLink || input.googleMapsUrl || input.mapUrl || '');
  if (!fallbackUrl) return '';
  return `https://www.google.com/maps?q=${encodeURIComponent(fallbackUrl)}&output=embed`;
}

export default {
  normalizeVenueData,
  validateVenueData,
  getNavigationUrl,
  getMapsNavigationUrl,
  getMapEmbedUrl,
};
