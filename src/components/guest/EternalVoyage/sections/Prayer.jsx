import useScrollReveal from './lib/useScrollReveal';
import { firstText } from './lib/builderData';

/**
 * Prayer has no Builder toggle (see EternalVoyage.jsx), so it gates
 * itself on whether there's actually a prayer/blessing to show —
 * rendering nothing rather than a placeholder when there isn't.
 *
 * The real Builder field for this content is `data.quranVerse`
 * (StepNames.jsx: "Quran Verse / Dua"), the same field every other
 * template reads and shows just below its countdown. The old
 * `data.prayer`/`data.blessing` shape checked here has never actually
 * existed on the Builder's data object.
 */
function resolvePrayerText(data) {
  return firstText(
    data?.quranVerse,
    typeof data?.prayer === 'string' ? data.prayer : '',
    data?.prayer?.text,
    data?.prayerText,
    typeof data?.blessing === 'string' ? data.blessing : '',
    data?.blessing?.text
  );
}

function resolveSurahName(data) {
  return firstText(
    data?.quran?.surahName,
    data?.quranSurahName,
    data?.surahName,
    'Quran Verse'
  );
}

function resolveAyahLabel(data) {
  const value = firstText(
    data?.quran?.ayahNumber,
    data?.quran?.verseNumber,
    data?.quran?.ayah,
    data?.ayahNumber,
    data?.verseNumber
  );

  return value ? `Ayah ${value}` : '';
}

export default function Prayer({ data }) {
  const text = resolvePrayerText(data);
  const surahName = resolveSurahName(data);
  const ayahLabel = resolveAyahLabel(data);
  const [ref, visible] = useScrollReveal();

  return (
    <section className="ev-prayer" id="quran-verse" data-section="prayer">
      <div ref={ref} className={`ev-prayer__shell ev-reveal ${visible ? 'ev-reveal--visible' : ''}`}>
        <div className="ev-prayer__ornament ev-prayer__ornament--left" aria-hidden="true" />
        <div className="ev-prayer__ornament ev-prayer__ornament--right" aria-hidden="true" />

        <div className="ev-prayer__mihrab" aria-label="Quran verse">
          <div className="ev-prayer__mihrab-frame">
            <div className="ev-prayer__lantern ev-prayer__lantern--left" aria-hidden="true" />
            <div className="ev-prayer__lantern ev-prayer__lantern--right" aria-hidden="true" />
            <div className="ev-prayer__beam" aria-hidden="true" />
            <div className="ev-prayer__columns" aria-hidden="true">
              <span className="ev-prayer__column" />
              <span className="ev-prayer__column" />
            </div>
            <div className="ev-prayer__pattern" aria-hidden="true" />
            <div className="ev-prayer__glow" aria-hidden="true" />
            <div className="ev-prayer__particle ev-prayer__particle--one" aria-hidden="true" />
            <div className="ev-prayer__particle ev-prayer__particle--two" aria-hidden="true" />
            <div className="ev-prayer__particle ev-prayer__particle--three" aria-hidden="true" />

            <div className="ev-prayer__content">
              {text && <p className="ev-prayer__text">{text}</p>}
              {(text || surahName || ayahLabel) && <div className="ev-prayer__divider" aria-hidden="true" />}
              <div className="ev-prayer__meta">
                {surahName && <span className="ev-prayer__surah">{surahName}</span>}
                {ayahLabel && <span className="ev-prayer__ayah">{ayahLabel}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
