import useScrollReveal from './lib/useScrollReveal';
import { firstText, resolveName } from './lib/builderData';

/**
 * Footer has no Builder toggle (see EternalVoyage.jsx), so like Prayer
 * it gates on whether a closing message actually exists rather than
 * showing generic sign-off copy.
 */
function resolveClosingMessage(data) {
  return firstText(
    typeof data?.closingMessage === 'string' ? data.closingMessage : '',
    data?.closingMessage?.text,
    data?.footerMessage,
    typeof data?.closing === 'string' ? data.closing : '',
    data?.thankYouMessage
  );
}

export default function Footer({ data }) {
  const message = resolveClosingMessage(data);
  const groom = resolveName(data?.groom);
  const bride = resolveName(data?.bride);
  const [ref, visible] = useScrollReveal();

  if (!message) return null;

  return (
    <footer className="ev-footer" id="footer" data-section="footer">
      <div
        ref={ref}
        className={`ev-footer__content ev-reveal ${visible ? 'ev-reveal--visible' : ''}`}
      >
        <span className="ev-footer__ornament" aria-hidden="true">✦</span>
        <p className="ev-footer__message">{message}</p>
        {(groom || bride) && (
          <p className="ev-footer__signature">{[groom, bride].filter(Boolean).join(' & ')}</p>
        )}
      </div>
    </footer>
  );
}
