const SCRIPT_SELECTOR = 'script[type="application/json"][data-product-variant-media]';

/**
 * Reads the per-page variant → gallery image map from a JSON script near
 * the end of <body>:
 *   <script type="application/json" data-product-variant-media>...</script>
 *
 * Keys must match the color/style radio `value` attributes on the product form.
 * Keep this script at the end of the page so it does not sit in the media markup.
 */
export function getVariantMediaMap() {
  const el = document.querySelector(SCRIPT_SELECTOR);
  if (!el) return {};

  try {
    const data = JSON.parse(el.textContent);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    console.error('Invalid product variant media JSON:', error);
    return {};
  }
}

export const preloadAllVariants = () => {
  const task = () => {
    const map = getVariantMediaMap();
    Object.values(map).forEach((urls) => {
      if (!Array.isArray(urls)) return;
      urls.forEach((url) => {
        if (!url) return;
        const img = new Image();
        img.src = url;
      });
    });
  };

  if ('requestIdleCallback' in globalThis) {
    requestIdleCallback(task);
  } else {
    globalThis.addEventListener('load', () => {
      setTimeout(task, 2000);
    });
  }
};
