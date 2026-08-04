import Swiper from 'swiper';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { onReady } from './islands/on-ready.js';

const swiperAlterGalleryInstances = new Map();

function initAlterSwiper() {
  const sliderEls = document.querySelectorAll('.alter-gallery-slider');

  sliderEls.forEach((sliderEl) => {
    if (swiperAlterGalleryInstances.has(sliderEl)) return;

    const sectionEl = sliderEl.closest('.alter-gallery-section') || sliderEl.parentElement;
    if (!sectionEl) return;

    const paginationEl = sectionEl.querySelector('.swiper-pagination');
    const nextEl = sectionEl.querySelector('.swiper-button-next');
    const prevEl = sectionEl.querySelector('.swiper-button-prev');
    if (!paginationEl || !nextEl || !prevEl) return;

    const instance = new Swiper(sliderEl, {
      modules: [Pagination, Navigation],
      slidesPerView: 1.2,
      spaceBetween: 16,
      centeredSlides: false,
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          spaceBetween: 20,
        }
      },
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

    swiperAlterGalleryInstances.set(sliderEl, instance);
  });
}

onReady(initAlterSwiper);
