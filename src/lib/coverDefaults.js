/**
 * COVER PHOTO DEFAULTS
 * Each template can ship with a default cover photo (shown behind the
 * couple's names on the opening card) so a fresh invitation never looks
 * bare before the couple uploads their own. The couple's own upload
 * (`data.coverPhoto`, set from the Design step) always wins over these.
 *
 * TO ADD A REAL DEFAULT IMAGE FOR A TEMPLATE:
 *   1. Drop the file into src/assets/covers/ (e.g. royale.jpg)
 *   2. Import it below and set it on DEFAULT_COVERS for that template id
 * No other file needs to change — GuestPageLayout/Gate already read
 * through `resolveCoverPhoto()`.
 */

import royaleCover from '../assets/covers/royale.webp';
import silkCover from '../assets/covers/silk.webp';
import velvetCover from '../assets/covers/velvet.webp';
import waxCover from '../assets/covers/wax.webp';
import midnightCover from '../assets/covers/midnight.webp';
import amourCover from '../assets/amour/cover.webp';

export const DEFAULT_COVERS = {
  royale: royaleCover,
  silk: silkCover,
  velvet: velvetCover,
  wax: waxCover,
  midnight: midnightCover,
  amour: amourCover,
};

/** The couple's own upload wins; otherwise fall back to the template's
 * default, then (for invitations published before this was generalized)
 * the old silk-only field. */
export function resolveCoverPhoto(data) {
  return data.coverPhoto || DEFAULT_COVERS[data.template] || data.silkCoverPhoto || null;
}
