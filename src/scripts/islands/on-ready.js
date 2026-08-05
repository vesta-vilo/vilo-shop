/**
 * Run callback when the document is ready.
 * Safe for modules loaded synchronously (before DCL) or lazily (after DCL).
 */
export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}
