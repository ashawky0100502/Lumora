import { useEffect } from 'react';
import { loadThemeFonts, loadFontFamilies } from '../lib/fontLoader';

/**
 * Loads only the Google Fonts a given guest/portal theme needs
 * (theme.displayFont / bodyFont / uiFont), the moment that theme mounts.
 * Works automatically for any future theme added to guestThemes.js.
 */
export function useThemeFonts(theme) {
  useEffect(() => {
    loadThemeFonts(theme);
  }, [theme]);
}

/**
 * Loads a fixed list of font families by name — used for the LUMORA
 * dashboard/login chrome, which isn't theme-driven like guest pages but
 * still shouldn't force guests to download it.
 */
export function useFontFamilies(familyNames) {
  useEffect(() => {
    loadFontFamilies(familyNames);
    // familyNames is a small static array from a constant — safe to depend
    // on its stringified form so callers can inline the array literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(familyNames)]);
}
