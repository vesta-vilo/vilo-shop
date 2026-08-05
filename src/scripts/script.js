const excludedSelectors = [
  '.swiper-slide',
  '.email-subscribe-dialog-holder',
  'card-modal img',
  '.skip-img-fadein',
  '.tech-specifications-details-icon',
];
const getExcludedSelector = (baseTag, exclusions) =>
  `${baseTag}${exclusions.filter((i) => i.trim()).map((i) => `:not(${i})`).join('')}`;

// Add a generic image loading effect
// Fade-in images when they enter the viewport
document.addEventListener("DOMContentLoaded", function () {
  const SELECTOR = getExcludedSelector('img', excludedSelectors);
  const BASE_OPACITY = 0;
  const IN_OPACITY = 1;

  // Timing config
  const DELAY_MS = 100;     // latency before fade-in starts
  const DURATION_MS = 1050;  // fade duration
  const EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)"; // "curved" feel (easeOut-ish)

  // Whether to hide again when leaving viewport
  const HIDE_ON_EXIT = true;

  // Ensure a style tag exists for the transition
  const style = document.createElement("style");
  style.textContent = `
    ${SELECTOR}[data-fadein]{
      opacity: ${BASE_OPACITY};
      transition: opacity ${DURATION_MS}ms ${EASING};
      will-change: opacity;
    }
    ${SELECTOR}[data-fadein].is-visible{
      opacity: ${IN_OPACITY};
    }
    @media (prefers-reduced-motion: reduce){
      ${SELECTOR}[data-fadein]{
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  const mark = (img) => {
    if (img.closest('.swiper-slide')) return;
    if (img.closest('.polaroid-gallery')) return;
    if (img.dataset.fadeinInitialized) return;
    img.dataset.fadeinInitialized = "1";
    img.dataset.fadein = "1";
  };

  // IntersectionObserver to toggle visibility
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const img = entry.target;
        if (entry.isIntersecting) {
          // latency before showing
          const t = setTimeout(() => {
            img.classList.add("is-visible");
            img.dataset.fadeinShown = "1";
          }, DELAY_MS);
          img.dataset.fadeinTimer = String(t);
        } else if (HIDE_ON_EXIT) {
          if (img.dataset.fadeinTimer) {
            clearTimeout(Number(img.dataset.fadeinTimer));
            delete img.dataset.fadeinTimer;
          }
          img.classList.remove("is-visible");
        }
      });
    },
    {
      root: null,
      threshold: 0.05,          // consider visible when ~5% enters view
      rootMargin: "0px 0px -5% 0px",
    }
  );

  const observeImage = (img) => {
    if (!img.matches?.(SELECTOR)) return;
    mark(img);
    if (img.dataset.fadein) {
      io.observe(img);
    }
  };

  // Observe newly added images too
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(SELECTOR)) observeImage(node);
        node.querySelectorAll?.(SELECTOR).forEach(observeImage);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Start observing all images
  const observeAll = () => {
    document.querySelectorAll(SELECTOR).forEach(observeImage);
  };
  observeAll();
});

const initStickyState = () => {
  const bar = document.querySelector('announcement-bar');
  if (!bar) {
    document.body.classList.add('header-is-sticky');
  }
};

globalThis.addEventListener('DOMContentLoaded', initStickyState);