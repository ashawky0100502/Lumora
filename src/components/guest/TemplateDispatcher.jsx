import GuestPageLayout from './GuestPageLayout';
import EternalVoyage from './EternalVoyage/EternalVoyage';
import GrandPremiere from './GrandPremiere';
import Aurora from './templates/Aurora';
import { themeFor } from '../../lib/guestThemes';
import { resolveGuestTemplate } from './resolveTemplate';

/**
 * Every existing template (current or future *shared-layout* template) is
 * just a theme + gate variant fed into GuestPageLayout — new templates of
 * that kind plug in by adding an entry to guestThemes.js, nothing here
 * has to change for them.
 *
 * Eternal Voyage and Grand Premiere are different on purpose: each is a
 * fully isolated template with its own top-level component (see
 * EternalVoyage/EternalVoyage.jsx and GrandPremiere/index.jsx), so they're
 * routed here instead of going through GuestPageLayout. They still get
 * the exact same `data`/`slug` every other template gets — nothing is
 * filtered, transformed, or replaced with placeholder data.
 */
export default function TemplateDispatcher({ data, slug }) {
  const template = resolveGuestTemplate(data);
  const theme = themeFor(template === 'shared' ? data?.template : template);

  if (template === 'eternal-voyage') {
    return <EternalVoyage data={data} theme={theme} slug={slug} />;
  }

  if (template === 'grand-premiere') {
    return <GrandPremiere data={data} theme={theme} slug={slug} />;
  }

  if (template === 'aurora') {
    return <Aurora data={data} theme={theme} slug={slug} />;
  }

  return <GuestPageLayout theme={theme} data={data} slug={slug} />;
}
