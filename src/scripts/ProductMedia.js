import Swiper from 'swiper';
import { Autoplay, FreeMode, Thumbs, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

class ProductMedia extends HTMLElement {
  mainAutoplayDelayMs = 6000;

  connectedCallback() {
    this.style.setProperty(
      '--product-main-pagination-progress-ms',
      `${this.mainAutoplayDelayMs}ms`,
    );
    this.initSwipers();

    this._variantListener = async (event) => {
      const variantName = event.detail.variant;
      if (variantName) {
        await this.updateImages(variantName);
      }
    };

    globalThis.addEventListener('variant:changed', this._variantListener);

    import('./media-utils.js').then(({ preloadAllVariants }) => {
      preloadAllVariants();
    });
  }

  disconnectedCallback() {
    globalThis.removeEventListener('variant:changed', this._variantListener);
    this.mainSwiper?.destroy()
    this.thumbSwiper?.destroy()
  }

  initSwipers() {
    const nextBtn = this.querySelector('.product-main-swiper-button-next');
    const prevBtn = this.querySelector('.product-main-swiper-button-prev');
    const paginationEl = this.querySelector('.product-main-swiper-pagination');

    const productThumbSwiperInstance = new Swiper(
      this.querySelector('.product-thumb-swiper'),
      {
        modules: [FreeMode, Thumbs],
        slidesPerView: 6,
        spaceBetween: 8,
        freeMode: true,
        watchSlidesProgress: true,
      },
    );

    const mainModules = [Autoplay, Thumbs, EffectFade, Navigation];
    if (paginationEl) mainModules.push(Pagination);

    const productMainSwiperInstance = new Swiper(
      this.querySelector('.product-main-swiper'),
      {
        modules: mainModules,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        slidesPerView: 1,
        grabCursor: true,
        autoplay: {
          delay: this.mainAutoplayDelayMs,
          disableOnInteraction: false,
        },
        ...(paginationEl && {
          pagination: {
            el: paginationEl,
            clickable: true,
          },
        }),
        navigation: {
          addIcons: false,
          nextEl: nextBtn,
          prevEl: prevBtn,
        },
        thumbs: {
          swiper: productThumbSwiperInstance,
        },
      },
    );

    this.mainSwiper = productMainSwiperInstance;
    this.thumbSwiper = productThumbSwiperInstance;
  }

  async updateImages(variantName) {
    const { getVariantMediaMap } = await import('./media-utils.js');
    const newImages = getVariantMediaMap()[variantName];
    if (!Array.isArray(newImages) || !newImages.length) return;

    const mainImages = this.querySelectorAll('.product-main-swiper img');
    const thumbImages = this.querySelectorAll('.product-thumb-swiper img');

    newImages.forEach((url, index) => {
      if (mainImages[index]) mainImages[index].src = url;
      if (thumbImages[index]) thumbImages[index].src = url;
    });
  }
}

customElements.define('product-media', ProductMedia);
