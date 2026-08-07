import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { onReady } from './islands/on-ready.js';

const swiperAlterGalleryInstances = new Map();

function initAlterSwiper() {
  const sliderEls = document.querySelectorAll('.alter-gallery-slider');

  sliderEls.forEach((sliderEl) => {
    if (swiperAlterGalleryInstances.has(sliderEl)) return;

    const sectionEl = sliderEl.closest('.alter-gallery-section') || sliderEl.parentElement;
    if (!sectionEl) return;

    const nextEl = sectionEl.querySelector('.alter-gallery-swiper-button-next');
    const prevEl = sectionEl.querySelector('.alter-gallery-swiper-button-prev');
    if (!nextEl || !prevEl) return;

    const instance = new Swiper(sliderEl, {
      modules: [Navigation],
      slidesPerView: 1.2,
      spaceBetween: 16,
      centeredSlides: false,
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          spaceBetween: 20,
        }
      },
      navigation: {
        addIcons: false,
        nextEl,
        prevEl,
      },
    });

    swiperAlterGalleryInstances.set(sliderEl, instance);
  });
}

onReady(initAlterSwiper);
