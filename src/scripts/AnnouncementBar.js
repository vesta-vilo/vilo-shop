function initAnnouncementSlider(root) {
  const slider = root.classList?.contains('announcement-bar-slider')
    ? root
    : root.querySelector('.announcement-bar-slider');

  if (!slider || slider.dataset.sliderInitialized) return;

  slider.dataset.sliderInitialized = '1';

  const slides = Array.from(slider.querySelectorAll('.announcement-bar-slide'));
  const prevBtn = slider.querySelector('.announcement-bar-arrow--prev');
  const nextBtn = slider.querySelector('.announcement-bar-arrow--next');
  const viewport = slider.querySelector('.announcement-bar-viewport');

  if (slides.length <= 1) {
    slider.classList.add('announcement-bar-slider--single');
    return;
  }

  let currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let touchStartX = 0;

  const updateSlides = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentIndex);
    });
  };

  const goTo = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    updateSlides();
  };

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  viewport?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  viewport?.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].screenX - touchStartX;

    if (Math.abs(deltaX) < 40) return;

    goTo(currentIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
}

function initAllAnnouncementSliders() {
  document.querySelectorAll('announcement-bar, .drawer-announcement-bar-content').forEach(initAnnouncementSlider);
}

class AnnouncementBar extends HTMLElement {
  connectedCallback() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (document.body.classList.contains('dm-open')) return;

      document.body.classList.toggle('header-is-sticky', !entry.isIntersecting);
    }, {
      threshold: 0
    });

    this.observer.observe(this);
    initAnnouncementSlider(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    document.body.classList.add('header-is-sticky');
  }
}

customElements.define('announcement-bar', AnnouncementBar);

document.addEventListener('DOMContentLoaded', initAllAnnouncementSliders);
