import { getNavigationUrl, validateVenueData } from '../../../../lib/mapService.js';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function firstValue(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return value;
  }
  return undefined;
}

export function serializeInvitationPayload(data = {}, slug) {
  const sections = data.sections || {};
  const venueInput = {
    venueName: firstText(data.venueName, data.venue?.name),
    venueAddress: firstText(data.venueAddress, data.locationDescription, data.venue?.address),
    latitude: firstValue(data.latitude, data.mapsLat, data.venue?.latitude, data.venue?.lat),
    longitude: firstValue(data.longitude, data.mapsLng, data.venue?.longitude, data.venue?.lng),
    googlePlaceId: firstText(data.googlePlaceId, data.venue?.placeId),
    mapsLink: firstText(data.mapsLink, data.venue?.mapUrl),
  };
  const venueValidation = validateVenueData(venueInput);
  const normalizedVenue = venueValidation.data;
  const navigationUrl = getNavigationUrl({ ...venueInput, ...normalizedVenue });
  const menuItems = Array.isArray(data.menu)
    ? data.menu
        .filter((item) => item && (item.name || item.title || item.category || item.description))
        .map((item) => ({
          name: firstText(item?.name, item?.title),
          category: firstText(item?.category, item?.type),
          description: firstText(item?.description, item?.details),
        }))
    : [];

  const timelineEvents = Array.isArray(data.timeline)
    ? data.timeline
        .filter((item) => item && (item.title || item.time || item.description))
        .map((item) => ({
          title: firstText(item?.title, item?.name),
          time: firstText(item?.time, item?.when),
          description: firstText(item?.description, item?.details),
        }))
    : [];

  const outingPhotos = Array.isArray(data.outingPhotos)
    ? data.outingPhotos.filter(Boolean)
    : [];

  // Preserve rich `story` objects when the Builder supplied them
  // (many templates expect `data.story` to be an object with `text`/`paragraphs`).
  const storyValue = data?.story;
  const outStory = typeof storyValue === 'object' && storyValue !== null ? storyValue : firstText(data.story, data.howWeMet);

  // Omit the raw `mapsLink` from the published payload.
  const { mapsLink: _mapsLink, ...restData } = data;

  return {
    ...restData,
    slug,
    template: data.template || 'midnight',
    sections: {
      location: sections.location !== false,
      gallery: sections.gallery !== false,
      engagement: sections.engagement !== false,
      outings: sections.outings !== false,
      letters: sections.letters !== false,
      music: sections.music !== false,
      menu: sections.menu !== false,
      messages: sections.messages !== false,
      comments: sections.comments !== false,
      rsvp: sections.rsvp !== false,
      timeline: sections.timeline !== false,
    },
    // Keep the original object shape when present, otherwise a plain string
    story: outStory,
    // Preserve canonical Builder fields so every template can read them
    // directly from the published payload (no template-specific logic).
    invitationMessage: firstText(data.invitationMessage, data.invitation?.message, data.builder?.invitationMessage),
    howWeMet: firstText(data.howWeMet, data.story, data.builder?.howWeMet),
    engagementStory: firstText(data.engagementStory, data.engagement?.story, data.builder?.engagementStory),
    letterGroom: firstText(data.letterGroom),
    letterBride: firstText(data.letterBride),
    gallery: {
      title: firstText(data.galleryTitle, data.gallery?.title),
      description: firstText(data.galleryDescription, data.gallery?.description),
      images: Array.isArray(data.gallery?.images) ? data.gallery.images : [],
    },
    venue: {
      name: normalizedVenue.venueName || firstText(data.venueName, data.venue?.name),
      address: normalizedVenue.venueAddress || firstText(data.locationDescription, data.venue?.address),
      ceremonyTime: firstText(data.ceremonyTime, data.venue?.ceremonyTime),
      receptionTime: firstText(data.receptionTime, data.venue?.receptionTime),
      image: firstText(data.venueImage, data.venue?.image),
      mapUrl: navigationUrl,
      mapLat: normalizedVenue.latitude ?? firstValue(data.mapsLat, data.venue?.lat),
      mapLng: normalizedVenue.longitude ?? firstValue(data.mapsLng, data.venue?.lng),
      parkingInfo: firstText(data.parkingInfo, data.venue?.parkingInfo),
      placeId: normalizedVenue.googlePlaceId || firstText(data.googlePlaceId, data.venue?.placeId),
    },
    // Expose structured venue fields for consumers that expect them directly
    venueName: normalizedVenue.venueName || firstText(data.venueName, data.venue?.name),
    venueAddress: normalizedVenue.venueAddress || firstText(data.locationDescription, data.venue?.address),
    latitude: normalizedVenue.latitude ?? firstValue(data.latitude, data.mapsLat, data.venue?.lat),
    longitude: normalizedVenue.longitude ?? firstValue(data.longitude, data.mapsLng, data.venue?.lng),
    placeId: normalizedVenue.googlePlaceId || firstText(data.googlePlaceId, data.venue?.placeId),
    // timeline: keep the new nested object shape but also expose a
    // plain array on `timeline` (many templates check Array.isArray).
    // We keep both by assigning the array to `timeline` and attaching
    // `events`, `title`, and `description` properties to the array
    // object so callers using either shape continue to work.
    timeline: (() => {
      const title = firstText(data.timelineTitle, data.timeline?.title);
      const description = firstText(data.timelineDescription, data.timeline?.description);
      const arr = Array.isArray(timelineEvents) ? timelineEvents : [];
      try {
        // arrays are objects in JS — attach metadata for consumers
        Object.defineProperty(arr, 'events', {
          value: arr,
          enumerable: false,
        });
        Object.defineProperty(arr, 'title', {
          value: title || '',
          enumerable: false,
        });
        Object.defineProperty(arr, 'description', {
          value: description || '',
          enumerable: false,
        });
      } catch (e) {
        // fall back silently if defineProperty isn't allowed
        arr.events = arr;
        arr.title = title || '';
        arr.description = description || '';
      }
      return arr;
    })(),

    // Preserve the nested object shape as well for consumers that read
    // `timeline.events` explicitly.
    timeline_meta: {
      title: firstText(data.timelineTitle, data.timeline?.title),
      description: firstText(data.timelineDescription, data.timeline?.description),
      events: timelineEvents,
    },
    outings: {
      title: firstText(data.outingsTitle, 'Outings & Trips'),
      description: firstText(data.outingsDescription),
      images: outingPhotos,
    },
    comments: {
      title: firstText(data.commentsTitle),
      description: firstText(data.commentsDescription),
    },
    messages: {
      title: firstText(data.messagesTitle),
      description: firstText(data.messagesDescription),
    },
    quran: {
      enabled: sections.quran !== false,
      verse: firstText(data.quranVerse, data.quran?.verse),
      verseArabic: firstText(data.quranVerseArabic, data.quran?.verseArabic),
      verseTranslation: firstText(data.quranVerseTranslation, data.quran?.verseTranslation),
      surahName: firstText(data.quranSurahName, data.quran?.surahName),
      audioUrl: firstText(data.quranAudioUrl, data.quran?.audioUrl),
      reciterName: firstText(data.reciterName, data.quran?.reciterName),
    },
    menu: menuItems,
    countdown: {
      targetDate: firstText(data.date, data.weddingDate),
      targetTime: firstText(data.time, data.weddingTime),
    },
    // Backwards-compatible top-level key expected by some templates/consumers
    countdownDate: firstText(data.date, data.weddingDate),

    // Keep nested objects for consumers that expect them, while
    // preserving the top-level scalar fields above.
    invitation: {
      message: firstText(data.invitationMessage, data.invitation?.message, data.builder?.invitationMessage),
    },
    engagement: {
      story: firstText(data.engagementStory, data.engagement?.story, data.builder?.engagementStory),
    },
    rsvp: {
      enabled: sections.rsvp !== false,
      title: firstText(data.rsvpTitle, 'We Would Be Honored'),
      subtitle: firstText(data.rsvpSubtitle, 'Your response will complete the invitation and remain treasured with the evening.'),
    },
  };
}
