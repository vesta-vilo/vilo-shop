# Product sticky bar

Compact buy bar (title, price, button) shown on product pages after the user scrolls past the main buy button.

**Partial:** `src/_page-components/components/product-sticky-bar.html`
**Script:** `src/scripts/ProductStickyBar.js` (island, gated on `product-sticky-bar` in `islands/registry.js`)
**Styles:** `src/styles/components/product-sticky-bar.css`

---

## Adding it to a product form

Load the partial **inside `<product-form>`, right after the `.js-preorder-button`**:

```html
<product-form data-product-handle="vilo-smart-ring">
  …
  <button class="preorder-button js-preorder-button" data-fb-event="InitiateCheckout">
    <span>Pre-Order Now</span>
    <load src="/_icons/icon-animation-arrow.html" />
  </button>
  <load src="/_page-components/components/product-sticky-bar.html" title="VILO Ring" label="Preorder" note="deposit today" />
  …
</product-form>
```

| Arg | Required | Use |
|-----|----------|-----|
| `title` | yes | Product name shown in the bar (usually matches `.product-title`) |
| `label` | yes | Bar button text (e.g. `Preorder`, `Shop Now`) |
| `note` | yes (may be `""`) | Small text next to the price (e.g. `deposit today`). Stacked under the price on mobile, same row on desktop; hidden when empty. Shown only while the `Deposit` payment plan is selected — see *Note text* below. |

Always pass all three — `vite-plugin-html-inject` leaves unknown `{=$arg}` placeholders as literal text.

No JS or CSS changes are needed: the island loads automatically when the element is on the page.

### Requirements

- The form must contain a `.js-preorder-button`. Without it the bar never activates (e.g. the earring form has none, so it has no bar).
- One bar per form. It finds its button via `closest("product-form")`.

---

## Behavior

| What | How |
|------|-----|
| Price | `<span data-original-price>` in the partial — `ProductForm` updates every `[data-original-price]` on the page, so no extra wiring. Starts empty until the Shopify price loads. |
| Note text | `note` (stored in `data-deposit-note`) while the form's checked `payment-plan` radio is `Deposit` — or when the form has no payment plan at all. With any other plan (e.g. `Full Payment`) it shows the compare-at price read from the main `.product-price [data-compare-price]`, struck through via `.product-sticky-bar__note--compare` (the script finds the span by `.js-product-sticky-bar-note`). Falls back to `note` when there is no compare price. Re-rendered on the global `payment-plan:changed` event (emitted by `ProductForm`) and on a MutationObserver over the compare element, which `ProductForm` fills after the Shopify fetch without an event of its own. |
| Click | Forwarded to the form's `.js-preorder-button` (`.click()`), so checkout stays in `ProductForm`. |
| Disabled state | Mirrors the main button's `disabled` attribute (MutationObserver). |
| Tracking | Bar button has **no** `data-fb-event` — the forwarded click already fires the main button's `InitiateCheckout`. Adding it would double-count. |

## Visibility rules

- `.is-active` is toggled by an IntersectionObserver when the main buy button has scrolled **off the top** of the viewport.
- **Mobile (< 768px):** fixed at the bottom whenever `.is-active`.
- **Desktop (≥ 768px):** fixed at the top, only while the main nav is hidden — CSS gate `body.header-is-sticky:has(header.header--hidden)` (class set by `header-logic.js`). Under `prefers-reduced-motion` the header never hides, so the desktop bar never shows.
- Hidden while the desktop menu (`body.dm-open`) or a modal (`body.modal-open`) is open.
- Hides the homepage `.floating-cta-wrapper` while active so they don't stack.

## Stacking caveat

The bar is `position: fixed` but lives inside `.product-content` (`position: relative; z-index: 20`), so:

- It can never stack above `z-index: 20` — a later section with a higher `z-index` will cover it.
- A `transform`, `filter`, `backdrop-filter`, `will-change`, or `contain` on any ancestor makes it fixed to that ancestor instead of the viewport.
