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
 * Note text: the partial's `note` arg (kept in data-deposit-note) while the Deposit
 * payment plan is selected, the compare-at price otherwise — mirroring the main price
 * block, where [data-deposit-label] and [data-compare-price] swap the same way.
 * Click is forwarded to the form's buy button, so checkout logic stays in ProductForm.
 */
class ProductStickyBar extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.syncDisabled = this.syncDisabled.bind(this);
    this.renderNote = this.renderNote.bind(this);
  }

  connectedCallback() {
    // Children may not be parsed yet when the element upgrades during parsing.
    onReady(() => this.init());
  }

  init() {
    if (!this.isConnected || this.observer) return;

    this.form = this.closest("product-form");
    this.buyButton = this.form?.querySelector(".js-preorder-button");
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
    this.initNote();
  }

  // Note text follows the payment plan (ProductForm emits payment-plan:changed, same as
  // ProductPaymentVariantMarquee). The compare price itself is filled by ProductForm after
  // the Shopify fetch, with no event of its own — hence the MutationObserver.
  initNote() {
    this.noteEl = this.querySelector(".js-product-sticky-bar-note");
    if (!this.noteEl) return;

    this.compareEl = document.querySelector(
      ".product-price [data-compare-price]",
    );
    globalThis.addEventListener("payment-plan:changed", this.renderNote);
    if (this.compareEl) {
      this.compareObserver = new MutationObserver(this.renderNote);
      this.compareObserver.observe(this.compareEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
    this.renderNote();
  }

  renderNote() {
    const plan = this.form?.querySelector(
      'input[name="payment-plan"]:checked',
    )?.value;
    const compare = this.compareEl?.textContent.trim() ?? "";
    const showCompare = Boolean(plan) && plan !== "Deposit" && compare !== "";

    this.noteEl.textContent = showCompare
      ? compare
      : (this.noteEl.dataset.depositNote ?? "");
    this.noteEl.classList.toggle(
      "product-sticky-bar__note--compare",
      showCompare,
    );
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.disabledObserver?.disconnect();
    this.compareObserver?.disconnect();
    this.observer = null;
    this.disabledObserver = null;
    this.compareObserver = null;
    this.button?.removeEventListener("click", this.handleClick);
    globalThis.removeEventListener("payment-plan:changed", this.renderNote);
  }

  syncDisabled() {
    this.button.disabled = this.buyButton.disabled;
  }

  handleClick() {
    this.buyButton.click();
  }
}

customElements.define("product-sticky-bar", ProductStickyBar);
