import { motion } from 'framer-motion';
import CountdownBlock from './CountdownBlock';
import FloralFrame from './FloralFrame';
import NameCard from './NameCard';

export default function Hero({ theme, groom, bride, dateStr, date, time, countdownLabels, invitationMessage, quranVerse, coverPhoto, kicker }) {
  return (
    <div className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {coverPhoto && (
        <>
          {/* Same photo as the opening gate, carried through softly so the
              hero doesn't go flat the moment the invitation opens. */}
          <motion.div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverPhoto})` }}
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: theme.ease }}
          />
          <div className="absolute inset-0 z-0" style={{ background: theme.bg, opacity: 0.86 }} />
        </>
      )}
      <div className="relative z-10 flex flex-col items-center">
      <NameCard theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} />

      {invitationMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 7, ease: theme.ease }}
          className="w-full"
        >
          <FloralFrame theme={theme}>{invitationMessage}</FloralFrame>
        </motion.div>
      )}

      {date && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 8, ease: theme.ease }}
          className="mt-9"
        >
          <CountdownBlock theme={theme} date={date} time={time} labels={countdownLabels} />
        </motion.div>
      )}

      {quranVerse && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 9, ease: theme.ease }}
          className="relative mx-auto mt-14 max-w-2xl rounded-[1.75rem] px-8 py-10 sm:px-14 sm:py-12"
          style={{
            border: `1px solid rgba(${theme.accentRgb},0.4)`,
            background: `linear-gradient(180deg, rgba(${theme.accentRgb},0.07), rgba(${theme.accentRgb},0.02))`,
            boxShadow: `0 30px 70px -40px rgba(${theme.accentRgb},0.5)`,
          }}
        >
          {/* inner hairline */}
          <div
            className="pointer-events-none absolute inset-[9px] rounded-[1.4rem] border"
            style={{ borderColor: `rgba(${theme.accentRgb},0.22)` }}
          />
          {/* corner flourishes */}
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <span
              key={corner}
              className="pointer-events-none absolute h-6 w-6 sm:h-8 sm:w-8"
              style={{
                top: corner.startsWith('t') ? -1 : 'auto',
                bottom: corner.startsWith('b') ? -1 : 'auto',
                left: corner.endsWith('l') ? -1 : 'auto',
                right: corner.endsWith('r') ? -1 : 'auto',
                borderTop: corner.startsWith('t') ? `2px solid ${theme.accent}` : 'none',
                borderBottom: corner.startsWith('b') ? `2px solid ${theme.accent}` : 'none',
                borderLeft: corner.endsWith('l') ? `2px solid ${theme.accent}` : 'none',
                borderRight: corner.endsWith('r') ? `2px solid ${theme.accent}` : 'none',
                borderTopLeftRadius: corner === 'tl' ? '0.9rem' : 0,
                borderTopRightRadius: corner === 'tr' ? '0.9rem' : 0,
                borderBottomLeftRadius: corner === 'bl' ? '0.9rem' : 0,
                borderBottomRightRadius: corner === 'br' ? '0.9rem' : 0,
              }}
            />
          ))}

          <div className="relative mb-5 text-[1.15rem] sm:text-[1.3rem]" style={{ color: theme.accent, fontFamily: theme.displayFont }}>
            ﷽
          </div>
          <p
            className="relative whitespace-pre-line text-[1.2rem] italic leading-[2.1] sm:text-[1.4rem]"
            style={{ color: theme.ink, fontFamily: theme.bodyFont }}
          >
            {quranVerse}
          </p>
          <div
            className="relative mx-auto mt-6 h-px w-16"
            style={{ background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb},0.7), transparent)` }}
          />
        </motion.div>
      )}
      </div>
    </div>
  );
}
