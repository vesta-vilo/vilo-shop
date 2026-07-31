import Swiper from 'swiper';
import { Autoplay, Mousewheel, Thumbs, EffectFade, Navigation, Pagination } from 'swiper/modules';
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
    this.querySelector('.product-thumb-swiper')?.removeEventListener(
      'click',
      this._thumbSelectHandler,
    );
    this._thumbSelectHandler = null;
    this.mainSwiper?.destroy()
    this.thumbSwiper?.destroy()
  }

  initSwipers() {
    const nextBtn = this.querySelector('.product-main-swiper-button-next');
    const prevBtn = this.querySelector('.product-main-swiper-button-prev');
    const paginationEl = this.querySelector('.product-main-swiper-pagination');
    const thumbEl = this.querySelector('.product-thumb-swiper');

    const productThumbSwiperInstance = new Swiper(thumbEl, {
      modules: [Mousewheel, Thumbs],
      slidesPerView: 6.5,
      spaceBetween: 8,
      watchSlidesProgress: true,
      slideToClickedSlide: true,
      preventClicks: false,
      preventClicksPropagation: false,
      noSwiping: false,
      grabCursor: true,
      mousewheel: {
        forceToAxis: true,
        sensitivity: 1,
        thresholdDelta: 4,
      },
    });

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
        noSwiping: true,
        noSwipingSelector: '.product-media-images-grid, .product-media-images-grid *',
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
          autoScrollOffset: 0,
        },
      },
    );

    this.mainSwiper = productMainSwiperInstance;
    this.thumbSwiper = productThumbSwiperInstance;

    this.bindThumbSelection(thumbEl);
  }

  bindThumbSelection(thumbEl) {
    if (!thumbEl || this._thumbSelectHandler) return;

    this._thumbSelectHandler = (event) => {
      const slide = event.target.closest('.swiper-slide');
      if (!slide || !thumbEl.contains(slide)) return;

      const index = this.thumbSwiper.slides.indexOf(slide);
      if (index < 0) return;

      this.mainSwiper.slideTo(index);
      this.thumbSwiper.slideTo(index);
    };

    thumbEl.addEventListener('click', this._thumbSelectHandler);
  }

  async updateImages(variantName) {
    const { getVariantMedia } = await import('./media-utils.js');
    const media = getVariantMedia(variantName);
    if (!media?.images?.length) return;

    const { images: newImages, video } = media;
    const activeIndex = this.mainSwiper?.activeIndex ?? 0;
    const nextIndex = Math.min(activeIndex, newImages.length - 1);

    const mainImages = this.querySelectorAll('.product-main-swiper img');
    const thumbImages = this.querySelectorAll('.product-thumb-swiper img');

    newImages.forEach((url, index) => {
      if (mainImages[index]) mainImages[index].src = url;
      if (thumbImages[index]) thumbImages[index].src = url;
    });

    const videoImage = this.querySelector('.product-media-video img');
    if (videoImage && video?.src) {
      videoImage.src = video.src;
      if (video.alt) {
        videoImage.alt = video.alt;
      } else {
        const title = document.querySelector('.product-title')?.textContent?.trim();
        videoImage.alt = title ? `${title} - ${variantName}` : variantName;
      }
    }

    if (nextIndex !== activeIndex) {
      this.mainSwiper?.slideTo(nextIndex, 0);
      this.thumbSwiper?.slideTo(nextIndex, 0);
    }
  }
}

customElements.define('product-media', ProductMedia);
