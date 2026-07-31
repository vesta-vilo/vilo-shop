const SCRIPT_SELECTOR = 'script[type="application/json"][data-product-variant-media]';

export function parseVariantEntry(entry) {
  if (Array.isArray(entry)) {
    return {
      images: entry,
      video: entry[0] ? { src: entry[0] } : null,
    };
  }

  if (!entry || typeof entry !== 'object') {
    return { images: [], video: null };
  }

  const images = Array.isArray(entry.images) ? entry.images : [];
  let video = entry.video ?? null;

  if (typeof video === 'string') {
    video = { src: video };
  } else if (!video && images[0]) {
    video = { src: images[0] };
  }

  return { images, video };
}

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

export function getVariantMedia(variantName) {
  const entry = getVariantMediaMap()[variantName];
  return entry ? parseVariantEntry(entry) : null;
}

export const preloadAllVariants = () => {
  const task = () => {
    const map = getVariantMediaMap();
    Object.values(map).forEach((entry) => {
      const { images, video } = parseVariantEntry(entry);
      const urls = new Set([...images, video?.src].filter(Boolean));

      urls.forEach((url) => {
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
