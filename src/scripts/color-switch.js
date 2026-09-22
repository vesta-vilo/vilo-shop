import Swiper from 'swiper';
import { EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { onReady } from './islands/on-ready.js';

const SLIDER_SELECTORS = [
  '.js-color-switch-main-slider',
  '.js-color-switch-secondary-slider',
  '.js-color-switch-text-slider',
];

function initColorSwitch(sectionEl) {
  const sliderEls = SLIDER_SELECTORS.map((selector) => sectionEl.querySelector(selector)).filter(Boolean);
  const swatchEls = [...sectionEl.querySelectorAll('.js-color-switch-swatch')];
  if (!sliderEls.length) return;

  const setActiveSwatch = (index) => {
    swatchEls.forEach((swatchEl, i) => {
      const isActive = i === index;
      swatchEl.classList.toggle('is-active', isActive);
      swatchEl.setAttribute('aria-pressed', String(isActive));
    });
  };

  // Text leaves upward and fades out while the next one rises in from below
  const textSliderOptions = {
    modules: [EffectCreative],
    effect: 'creative',
    creativeEffect: {
      prev: { translate: [0, '-100%', 0], opacity: 0 },
      next: { translate: [0, '100%', 0], opacity: 0 },
    },
    autoHeight: true,
    allowTouchMove: false,
  };

  const swipers = sliderEls.map(
    (sliderEl) =>
      new Swiper(sliderEl, {
        speed: 600,
        ...(sliderEl.matches('.js-color-switch-text-slider') ? textSliderOptions : {}),
      }),
  );

  // Keep all sliders on the same color; slideTo is a no-op for the one that already moved
  swipers.forEach((swiper) => {
    swiper.on('slideChange', () => {
      const index = swiper.activeIndex;
      swipers.forEach((other) => {
        if (other !== swiper) other.slideTo(index);
      });
      setActiveSwatch(index);
    });
  });

  swatchEls.forEach((swatchEl, index) => {
    swatchEl.addEventListener('click', () => swipers[0].slideTo(index));
  });
}

onReady(() => {
  document.querySelectorAll('.color-switch').forEach(initColorSwitch);
});
