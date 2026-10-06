import Swiper from 'swiper';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// Perk row under the buy button: one free-swipe slider per payment plan,
// only the active plan's slider is shown (ProductForm emits payment-plan:changed).
class ProductPaymentPerks extends HTMLElement {
  constructor() {
    super();
    this.swipers = new Map();
    this.handlePlanChange = this.handlePlanChange.bind(this);
  }

  connectedCallback() {
    this.sliders = this.querySelectorAll('.product-payment-perks-swiper');
    if (!this.sliders.length) return;

    this.sliders.forEach(el => {
      this.swipers.set(el, new Swiper(el, {
        modules: [FreeMode],
        slidesPerView: 'auto',
        spaceBetween: 16,
        freeMode: {
          enabled: true,
          sticky: false,
          momentumBounce: false,
        },
        grabCursor: true,
        centerInsufficientSlides: true,
      }));
    });

    // The checked radio decides the initial plan; ProductForm only emits on change.
    const checked = (this.closest('product-form') || document)
      .querySelector('input[name="payment-plan"]:checked');
    if (checked) this.updateVisibility(checked.value);

    globalThis.addEventListener('payment-plan:changed', this.handlePlanChange);
  }

  handlePlanChange(e) {
    if (e.detail?.plan) {
      this.updateVisibility(e.detail.plan);
    }
  }

  updateVisibility(activePlan) {
    this.sliders.forEach(el => {
      const isActive = el.dataset.variant === activePlan;
      el.classList.toggle('is-active', isActive);
      if (!isActive) return;

      // Slider was display:none, so re-measure and start from the first perk.
      const swiper = this.swipers.get(el);
      swiper.update();
      swiper.setTranslate(swiper.minTranslate());
    });
  }

  disconnectedCallback() {
    globalThis.removeEventListener('payment-plan:changed', this.handlePlanChange);
    this.swipers.forEach(swiper => swiper.destroy(true, true));
    this.swipers.clear();
  }
}

customElements.define('product-payment-perks', ProductPaymentPerks);
