import Swiper from 'swiper';
import { FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

const DESKTOP_BREAKPOINT = 768;
const FREE_SCROLL_BREAKPOINT = 1024;
const MOBILE_OFFSET = 15;
const CONTENT_WIDTH_PX = 1450;
const MIN_GUTTER_PX = 30;
const MODAL_DIALOG_ID = 'customer-voice-dialog';

class CustomerVoice extends HTMLElement {
  #abortController;
  #swiper = null;
  #modalSwiper = null;
  #resizeTimer;

  connectedCallback() {
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    const slides = this.#renderSlides();
    if (!slides.length) {
      return;
    }

    this.#fillCtaFromData();
    this.#renderModalSlides(slides);
    this.#initSwiper();
    this.#initModalSwiper();
    this.#bindModalTriggers();

    window.addEventListener('resize', () => this.#onResize(), { signal });
  }

  disconnectedCallback() {
    this.#abortController?.abort();
    this.#destroySwiper();
    this.#destroyModalSwiper();
  }

  #onResize() {
    clearTimeout(this.#resizeTimer);
    this.#resizeTimer = setTimeout(() => this.#handleResize(), 150);
  }

  #renderSlides() {
    const slidesRoot = this.querySelector('.js-customer-voice-slides');
    const template = this.querySelector('.js-customer-voice-slide-template');
    const dataNode = this.querySelector('.js-customer-voice-data');

    if (!slidesRoot || !template || !dataNode) {
      return [];
    }

    try {
      const { slides = [] } = JSON.parse(dataNode.textContent);
      const fragment = document.createDocumentFragment();

      slides.forEach((slide, index) => {
        fragment.append(this.#createSlide(template, slide, index));
      });

      slidesRoot.replaceChildren(fragment);
      return slides;
    } catch (error) {
      console.error('Failed to parse customer voice data:', error);
      return [];
    }
  }

  #renderModalSlides(slides) {
    const slidesRoot = this.querySelector('.js-customer-voice-modal-slides');
    const template = this.querySelector('.js-customer-voice-modal-slide-template');

    if (!slidesRoot || !template) {
      return;
    }

    const fragment = document.createDocumentFragment();

    slides.forEach((slide) => {
      fragment.append(this.#createModalSlide(template, slide));
    });

    slidesRoot.replaceChildren(fragment);
  }

  #fillCtaFromData() {
    const dataNode = this.querySelector('.js-customer-voice-data');
    if (!dataNode) return;

    try {
      const { cta } = JSON.parse(dataNode.textContent);
      this.querySelectorAll('.customer-voice-modal .customer-voice__cta').forEach((link) => {
        this.#fillCta(link, cta);
      });
    } catch (error) {
      console.error('Failed to parse customer voice CTA data:', error);
    }
  }

  #fillCta(link, cta) {
    if (!link) return;

    const { title, link: href } = cta ?? {};

    if (!title || !href) {
      link.remove();
      return;
    }

    const textEl = link.querySelector('.customer-voice__cta-text');
    if (textEl) {
      textEl.textContent = title;
    }

    link.href = href;
  }

  #createSlide(template, slide, index) {
    const node = template.content.firstElementChild.cloneNode(true);
    const badgeIcon = slide['badge-icon'] ?? slide.badgeIcon ?? slide['hash-icon'] ?? slide.hashIcon;
    const badgeText = slide['badge-text'] ?? slide.badgeText ?? slide['hash-text'] ?? slide.hashText;

    const image = node.querySelector('.customer-voice-card__image');
    image.src = slide.image ?? '';
    image.alt = slide.alt ?? '';

    this.#fillTitle(node.querySelector('.customer-voice-card__title'), slide.title);
    this.#setText(node.querySelector('.customer-voice-card__subtitle'), slide.subtitle);
    this.#fillBadge(node.querySelector('.customer-voice-card__badge'), badgeIcon, badgeText);
    this.#fillOpenButton(
      node.querySelector('.customer-voice-card__open'),
      this.#getPlainText(slide.title),
      index,
    );

    return node;
  }

  #createModalSlide(template, slide) {
    const node = template.content.firstElementChild.cloneNode(true);
    const voice = slide.voice ?? {};
    const badgeIcon = slide['badge-icon'] ?? slide.badgeIcon ?? slide['hash-icon'] ?? slide.hashIcon;
    const badgeText = slide['badge-text'] ?? slide.badgeText ?? slide['hash-text'] ?? slide.hashText;

    const image = node.querySelector('.customer-voice-modal-slide__image');
    image.src = slide.image ?? '';
    image.alt = slide.alt ?? '';

    this.#fillTitle(node.querySelector('.customer-voice-modal-slide__title'), slide.title);
    this.#setText(node.querySelector('.customer-voice-modal-slide__description'), slide.description);
    this.#fillBadge(node.querySelector('.customer-voice-card__badge'), badgeIcon, badgeText);
    this.#fillVoice(node.querySelector('.customer-voice-modal-slide__voice'), voice);

    return node;
  }

  #fillTitle(element, title) {
    if (!element) return;

    if (!title) {
      element.remove();
      return;
    }

    element.innerHTML = title;
  }

  #getPlainText(value) {
    if (!value) return '';

    const el = document.createElement('div');
    el.innerHTML = value;
    return el.textContent.trim();
  }

  #setText(element, value) {
    if (!element) return;

    if (!value) {
      element.remove();
      return;
    }

    element.textContent = value;
  }

  #fillBadge(badge, icon, text) {
    if (!badge) return;

    if (!icon && !text) {
      badge.remove();
      return;
    }

    const iconEl = badge.querySelector('.customer-voice-card__badge-icon');
    const textEl = badge.querySelector('.customer-voice-card__badge-text');

    if (icon && iconEl) {
      iconEl.src = icon;
      iconEl.alt = text ?? '';
    } else {
      iconEl?.remove();
    }

    this.#setText(textEl, text);

    if (!text && textEl) {
      textEl.remove();
    }
  }

  #fillVoice(voiceBlock, voice) {
    if (!voiceBlock) return;

    const { name, role, message } = voice;

    if (!name && !role && !message) {
      voiceBlock.remove();
      return;
    }

    this.#setText(voiceBlock.querySelector('.customer-voice-modal-slide__message'), message);
    this.#setText(voiceBlock.querySelector('.customer-voice-modal-slide__name'), name);
    this.#setText(voiceBlock.querySelector('.customer-voice-modal-slide__role'), role);
  }

  #fillOpenButton(button, title, index) {
    if (!button) return;

    button.dataset.slideIndex = String(index);
    button.setAttribute('aria-label', title ? `Open ${title}` : 'Open story');
  }

  #bindModalTriggers() {
    this.addEventListener('click', (event) => {
      const button = event.target.closest('.customer-voice-card__open');
      if (!button || !this.contains(button)) return;

      const index = Number.parseInt(button.dataset.slideIndex ?? '0', 10);
      this.#openModal(Number.isFinite(index) ? index : 0);
    });
  }

  #openModal(index) {
    if (!this.#modalSwiper) return;

    this.#modalSwiper.slideTo(index, 0);
    globalThis.dispatchEvent(new CustomEvent(`dialog:open:${MODAL_DIALOG_ID}`));

    requestAnimationFrame(() => {
      this.#modalSwiper?.update();
    });
  }

  #getDesktopGutter(viewport) {
    if (!viewport) {
      return Math.max(MIN_GUTTER_PX, (window.innerWidth - CONTENT_WIDTH_PX) / 2);
    }

    const gutter = parseFloat(getComputedStyle(viewport).getPropertyValue('--customer-voice-gutter'));
    if (Number.isFinite(gutter) && gutter > 0) return gutter;

    return Math.max(MIN_GUTTER_PX, (window.innerWidth - CONTENT_WIDTH_PX) / 2);
  }

  #getFreeScrollOffsets(viewport) {
    if (window.innerWidth >= FREE_SCROLL_BREAKPOINT) {
      const gutter = this.#getDesktopGutter(viewport);
      return { before: gutter, after: gutter };
    }

    return { before: MOBILE_OFFSET, after: MOBILE_OFFSET };
  }

  #destroySwiper() {
    if (!this.#swiper) return;

    this.#swiper.destroy(true, true);
    this.#swiper = null;
  }

  #destroyModalSwiper() {
    if (!this.#modalSwiper) return;

    this.#modalSwiper.destroy(true, true);
    this.#modalSwiper = null;
  }

  #initGalleryMobileSwiper() {
    const el = this.querySelector('.customer-voice-swiper');
    const nextEl = this.querySelector('.swiper-nav-holder .swiper-button-next');
    const prevEl = this.querySelector('.swiper-nav-holder .swiper-button-prev');

    if (!el || !nextEl || !prevEl) return;

    this.#swiper = new Swiper(el, {
      modules: [Navigation],
      slidesPerView: 1.2,
      spaceBetween: 16,
      centeredSlides: false,
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,
      navigation: {
        addIcons: false,
        nextEl,
        prevEl,
      },
    });

    this.dataset.swiperMode = 'mobile';
  }

  #initFreeScrollSwiper() {
    const el = this.querySelector('.customer-voice-swiper');
    const viewport = this.querySelector('.customer-voice-swiper-viewport');

    if (!el) return;

    const initialOffsets = this.#getFreeScrollOffsets(viewport);

    const applyOffsets = (forceReset = false) => {
      const { before, after } = this.#getFreeScrollOffsets(viewport);
      const offsetsChanged =
        this.#swiper.params.slidesOffsetBefore !== before ||
        this.#swiper.params.slidesOffsetAfter !== after;

      if (!offsetsChanged && !forceReset) return;

      this.#swiper.params.slidesOffsetBefore = before;
      this.#swiper.params.slidesOffsetAfter = after;
      this.#swiper.slideTo(0, 0);
      this.#swiper.update();
    };

    this.#swiper = new Swiper(el, {
      modules: [FreeMode],
      slidesPerView: 'auto',
      spaceBetween: 26,
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
    });

    this.#swiper.__applyOffsets = applyOffsets;
    applyOffsets(true);
    requestAnimationFrame(() => applyOffsets(true));
    this.dataset.swiperMode = 'desktop';
  }

  #initModalSwiper() {
    const el = this.querySelector('.customer-voice-modal-swiper');
    const controls = this.querySelector('.customer-voice-modal__controls');
    const nextEl = controls?.querySelector('.swiper-button-next');
    const prevEl = controls?.querySelector('.swiper-button-prev');

    if (!el || !nextEl || !prevEl) return;

    this.#modalSwiper = new Swiper(el, {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 400,
      navigation: {
        addIcons: false,
        nextEl,
        prevEl,
      },
    });
  }

  #initSwiper() {
    this.#destroySwiper();

    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      this.#initGalleryMobileSwiper();
      return;
    }

    this.#initFreeScrollSwiper();
  }

  #handleResize() {
    const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    const nextMode = isMobile ? 'mobile' : 'desktop';

    if (this.dataset.swiperMode === nextMode) {
      this.#swiper?.__applyOffsets?.();
      this.#modalSwiper?.update();
      return;
    }

    this.#initSwiper();
    this.#modalSwiper?.update();
  }
}

customElements.define('customer-voice', CustomerVoice);
