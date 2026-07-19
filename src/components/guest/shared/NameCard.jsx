import CardRoyale from './namecards/CardRoyale';
import CardSilk from './namecards/CardSilk';
import CardVelvet from './namecards/CardVelvet';
import CardWax from './namecards/CardWax';
import CardMidnight from './namecards/CardMidnight';
import CardAmour from './namecards/CardAmour';

/**
 * NameCard — the couple's names, front and center on the invitation.
 * Each template gets its own genuinely different invitation-card design
 * (silhouette, monogram treatment, divider, motif) instead of one generic
 * "name in a rounded box" reused everywhere with just the colors swapped —
 * see namecards/Card*.jsx for each template's own composition.
 */
const CARD_BY_THEME = {
  royale: CardRoyale,
  silk: CardSilk,
  velvet: CardVelvet,
  wax: CardWax,
  midnight: CardMidnight,
  amour: CardAmour,
};

export default function NameCard({ theme, groom, bride, dateStr, kicker }) {
  const Card = CARD_BY_THEME[theme.id] || CardMidnight;
  return <Card theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} />;
}
