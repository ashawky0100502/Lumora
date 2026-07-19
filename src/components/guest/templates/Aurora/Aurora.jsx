import { useEffect, useMemo, useState } from 'react';
import CinematicOpening from './opening/CinematicOpening';
import AuroraMusicPlayer from './components/AuroraMusicPlayer';
import AuroraHero from './sections/Hero';
import AuroraEngagement from './sections/Engagement';
import AuroraHowWeMet from './sections/HowWeMet';
import AuroraLetters from './sections/Letters';
import AuroraQuranVerse from './sections/QuranVerse';
import AuroraTransitionCoupleCard from './sections/TransitionCoupleCard';
import AuroraGallery from './sections/Gallery';
import AuroraStory from './sections/Story';
import AuroraTimeline from './sections/Timeline';
import AuroraVenue from './sections/Venue';
import AuroraCountdown from './sections/Countdown';
import AuroraMenu from './sections/Menu';
import AuroraRSVP from './sections/RSVP';
import AuroraFooter from './sections/Footer';
import { normalizeAuroraPayload } from './lib/auroraPayload';
import { debugAuroraRender } from './debugRender';

export default function Aurora({ data = {}, theme, slug }) {
  const payload = useMemo(() => normalizeAuroraPayload(data), [data]);
  const [showOpening, setShowOpening] = useState(true);
  const [showInvitation, setShowInvitation] = useState(false);
  const [startMusic, setStartMusic] = useState(false);

  const handleEnterInvitation = () => {
    setShowOpening(false);
    setShowInvitation(true);
    setStartMusic(true);
  };

  const outingGalleryData = useMemo(() => {
    if (!payload?.outings?.images?.length) return null;
    return {
      ...payload,
      gallery: {
        title: payload.outings.title || 'Outings & Trips',
        description: payload.outings.description || '',
        images: payload.outings.images || [],
      },
    };
  }, [payload]);

  return (
    <>
      {showOpening ? <CinematicOpening data={payload} onComplete={() => setShowOpening(false)} /> : null}
      <AuroraMusicPlayer data={payload} startPlayback={startMusic} />
      {!showOpening && !showInvitation ? <AuroraHero data={payload} onViewInvitation={handleEnterInvitation} /> : null}
      {showInvitation ? (
        <div id="details">
          {(() => {
            debugAuroraRender('Aurora root', { showInvitation, payload });
            return null;
          })()}
          <AuroraTransitionCoupleCard data={payload} />
          <AuroraQuranVerse data={payload} />
          <AuroraEngagement data={payload} />
          <AuroraHowWeMet data={payload} />
          <AuroraLetters data={payload} />
          <AuroraStory data={payload} />
          <AuroraGallery data={payload} />
          <AuroraTimeline data={payload} />
          <AuroraVenue data={payload} />
          <AuroraCountdown data={payload} />
          <AuroraMenu data={payload} />
          {outingGalleryData ? <AuroraGallery data={outingGalleryData} /> : null}
          <AuroraRSVP data={payload} slug={slug || data?.slug || data?.id} />
          <AuroraFooter data={payload} />
        </div>
      ) : null}
    </>
  );
}
