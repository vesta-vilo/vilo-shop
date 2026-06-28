import Swiper from 'swiper';
import { FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

const DESKTOP_BREAKPOINT = 1024;
const TABLET_BREAKPOINT = 768;
const MOBILE_OFFSET = 15;
const CONTENT_WIDTH_PX = 1450;
const MIN_GUTTER_PX = 30;

const initFreeScroll = () => {
  const el = document.querySelector('.free-scroll-swiper');
  if (!el) return;

  const parent = el.closest('.free-scroll-section');
  const viewport = parent.querySelector('.free-scroll-swiper-viewport');
  const nextBtn = parent.querySelector('.free-scroll-swiper-button-next');
  const prevBtn = parent.querySelector('.free-scroll-swiper-button-prev');

  const getDesktopGutter = () => {
    if (!viewport) {
      return Math.max(MIN_GUTTER_PX, (window.innerWidth - CONTENT_WIDTH_PX) / 2);
    }

    const gutter = parseFloat(getComputedStyle(viewport).getPropertyValue('--free-scroll-gutter'));
    if (Number.isFinite(gutter) && gutter > 0) return gutter;

    return Math.max(MIN_GUTTER_PX, (window.innerWidth - CONTENT_WIDTH_PX) / 2);
  };

  const getOffsets = () => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      const gutter = getDesktopGutter();
      return { before: gutter, after: gutter };
    }

    if (window.innerWidth >= TABLET_BREAKPOINT) {
      return { before: MOBILE_OFFSET, after: MOBILE_OFFSET };
    }

    return { before: MOBILE_OFFSET, after: MOBILE_OFFSET };
  };

  const initialOffsets = getOffsets();
  let swiper;

  const applyOffsets = (forceReset = false) => {
    const { before, after } = getOffsets();
    const offsetsChanged =
      swiper.params.slidesOffsetBefore !== before ||
      swiper.params.slidesOffsetAfter !== after;

    if (!offsetsChanged && !forceReset) return;

    swiper.params.slidesOffsetBefore = before;
    swiper.params.slidesOffsetAfter = after;
    swiper.slideTo(0, 0);
    swiper.update();
  };

  swiper = new Swiper(el, {
    modules: [FreeMode, Navigation],
    slidesPerView: 'auto',
    spaceBetween: 16,
    initialSlide: 0,
    freeMode: {
      enabled: true,
      sticky: false,
      momentumBounce: false,
    },
    grabCursor: true,
    watchSlidesProgress: true,
    slidesOffsetBefore: initialOffsets.before,
    slidesOffsetAfter: initialOffsets.after,
    observer: true,
    observeParents: true,
    navigation: {
      addIcons: false,
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    breakpoints: {
      320: {
        slidesPerView: 1.25,
        centeredSlides: false,
      },
      768: {
        slidesPerView: 'auto',
        spaceBetween: 30,
      },
    },
  });

  applyOffsets(true);
  requestAnimationFrame(() => applyOffsets(true));
  window.addEventListener('resize', () => applyOffsets());
};

initFreeScroll();
