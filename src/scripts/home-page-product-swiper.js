import Swiper from 'swiper';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { onReady } from './islands/on-ready.js';

let productSwiperInstance = null;

function initProductHomePageSwiper() {
  if (!productSwiperInstance) {
    productSwiperInstance = new Swiper('.product-media-slider', {
      modules: [Pagination, Navigation],
      slidesPerView: 1.2,
      spaceBetween: 16,
      centeredSlides: false,
      breakpoints: {
        1024: {
          slidesPerView: 1,
          spaceBetween: 0,
        }
      },
      pagination: {
        el: '.swiper-product-media-pagination',
        type: 'fraction',
      },
      navigation: {
        addIcons: false,
        nextEl: '.swiper-ps-button-next',
        prevEl: '.swiper-ps-button-prev',
      },
    });
  }
}

onReady(initProductHomePageSwiper);