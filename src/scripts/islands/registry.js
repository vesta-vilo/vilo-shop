/**
 * Island registry — maps DOM presence to lazy-loaded script modules.
 *
 * Each entry loads only when its selector matches an element on the page.
 * Vite splits each dynamic import into a separate chunk.
 *
 * Selectors: custom element tag names (e.g. "product-media") or CSS selectors.
 */
export const islands = [
  // Layout / global-ish (conditional on page content)
  {
    id: 'floating-cta-footer',
    selector: '.floating-cta-wrapper',
    load: () => import('../floating-cta-footer.js'),
  },

  // Dialogs
  {
    id: 'modal-dialog',
    selector: 'modal-dialog',
    load: () => import('../ModalDialog.js'),
  },
  {
    id: 'subscription-dialog',
    selector: 'subscription-dialog',
    load: () => import('../SubscriptionDialog.js'),
  },
  {
    id: 'card-modal',
    selector: 'card-modal',
    load: () => import('../CardModal.js'),
  },

  // Forms
  {
    id: 'subscription',
    selector: '.js-contact-us-form',
    load: () => import('../Subscription.js'),
  },

  // Custom elements
  {
    id: 'faq-tabs',
    selector: 'faq-tabs',
    load: () => import('../Faq.js'),
  },
  {
    id: 'polaroid-gallery',
    selector: 'polaroid-gallery',
    load: () => import('../polaroid-gallery.js'),
  },
  {
    id: 'product-media',
    selector: 'product-media',
    load: () => import('../ProductMedia.js'),
  },
  {
    id: 'product-form',
    selector: 'product-form',
    load: () => import('../ProductForm.js'),
  },
  {
    id: 'product-payment-variant-marquee',
    selector: 'product-payment-variant-marquee',
    load: () => import('../ProductPaymentVariantMarquee.js'),
  },
  {
    id: 'customer-voice',
    selector: 'customer-voice',
    load: () => import('../customer-voice.js'),
  },
  {
    id: 'size-guide',
    selector: 'size-guide',
    load: () => import('../SizeGuide.js'),
  },
  {
    id: 'hsa-fsa-guide',
    selector: 'hsa-fsa-guide',
    load: () => import('../HSAFSAGuide.js'),
  },

  // GSAP sections
  {
    id: 'hero',
    selector: '.gsap-hero-section-wrapper',
    load: () => import('../hero.js'),
  },
  {
    id: 'parallax',
    selector: '.gsap-parallax-section',
    load: () => import('../parallax.js'),
  },

  // Swipers
  {
    id: 'gallery-swiper',
    selector: '.gallery-slider',
    load: () => import('../gallery-swiper.js'),
  },
  {
    id: 'alter-gallery-swiper',
    selector: '.alter-gallery-slider',
    load: () => import('../alter-gallery-swiper.js'),
  },
  {
    id: 'who-we-are-team-swiper',
    selector: '.who-we-are-team-slider',
    load: () => import('../who-we-are-team-swiper.js'),
  },
  {
    id: 'mobile-shop-menu-swiper',
    selector: '.mobile-shop-menu__cards',
    load: () => import('../mobile-shop-menu-swiper.js'),
  },
  {
    id: 'home-page-product-swiper',
    selector: '.product-media-slider',
    load: () => import('../home-page-product-swiper.js'),
  },
  {
    id: 'free-scroll-swiper',
    selector: '.free-scroll-swiper',
    load: () => import('../free-scroll-swiper.js'),
  },
  {
    id: 'cards-swiper',
    selector: '.cards-swiper',
    load: () => import('../cards-swiper.js'),
  },
];
