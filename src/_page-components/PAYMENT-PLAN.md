# Payment plan (plan cards + perks row)

The founder-pricing block inside `<product-form>`: two radio cards (`Deposit` / `Full Payment`) and, under the buy button, a perk row that switches with the selected plan.

**Plan cards:** inline in `src/_page-components/product-section-content.html` (`fieldset.payment-plan-picker`), styles in `src/styles/components/product-section.css` (`.buy-option-visual--compact`)
**Perks row partial:** `src/_page-components/components/product-payment-perks.html`
**Perks row script:** `src/scripts/ProductPaymentPerks.js` (island, gated on `product-payment-perks` in `islands/registry.js`)
**Perks row styles:** `src/styles/components/product-payment-perks.css`

Used by `product-section-content.html` (`/`, `/product/`).

---

## Plan cards (`.buy-option-visual--compact`)

Each `label.buy-option-item` wraps a `radio[name="payment-plan"]` and its visual card:

```html
<label class="buy-option-item">
  <input type="radio" name="payment-plan" value="Deposit" checked>
  <div class="product-promo-info buy-option-visual buy-option-visual--compact">
    <div class="product-badges">
      <img class="skip-img-fadein product-payment-plan-badge" src="…" alt="Recommended" …>
    </div>
    <h5>Reserve - $100 today</h5>
    <p>Pay $279 at launch • Save 37%</p>
    <ul class="buy-option-perks">
      <li><img class="skip-img-fadein" src="/images/icons/icon-50-off.webp" alt="$50 off ring" …> $50 off ring</li>
      …
    </ul>
  </div>
</label>
```

- The radio is drawn by `::before` from two images: `icon-radio-input.webp` (off) and `icon-radio-input-active.webp` (checked). It is selected with `input:checked + .buy-option-visual--compact`, so the visual card must directly follow the input.
- The `h5` is grey until its plan is checked, then `--primary-color`.
- Keyboard focus shows an outline on the card (`input:focus-visible + …`).
- `.buy-option-perks` is a wrapping row of icon + short label. Keep labels short; they're `.9rem` on mobile.
- The radio `value` must exactly match `data-variant` in the perks row (see below).

## Perks row (`<product-payment-perks>`)

Load it inside `<product-form>`, after the sticky bar partial:

```html
<load src="/_page-components/components/product-sticky-bar.html" title="VILO Ring" label="Preorder" note="deposit today" />
<load src="/_page-components/components/product-payment-perks.html" />
<load src="/_page-components/components/product-shipping-waves.html" />
```

The partial has one `.product-payment-perks-row` per plan, keyed by `data-variant` (`"Deposit"`, `"Full Payment"`). Each row holds a `ul.product-payment-perks-list`, and each perk is `li.product-payment-perk` with an icon (`2.4rem`) and a `<span>` label.

| What | How |
|------|-----|
| Initial plan | On connect, it reads the checked `input[name="payment-plan"]` in the closest `product-form`. `ProductForm` doesn't emit an event on load. |
| Plan change | Listens for the global `payment-plan:changed` event (`detail.plan`, emitted by `ProductForm`) and toggles `.is-active` on the matching row. |
| Visibility | Inactive rows are `display: none`. |
| Loop | Infinite marquee, no swiping. The script clones the list (`aria-hidden`) until the copies cover the row width plus one extra list, and each copy animates `translateX(-100%)`, so the loop has no seam. Speed is constant (`SPEED` px/s in the script, set as `--perks-loop-duration` on the row). A `ResizeObserver` re-fills the row on resize and font swap. |
| Reduced motion | Under `prefers-reduced-motion`, the animation is off, clones are hidden, and the row scrolls horizontally instead. |

To change the copy, edit both `data-variant` blocks. They're identical today but can diverge per plan.

### Layout note

`.product-wrapper` and `.product-content` have `min-width: 0` (and `.product-content` has `width: 100%`) so the perks row and the Shipping Waves card can't widen the column past the viewport. Keep these if you restyle the product column.

---

## Legacy: `<product-payment-variant-marquee>`

The older version of the perks row: text only, and it auto-scrolls when it overflows. It uses the same `data-variant` / `payment-plan:changed` contract. Its markup is inline (not a partial), and it is still used by:

- `person-pages/product-section-content-vilo-ring.html` (`/vilo-ring/`)
- `earring-product-section-content.html` (`/vilo-earring/`)

Script: `src/scripts/ProductPaymentVariantMarquee.js`. Styles are in `product-section.css`.

When changing perk copy, check which component the page uses. After both pages move to `<product-payment-perks>`, delete the marquee: its JS, its `registry.js` entry, and its CSS.
