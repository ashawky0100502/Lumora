import { getNavigationUrl } from '../../../../../lib/mapService.js';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return value;
  }
  return undefined;
}

function resolveName(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') {
    return [value?.firstName, value?.lastName, value?.name, value?.fullName].filter(Boolean).join(' ').trim();
  }
  return '';
}

function resolveImages(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item, index) => {
      const src = typeof item === 'string' ? item : item?.image || item?.src || item?.url || item?.photo || item?.file?.url || '';
      if (!src) return null;
      return {
        src,
        alt: typeof item === 'string' ? `Aurora image ${index + 1}` : item?.alt || item?.title || `Aurora image ${index + 1}`,
      };
    })
    .filter(Boolean);
}

function resolveMenuItems(values) {
  if (!Array.isArray(values)) return [];
  return values.map((item, index) => ({
    title: firstText(item?.name, item?.title, item?.category, `Course ${index + 1}`),
    description: firstText(item?.description, item?.details, item?.notes),
    icon: firstText(item?.icon, '✦'),
  }));
}

function resolveTimeline(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => ({
      title: firstText(item?.title, item?.name),
      time: firstText(item?.time, item?.when),
      description: firstText(item?.description, item?.details, item?.notes),
      icon: firstText(item?.icon),
    }))
    .filter((evt) => evt.title || evt.time || evt.description);
}

export function normalizeAuroraPayload(raw = {}) {
  const builder = raw?.builder || raw || {};
  const sections = raw?.sections || builder?.sections || {};
  const gallerySources = resolveImages(firstValue(raw?.gallery?.images, builder?.gallery?.images, raw?.galleryImages, builder?.galleryImages) || []);
  const engagementPhotos = resolveImages(
    firstValue(
      raw?.engagement?.photos,
      builder?.engagement?.photos,
      raw?.engagementPhotos,
      builder?.engagementPhotos,
      raw?.engagement?.images,
      builder?.engagement?.images
    )
  );
  const outingImages = resolveImages(
    firstValue(
      raw?.outings?.images,
      builder?.outings?.images,
      raw?.outingPhotos,
      builder?.outingPhotos,
      raw?.outings,
      builder?.outings
    )
  );
  const allGalleryImages = gallerySources;

  const heroSubtitle = firstText(raw?.hero?.subtitle, builder?.hero?.subtitle, raw?.heroSubtitle, raw?.subtitle, raw?.openingText, raw?.invitationMessage, builder?.heroSubtitle, builder?.subtitle, builder?.openingText, builder?.invitationMessage);

  const footerMessage = firstText(raw?.footer?.message, builder?.footer?.message, raw?.closingMessage, raw?.footerMessage, raw?.thankYouMessage, raw?.invitationMessage, builder?.closingMessage, builder?.footerMessage, builder?.thankYouMessage, builder?.invitationMessage);

  const quranVerse = firstText(
    raw?.quran?.verse,
    builder?.quran?.verse,
    raw?.quranVerse,
    builder?.quranVerse,
    raw?.verse,
    builder?.verse
  );
  const quranVerseArabic = firstText(
    raw?.quran?.verseArabic,
    builder?.quran?.verseArabic,
    raw?.verseArabic,
    builder?.verseArabic,
    quranVerse
  );
  const quranVerseTranslation = firstText(
    raw?.quran?.verseTranslation,
    builder?.quran?.verseTranslation,
    raw?.verseTranslation,
    builder?.verseTranslation,
    raw?.translation,
    builder?.translation
  );
  const quranSurahName = firstText(
    raw?.quran?.surahName,
    builder?.quran?.surahName,
    raw?.surahName,
    builder?.surahName,
    raw?.reference,
    builder?.reference
  );

  const letterGroom = firstText(
    raw?.letterGroom,
    builder?.letterGroom,
    raw?.letters?.groom,
    builder?.letters?.groom,
    raw?.groomLetter,
    builder?.groomLetter
  );
  const letterBride = firstText(
    raw?.letterBride,
    builder?.letterBride,
    raw?.letters?.bride,
    builder?.letters?.bride,
    raw?.brideLetter,
    builder?.brideLetter
  );
  const storyParagraphs = Array.isArray(firstValue(raw?.story?.paragraphs, raw?.storyParagraphs, raw?.paragraphs, builder?.story?.paragraphs, builder?.storyParagraphs))
    ? firstValue(raw?.story?.paragraphs, raw?.storyParagraphs, raw?.paragraphs, builder?.story?.paragraphs, builder?.storyParagraphs).map((item) => (typeof item === 'string' ? item : firstText(item?.text, item?.paragraph, item?.description))).filter(Boolean)
    : [firstText(raw?.story, builder?.story, raw?.howWeMet, builder?.howWeMet)].filter(Boolean);
  const storyLetterParagraphs = [letterGroom, letterBride].filter(Boolean);
  const howWeMetText = firstText(raw?.howWeMet, builder?.howWeMet, raw?.story?.howWeMet, builder?.story?.howWeMet, raw?.story?.content, builder?.story?.content, raw?.story?.description, builder?.story?.description);

  return {
    names: {
      groom: resolveName(firstValue(raw?.groom, builder?.groom, raw?.couple?.groom, builder?.couple?.groom)),
      bride: resolveName(firstValue(raw?.bride, builder?.bride, raw?.couple?.bride, builder?.couple?.bride)),
      coupleName: firstText(
        raw?.coupleName,
        raw?.couple?.name,
        builder?.coupleName,
        [resolveName(firstValue(raw?.groom, builder?.groom, raw?.couple?.groom, builder?.couple?.groom)), resolveName(firstValue(raw?.bride, builder?.bride, raw?.couple?.bride, builder?.couple?.bride))].filter(Boolean).join(' & ')
      ) || [resolveName(firstValue(raw?.groom, builder?.groom, raw?.couple?.groom, builder?.couple?.groom)), resolveName(firstValue(raw?.bride, builder?.bride, raw?.couple?.bride, builder?.couple?.bride))].filter(Boolean).join(' & '),
    },
    hero: {
      subtitle: heroSubtitle || 'A private celebration of light, stillness & devotion',
      date: firstText(raw?.weddingDate, raw?.date, raw?.eventDate, builder?.weddingDate, builder?.date, builder?.eventDate),
      image: firstText(raw?.heroImage, raw?.coverPhoto, raw?.backgroundImage, raw?.image, builder?.heroImage, builder?.coverPhoto),
      video: firstText(raw?.heroVideo, raw?.videoUrl, raw?.hero?.video, raw?.video, builder?.heroVideo),
      ctaText: firstText(raw?.heroCtaText, raw?.ctaText, raw?.buttonText, raw?.heroButtonText, builder?.heroCtaText, builder?.ctaText) || 'View invitation',
    },
    story: {
      intro: firstText(raw?.storyIntro, raw?.intro, raw?.howWeMet, builder?.storyIntro, builder?.intro, builder?.howWeMet),
      quote: firstText(raw?.storyQuote, raw?.quote, raw?.story?.quote, builder?.storyQuote, builder?.quote, builder?.story?.quote),
      title: firstText(raw?.storyTitle, raw?.story?.title, builder?.storyTitle, builder?.story?.title),
      paragraphs: [...storyParagraphs, ...storyLetterParagraphs].filter(Boolean),
      image: firstText(raw?.storyImage, raw?.story?.image, raw?.image, raw?.coverPhoto, builder?.storyImage),
    },
    howWeMet: {
      title: firstText(raw?.howWeMetTitle, builder?.howWeMetTitle, 'How We Met'),
      content: howWeMetText,
    },
    gallery: {
      title: firstText(raw?.galleryTitle, builder?.galleryTitle, raw?.title, builder?.title),
      description: firstText(raw?.galleryDescription, builder?.galleryDescription, raw?.description, builder?.description),
      images: allGalleryImages,
    },
    engagement: {
      enabled: sections?.engagement !== false,
      title: firstText(raw?.engagementTitle, builder?.engagementTitle, raw?.engagement?.title, builder?.engagement?.title) || '',
      description: firstText(raw?.engagementDescription, builder?.engagementDescription, raw?.engagement?.description, builder?.engagement?.description) || '',
      date: firstText(raw?.engagementDate, builder?.engagementDate, raw?.engagement?.date, builder?.engagement?.date) || '',
      location: firstText(raw?.engagementLocation, builder?.engagementLocation, raw?.engagement?.location, builder?.engagement?.location) || '',
      timeline: Array.isArray(raw?.engagementTimeline || builder?.engagementTimeline || raw?.engagement?.timeline || builder?.engagement?.timeline)
        ? (raw?.engagementTimeline || builder?.engagementTimeline || raw?.engagement?.timeline || builder?.engagement?.timeline).map((item) => ({
            label: firstText(item?.label, item?.title, item?.name),
            value: firstText(item?.value, item?.time, item?.description),
          })).filter((item) => item.label || item.value)
        : [],
      images: engagementPhotos,
      story: firstText(raw?.engagementStory, builder?.engagementStory, raw?.engagement?.story, builder?.engagement?.story) || '',
    },
    timeline: {
      title: firstText(raw?.timeline?.title, raw?.timelineTitle, builder?.timeline?.title, builder?.timelineTitle),
      description: firstText(raw?.timeline?.description, raw?.timelineDescription, builder?.timeline?.description, builder?.timelineDescription),
      events: resolveTimeline(firstValue(raw?.timeline?.events, raw?.timeline, builder?.timeline?.events, builder?.timeline) || []),
    },
    outings: {
      enabled: sections?.outings !== false,
      title: firstText(raw?.outingsTitle, builder?.outingsTitle, raw?.outings?.title, builder?.outings?.title) || 'Outings & Trips',
      description: firstText(raw?.outingsDescription, builder?.outingsDescription, raw?.outings?.description, builder?.outings?.description) || '',
      images: outingImages,
    },
    letters: {
      enabled: sections?.letters !== false,
      groom: letterGroom,
      bride: letterBride,
    },
    comments: {
      enabled: sections?.comments !== false,
      title: firstText(raw?.comments?.title, raw?.commentsTitle, builder?.comments?.title, builder?.commentsTitle, raw?.guestbookTitle, builder?.guestbookTitle) || '',
      description: firstText(raw?.comments?.description, raw?.commentsDescription, builder?.comments?.description, builder?.commentsDescription, raw?.guestbookDescription, builder?.guestbookDescription) || '',
    },
    messages: {
      enabled: sections?.messages !== false,
      title: firstText(raw?.messages?.title, raw?.messagesTitle, builder?.messages?.title, builder?.messagesTitle) || '',
      description: firstText(raw?.messages?.description, raw?.messagesDescription, builder?.messages?.description, builder?.messagesDescription) || '',
    },
    venue: {
      name: firstText(raw?.venueName, builder?.venueName, raw?.venue?.name, builder?.venue?.name) || '',
      address: firstText(raw?.venueAddress, builder?.venueAddress, raw?.locationDescription, builder?.locationDescription, raw?.venue?.address, builder?.venue?.address) || '',
      ceremonyTime: firstText(raw?.ceremonyTime, raw?.venue?.ceremonyTime, builder?.venue?.ceremonyTime, builder?.venue?.ceremony) || '',
      receptionTime: firstText(raw?.receptionTime, raw?.venue?.receptionTime, builder?.venue?.receptionTime, builder?.venue?.reception) || '',
      image: firstText(raw?.venueImage, raw?.venue?.image, raw?.venue?.coverImage, builder?.venue?.image, builder?.venue?.coverImage) || '',
      mapUrl: getNavigationUrl({
        venueName: firstText(raw?.venueName, builder?.venueName, raw?.venue?.name, builder?.venue?.name),
        venueAddress: firstText(raw?.venueAddress, builder?.venueAddress, raw?.locationDescription, builder?.locationDescription, raw?.venue?.address, builder?.venue?.address),
        latitude: firstValue(raw?.latitude, builder?.latitude, raw?.mapsLat, builder?.mapsLat, raw?.venue?.latitude, builder?.venue?.latitude, raw?.venue?.lat, builder?.venue?.lat),
        longitude: firstValue(raw?.longitude, builder?.longitude, raw?.mapsLng, builder?.mapsLng, raw?.venue?.longitude, builder?.venue?.longitude, raw?.venue?.lng, builder?.venue?.lng),
        mapsLink: firstText(raw?.mapsLink, builder?.mapsLink, raw?.venue?.mapUrl, builder?.venue?.mapUrl, raw?.venue?.googleMapsUrl, builder?.venue?.googleMapsUrl),
      }) || '',
      mapLat: firstValue(raw?.latitude, builder?.latitude, raw?.mapsLat, builder?.mapsLat, raw?.venue?.latitude, builder?.venue?.latitude, raw?.venue?.lat, builder?.venue?.lat),
      mapLng: firstValue(raw?.longitude, builder?.longitude, raw?.mapsLng, builder?.mapsLng, raw?.venue?.longitude, builder?.venue?.longitude, raw?.venue?.lng, builder?.venue?.lng),
      parkingInfo: firstText(raw?.parkingInfo, builder?.parkingInfo, raw?.venue?.parkingInfo, builder?.venue?.parking) || '',
    },
    menu: {
      title: firstText(raw?.menuTitle, builder?.menuTitle, raw?.menu?.title, builder?.menu?.title) || 'Culinary Experience',
      description: firstText(raw?.menuDescription, builder?.menuDescription, raw?.menu?.description, builder?.menu?.description) || 'An intimate private dining journey of candlelit service, elegant pacing, and timeless indulgence.',
      items: resolveMenuItems(firstValue(raw?.menu, builder?.menu?.items, raw?.menu?.items)),
    },
    quran: {
      enabled: sections?.quran !== false,
      verseArabic: quranVerseArabic,
      verseTranslation: quranVerseTranslation,
      surahName: quranSurahName,
      audioUrl: firstText(raw?.quranAudioUrl, builder?.quranAudioUrl, raw?.audioUrl, builder?.audioUrl),
      reciterName: firstText(raw?.reciterName, builder?.reciterName),
    },
    footer: {
      message: footerMessage || 'Thank You For Being Part Of Our Story',
    },
    invitation: {
      message: firstText(raw?.invitationMessage, builder?.invitationMessage) || '',
    },
    sections: {
      location: sections?.location !== false,
      gallery: sections?.gallery !== false,
      engagement: sections?.engagement !== false,
      outings: sections?.outings !== false,
      letters: sections?.letters !== false,
      music: sections?.music !== false,
      menu: sections?.menu !== false,
      messages: sections?.messages !== false,
      comments: sections?.comments !== false,
      rsvp: sections?.rsvp !== false,
      timeline: sections?.timeline !== false,
    },
    music: {
      audioUrl: firstText(raw?.audioUrl, builder?.audioUrl, raw?.music?.audioUrl, builder?.music?.audioUrl),
      title: firstText(raw?.audioName, builder?.audioName, raw?.music?.title, builder?.music?.title),
      autoplay: firstValue(raw?.autoplay, builder?.autoplay, raw?.music?.autoplay, builder?.music?.autoplay) ?? true,
      loop: firstValue(raw?.loop, builder?.loop, raw?.music?.loop, builder?.music?.loop) ?? true,
      volume: firstValue(raw?.volume, builder?.volume, raw?.music?.volume, builder?.music?.volume) ?? 0.7,
      trimStart: firstValue(raw?.trimStart, builder?.trimStart) ?? 0,
      trimEnd: firstValue(raw?.trimEnd, builder?.trimEnd) ?? 100,
      audioFull: firstValue(raw?.audioFull, builder?.audioFull) ?? true,
    },
    countdown: {
      targetDate: firstText(raw?.date, builder?.date, raw?.weddingDate, builder?.weddingDate, raw?.eventDate, builder?.eventDate) || '',
      targetTime: firstText(raw?.time, builder?.time, raw?.weddingTime, builder?.weddingTime) || '',
    },
    rsvp: {
      enabled: sections?.rsvp !== false,
      title: firstText(raw?.rsvp?.title, raw?.rsvpTitle, builder?.rsvp?.title, builder?.rsvpTitle, raw?.title, builder?.title) || 'We Would Be Honored',
      subtitle: firstText(raw?.rsvp?.subtitle, raw?.rsvpSubtitle, builder?.rsvp?.subtitle, builder?.rsvpSubtitle, raw?.subtitle, builder?.subtitle) || 'Your response will complete the invitation and remain treasured with the evening.',
    },
  };
}
