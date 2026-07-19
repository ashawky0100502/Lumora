import { GuestCard, SectionHeading } from './GuestUI';
import Reveal from './Reveal';

export default function LettersBlock({ theme, letterGroom, letterBride, groom, bride, t }) {
  if (!letterGroom && !letterBride) return null;
  const letters = [
    letterGroom && { from: groom, text: letterGroom },
    letterBride && { from: bride, text: letterBride },
  ].filter(Boolean);

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
      <div className="flex flex-col gap-5">
        {letters.map((l, i) => (
          <GuestCard key={i} theme={theme}>
            <div
              className="mb-3 text-[0.68rem] uppercase"
              style={{ color: theme.accent, letterSpacing: '0.24em', fontFamily: theme.uiFont }}
            >
              {l.from}
            </div>
            <p className="whitespace-pre-line text-[1.02rem] italic leading-[1.9]" style={{ color: theme.ink, fontFamily: theme.bodyFont }}>
              {l.text}
            </p>
          </GuestCard>
        ))}
      </div>
    </Reveal>
  );
}
