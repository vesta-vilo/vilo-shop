import Swiper from 'swiper';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const initMobileShopMenuSwiper = () => {
  const el = document.querySelector('.mobile-shop-menu__cards');
  if (!el || el.dataset.swiperInitialized) return;

  el.dataset.swiperInitialized = 'true';

  new Swiper(el, {
    modules: [FreeMode],
    slidesPerView: 'auto',
    spaceBetween: 12,
    freeMode: {
      enabled: true,
      sticky: false,
      momentumBounce: false,
    },
    grabCursor: true,
    watchSlidesProgress: true,
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileShopMenuSwiper);
} else {
  initMobileShopMenuSwiper();
}
