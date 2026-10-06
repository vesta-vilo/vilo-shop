import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { onReady } from './islands/on-ready.js';

const swiperInstances = new Map();

// Same behaviour as alter-gallery-swiper.js, but the cover image is the first slide
function initPanelSwiper(panelEl) {
  const sliderEl = panelEl.querySelector('.feature-showcase-slider');
  if (!sliderEl) return null;
  if (swiperInstances.has(sliderEl)) return swiperInstances.get(sliderEl);

  const nextEl = panelEl.querySelector('.feature-showcase-swiper-button-next');
  const prevEl = panelEl.querySelector('.feature-showcase-swiper-button-prev');
  if (!nextEl || !prevEl) return null;

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

  swiperInstances.set(sliderEl, instance);
  return instance;
}

function initFeatureShowcase(sectionEl) {
  const tabs = Array.from(sectionEl.querySelectorAll('.feature-showcase-tab'));
  const panels = tabs.map((tab) => sectionEl.querySelector(`#${tab.getAttribute('aria-controls')}`));

  const activate = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      const panel = panels[i];
      if (!panel) return;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });

    if (focus) tabs[index].focus();

    // Panels are display:none while hidden — init lazily / re-measure once visible.
    // Each tab keeps its own slide position between switches.
    const swiper = panels[index] && initPanelSwiper(panels[index]);
    if (swiper) swiper.update();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      activate(next, true);
    });
  });

  const initialIndex = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
  activate(initialIndex);
}

onReady(() => {
  document.querySelectorAll('.feature-showcase').forEach(initFeatureShowcase);
});
