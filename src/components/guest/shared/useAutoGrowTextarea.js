import { useCallback } from 'react';

function parseCssLength(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'auto' || trimmed === 'none') return null;
  if (trimmed.endsWith('px')) return parseFloat(trimmed);
  if (trimmed.endsWith('vh')) return (parseFloat(trimmed) / 100) * window.innerHeight;
  if (trimmed.endsWith('rem')) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    return parseFloat(trimmed) * rootFontSize;
  }
  return null;
}

export default function useAutoGrowTextarea() {
  return useCallback((element) => {
    if (!element) return;

    const computed = window.getComputedStyle(element);
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
    const baseHeight = paddingTop + paddingBottom + borderTop + borderBottom;

    element.style.height = 'auto';
    const scrollHeight = element.scrollHeight;
    const maxHeight = parseCssLength(computed.maxHeight);
    const nextHeight = maxHeight && scrollHeight > maxHeight ? maxHeight : scrollHeight;

    element.style.height = `${Math.max(nextHeight, baseHeight + 2)}px`;
    element.style.overflowY = maxHeight && scrollHeight > maxHeight ? 'auto' : 'hidden';

    if (element.scrollTop !== element.scrollHeight) {
      element.scrollTop = element.scrollHeight;
    }
  }, []);
}
