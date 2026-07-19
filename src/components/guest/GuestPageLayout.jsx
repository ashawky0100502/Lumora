import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Gate from './shared/Gate';
import Hero from './shared/Hero';
import MusicPlayer from './shared/MusicPlayer';
import LettersBlock from './shared/LettersBlock';
import EngagementBlock from './shared/EngagementBlock';
import GalleryBlock from './shared/GalleryBlock';
import TimelineBlock from './shared/TimelineBlock';
import MenuBlock from './shared/MenuBlock';
import LocationBlock from './shared/LocationBlock';
import ChatBlock from './shared/ChatBlock';
import CommentsBlock from './shared/CommentsBlock';
import RSVPBlock from './shared/RSVPBlock';
import { guestCopy } from '../../lib/guestCopy';
import { resolveCoverPhoto } from '../../lib/coverDefaults';
import { useThemeFonts } from '../../hooks/useThemeFonts';
import { SharedStorySection, SharedHowWeMetSection, SharedLifeStorySection } from './shared/StorySections';

export default function GuestPageLayout({ theme, data, slug }) {
  // Loads only this theme's 3 font families (display/body/ui) — a guest
  // never downloads the other themes' typefaces. Any new theme added to
  // guestThemes.js is picked up automatically, no changes needed here.
  useThemeFonts(theme);

  const [gateOpen, setGateOpen] = useState(false);
  const musicRef = useRef(null);
  const t = guestCopy(data.language);
  const dir = data.language === 'ar' ? 'rtl' : 'ltr';

  const dateStr = data.date
    ? new Date(`${data.date}T${data.time || '00:00'}`).toLocaleDateString(data.language === 'ar' ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const sections = data.sections || {};
  const weddingPhotos = [data.photoGroom, data.photoBride].filter(Boolean);
  const coupleNames = data.language === 'ar' ? `${data.groom} و${data.bride}` : `${data.groom} & ${data.bride}`;
  const coverPhoto = resolveCoverPhoto(data);

  return (
    <div dir={dir} className="relative h-screen w-full overflow-y-auto overflow-x-hidden" style={{ background: theme.bg }}>
      <AnimatePresence>
        {!gateOpen && (
          <Gate
            theme={theme}
            variant={theme.gate}
            groom={data.groom}
            bride={data.bride}
            dateStr={dateStr}
            kicker={data.language === 'ar' ? 'دعوة زفاف' : 'Wedding Invitation'}
            sub={t.gateInvite}
            openLabel={t.gateOpen}
            scratchHint={t.gateScratch}
            scratchSkip={t.gateScratchSkip}
            coverPhoto={coverPhoto}
            onOpen={() => setGateOpen(true)}
            onOpenClick={() => musicRef.current?.play()}
          />
        )}
      </AnimatePresence>

      {sections.music !== false && (
        <MusicPlayer
          ref={musicRef}
          theme={theme}
          audioUrl={data.audioUrl}
          audioFull={data.audioFull}
          trimStart={data.trimStart}
          trimEnd={data.trimEnd}
          active={gateOpen}
        />
      )}

      {gateOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Hero
            theme={theme}
            groom={data.groom}
            bride={data.bride}
            dateStr={dateStr}
            date={data.date}
            time={data.time}
            countdownLabels={t.countdown}
            invitationMessage={data.invitationMessage}
            quranVerse={data.quranVerse}
            coverPhoto={coverPhoto}
            kicker={data.language === 'ar' ? 'دعوة زفاف' : 'Wedding Invitation'}
          />

          <div className="flex flex-col gap-24 pb-28">
            {(data.letterGroom || data.letterBride) && sections.letters !== false && (
              <LettersBlock theme={theme} letterGroom={data.letterGroom} letterBride={data.letterBride} groom={data.groom} bride={data.bride} t={t.letters} />
            )}

            <SharedStorySection theme={theme} story={data.story} title="Our Story" subtitle="Our Story" />
            <SharedHowWeMetSection theme={theme} content={data.howWeMet} title="How We Met" />
            <SharedLifeStorySection theme={theme} content={data.lifeStory} title="Life Story" />

            {sections.engagement !== false && (
              <EngagementBlock
                theme={theme}
                groom={data.groom}
                bride={data.bride}
                engagementDate={data.engagementDate}
                engagementStory={data.engagementStory}
                engagementPhotos={data.engagementPhotos}
                engagementDecor={data.engagementDecor}
                lang={data.language}
                t={t.engagement}
              />
            )}

            {sections.gallery !== false && weddingPhotos.length > 0 && <GalleryBlock theme={theme} photos={weddingPhotos} t={t.gallery} />}

            {sections.outings !== false && (data.outingPhotos || []).length > 0 && (
              <GalleryBlock theme={theme} photos={data.outingPhotos} t={t.outings} />
            )}

            {sections.timeline && data.timeline?.length > 0 && <TimelineBlock theme={theme} items={data.timeline} t={t.timeline} />}

            {sections.menu !== false && data.menu?.length > 0 && <MenuBlock theme={theme} menu={data.menu} t={t.menu} />}

            {sections.location !== false && (data.venueName || data.mapsLink) && (
              <LocationBlock
                theme={theme}
                venueName={data.venueName}
                locationDescription={data.locationDescription}
                parkingInfo={data.parkingInfo}
                mapsLink={data.mapsLink}
                t={t.location}
              />
            )}

            {sections.messages !== false && <ChatBlock theme={theme} slug={slug} lang={data.language} t={t.chat} coupleNames={coupleNames} />}

            {sections.comments !== false && <CommentsBlock theme={theme} slug={slug} lang={data.language} t={t.comments} coupleNames={coupleNames} />}

            {sections.rsvp !== false && <RSVPBlock theme={theme} slug={slug} t={t.rsvp} />}
          </div>

          <div className="pb-10 text-center text-[0.68rem] uppercase" style={{ color: theme.inkSoft, letterSpacing: '0.3em', fontFamily: theme.uiFont }}>
            {coupleNames}
          </div>
        </motion.div>
      )}
    </div>
  );
}
