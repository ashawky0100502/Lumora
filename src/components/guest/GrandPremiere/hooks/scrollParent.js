/** Nearest ancestor that actually scrolls (`.gp-root` in this template). */
export function findScrollParent(node) {
  let el = node?.parentElement || null;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
