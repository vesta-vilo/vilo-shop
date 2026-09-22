import { onReady } from "./islands/on-ready.js";

/**
 * Sticky buy bar — markup lives inside <product-form>
 * (_page-components/components/product-sticky-bar.html).
 *
 * Visibility rules:
 * - `.is-active` is set here while the form's buy button is scrolled off the top
 *   of the viewport.
 * - Mobile: shown at the bottom whenever `.is-active`.
 * - Desktop (≥768px): shown at the top only while the main nav is hidden —
 *   gated in CSS via `body.header-is-sticky:has(header.header--hidden)`.
 *
 * Price text is kept in sync by ProductForm (it updates every [data-original-price]).
 * Click is forwarded to the form's buy button, so checkout logic stays in ProductForm.
 */
class ProductStickyBar extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.syncDisabled = this.syncDisabled.bind(this);
  }

  connectedCallback() {
    // Children may not be parsed yet when the element upgrades during parsing.
    onReady(() => this.init());
  }

  init() {
    if (!this.isConnected || this.observer) return;

    this.buyButton = this.closest("product-form")?.querySelector(
      ".js-preorder-button",
    );
    this.button = this.querySelector(".js-product-sticky-bar-button");
    if (!this.buyButton || !this.button) return;

    this.button.addEventListener("click", this.handleClick);

    this.observer = new IntersectionObserver(([entry]) => {
      // Only when the button has left through the top edge (user scrolled past it).
      const isAbove =
        !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
      this.classList.toggle("is-active", isAbove);
      this.button.tabIndex = isAbove ? 0 : -1;
    });
    this.observer.observe(this.buyButton);

    // Mirror the main button's disabled state (set by ProductForm).
    this.disabledObserver = new MutationObserver(this.syncDisabled);
    this.disabledObserver.observe(this.buyButton, {
      attributes: true,
      attributeFilter: ["disabled"],
    });
    this.syncDisabled();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.disabledObserver?.disconnect();
    this.observer = null;
    this.disabledObserver = null;
    this.button?.removeEventListener("click", this.handleClick);
  }

  syncDisabled() {
    this.button.disabled = this.buyButton.disabled;
  }

  handleClick() {
    this.buyButton.click();
  }
}

customElements.define("product-sticky-bar", ProductStickyBar);
