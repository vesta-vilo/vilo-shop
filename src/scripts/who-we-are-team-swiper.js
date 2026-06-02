import Swiper from 'swiper';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const whoWeAreTeamSwiperInstances = new Map();

function getScopedEls(sliderEl) {
  const sectionEl = sliderEl.closest('.who-we-are-team-section');
  if (!sectionEl) return {};

  return {
    paginationEl: sectionEl.querySelector('.swiper-pagination'),
    nextEl: sectionEl.querySelector('.swiper-button-next'),
    prevEl: sectionEl.querySelector('.swiper-button-prev'),
    wrapperEl: sliderEl.querySelector('.swiper-wrapper'),
    gridEl: sectionEl.querySelector('.who-we-are-team-grid'),
  };
}

function syncSlidesFromGrid(sliderEl) {
  const { wrapperEl, gridEl } = getScopedEls(sliderEl);
  if (!wrapperEl || !gridEl) return;

  wrapperEl.replaceChildren();

  gridEl.querySelectorAll('.who-we-are-card').forEach((card) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.appendChild(card.cloneNode(true));

    slide.querySelectorAll('img').forEach((img) => {
      img.classList.add('skip-img-fadein');
      img.classList.remove('is-visible');
      delete img.dataset.fadein;
      delete img.dataset.fadeinInitialized;
      delete img.dataset.fadeinShown;
      delete img.dataset.fadeinTimer;
      img.loading = 'eager';
    });

    wrapperEl.appendChild(slide);
  });
}

function initSwiper() {
  const isMobile = window.innerWidth <= 768;

  document.querySelectorAll('.who-we-are-team-slider').forEach((sliderEl) => {
    if (isMobile) {
      if (whoWeAreTeamSwiperInstances.has(sliderEl)) return;

      syncSlidesFromGrid(sliderEl);

      const { paginationEl, nextEl, prevEl } = getScopedEls(sliderEl);
      if (!paginationEl || !nextEl || !prevEl) return;

      const instance = new Swiper(sliderEl, {
        modules: [Pagination, Navigation],
        slidesPerView: 1.2,
        spaceBetween: 16,
        centeredSlides: false,
        pagination: {
          el: paginationEl,
          type: 'fraction',
        },
        navigation: {
          addIcons: false,
          nextEl,
          prevEl,
        },
      });

      whoWeAreTeamSwiperInstances.set(sliderEl, instance);
    } else if (whoWeAreTeamSwiperInstances.has(sliderEl)) {
      whoWeAreTeamSwiperInstances.get(sliderEl)?.destroy(true, true);
      whoWeAreTeamSwiperInstances.delete(sliderEl);
    }
  });
}

function runInit() {
  initSwiper();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}

let resizeTimer;
globalThis.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initSwiper, 150);
});
