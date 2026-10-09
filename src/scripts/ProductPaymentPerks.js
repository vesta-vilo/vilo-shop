// Perk row under the buy button: one infinitely looping marquee per payment plan,
// only the active plan's row is shown (ProductForm emits payment-plan:changed).
// Each row's list is cloned until the copies cover the row plus one extra list,
// and every copy slides left by its own width, so the loop has no visible seam.
const SPEED = 40; // px per second

class ProductPaymentPerks extends HTMLElement {
  constructor() {
    super();
    this.handlePlanChange = this.handlePlanChange.bind(this);
  }

  connectedCallback() {
    this.rows = this.querySelectorAll('.js-product-payment-perks-row');
    if (!this.rows.length) return;

    // The checked radio decides the initial plan; ProductForm only emits on change.
    const checked = this.closest('product-form')
      ?.querySelector('input[name="payment-plan"]:checked');
    if (checked) this.updateVisibility(checked.value);

    // Re-fill on width changes and once the font swaps in (labels change width).
    this.observer = new ResizeObserver(() => this.fillActiveRow());
    this.observer.observe(this);
    this.rows.forEach(row => this.observer.observe(row.querySelector('.js-product-payment-perks-list')));

    globalThis.addEventListener('payment-plan:changed', this.handlePlanChange);
  }

  handlePlanChange(e) {
    if (e.detail?.plan) {
      this.updateVisibility(e.detail.plan);
    }
  }

  updateVisibility(activePlan) {
    this.rows.forEach(row => {
      row.classList.toggle('is-active', row.dataset.variant === activePlan);
    });
    this.fillActiveRow();
  }

  fillActiveRow() {
    const row = this.querySelector('.js-product-payment-perks-row.is-active');
    if (!row) return;

    const list = row.querySelector('.js-product-payment-perks-list');
    const listWidth = list.offsetWidth;
    if (!listWidth) return;

    const needed = Math.ceil(row.offsetWidth / listWidth) + 1;
    const lists = row.querySelectorAll('.js-product-payment-perks-list');

    for (let i = lists.length; i < needed; i++) {
      const clone = list.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    }
    for (let i = lists.length - 1; i >= needed; i--) lists[i].remove();

    row.style.setProperty('--perks-loop-duration', `${listWidth / SPEED}s`);
  }

  disconnectedCallback() {
    globalThis.removeEventListener('payment-plan:changed', this.handlePlanChange);
    this.observer?.disconnect();
  }
}

customElements.define('product-payment-perks', ProductPaymentPerks);
