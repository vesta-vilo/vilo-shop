import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { onReady } from './islands/on-ready.js';

const gallerySwiperInstances = new Map();

function getScopedEls(sliderEl) {
  const sectionEl = sliderEl.closest('.gallery-section') || sliderEl.parentElement;
  if (!sectionEl) return {};

  return {
    nextEl: sectionEl.querySelector('.gallery-swiper-button-next'),
    prevEl: sectionEl.querySelector('.gallery-swiper-button-prev'),
  };
}

function initSwiper() {
  const isMobile = window.innerWidth <= 768;

  const sliderEls = document.querySelectorAll('.gallery-slider');

  sliderEls.forEach((sliderEl) => {
    if (isMobile) {
      if (gallerySwiperInstances.has(sliderEl)) return;

      const { nextEl, prevEl } = getScopedEls(sliderEl);
      if (!nextEl || !prevEl) return;

      const instance = new Swiper(sliderEl, {
        modules: [Navigation],
        slidesPerView: 1.2,
        spaceBetween: 16,
        centeredSlides: false,
        navigation: {
          addIcons: false,
          nextEl,
          prevEl,
        },
      });

      gallerySwiperInstances.set(sliderEl, instance);
    } else if (gallerySwiperInstances.has(sliderEl)) {
      gallerySwiperInstances.get(sliderEl)?.destroy(true, true);
      gallerySwiperInstances.delete(sliderEl);
    }
  });
}

onReady(initSwiper);

let resizeTimer;
globalThis.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initSwiper, 150);
});
