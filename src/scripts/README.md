# Scripts

Client-side JavaScript for the site — plain ES modules, no framework.

Entry point is [`index.js`](index.js), which loads [`core.js`](core.js) (site chrome on every page) and [`islands/boot.js`](islands/boot.js) (lazy-loads page-specific modules whose selector matches the current page). For the islands architecture, the custom-element vs. plain-function patterns, and how to register a new island, see [CLAUDE.md](../../CLAUDE.md).

This file documents behavior that is easy to get wrong from the markup side.

## Product forms (Shopify pricing and checkout)

Product pages have no backend. Prices, availability, and the buy button are resolved in the browser by the `<product-form>` custom element ([`ProductForm.js`](ProductForm.js)), which talks to Shopify directly.

**1. Markup declares the product and its options**

```html
<product-form data-product-handle="vilo-smart-ring">
  <fieldset data-option-name="color">
    <input type="radio" name="color-variant" value="Glass Jade" checked>
    ...
```

`data-product-handle` must match the product's **handle** in Shopify — the slug in the product URL (`/products/vilo-smart-ring`), not the product title. Each radio `value` must match a Shopify **option value** character for character.

A wrong handle means no price and a disabled buy button. `fetchByHandle` resolves to `null` rather than throwing, so the network request itself looks fine; the console carries a `ProductForm: no Shopify product found for handle "..."` error instead.

**2. Collecting the selection**

On load and on every `change`, the form reads *every* checked radio inside itself:

```js
this.querySelectorAll('input[type="radio"]:checked')
```

It collects inputs, not fieldsets, so one option can be split across several fieldsets for layout reasons as long as the radios share a `name`. The ring PDP does this — its colors live in two fieldsets ("The Jade." / "The Twist.") that are one radio group.

**3. Fetching the product**

The Shopify Buy SDK is loaded by a `<script id="shopify-sdk-script">` tag in each product page's `index.html`, which fires a `shopify-sdk-loaded` event. The form waits for that event (or starts immediately if the SDK is already there), then fetches the whole product once:

```js
shopifyClient.product.fetchByHandle(handle)
```

There is one request per page load. Switching options never refetches — all variants are already in memory.

**4. Matching a variant**

The first variant whose options contain *all* the selected values wins. Matching is by **value only** — the option name is not checked — so two options sharing a value would match ambiguously.

**5. Updating the layout**

The matched variant drives, across the whole page (not just inside the form):

| Target | Updated with |
|--------|--------------|
| `[data-original-price]` | variant price |
| `[data-compare-price]` | compare-at price, hidden when absent |
| `.js-product-installment-price` | price ÷ 4 |
| `[data-deposit-label]` | shown only when `Deposit` is selected |
| `.js-preorder-button` | enabled/disabled from `variant.available` |

The button starts **disabled** and is only enabled once a variant matches. Clicking it redirects to `https://<shop>/cart/<variantId>:1` with UTM parameters — there is no cart page on this site.

The form also dispatches `variant:changed`, which `ProductMedia` listens for to swap the gallery images (see [CLAUDE.md](../../CLAUDE.md)).

**Gotchas**

> **Every radio group needs a `checked` default.** A group with nothing checked contributes no value, so the match is under-constrained and silently resolves to whichever variant comes first — possibly the wrong price, and the wrong variant id at checkout.

> **Values must match Shopify exactly.** A typo or a renamed option value in Shopify means no variant matches, and the page shows no price with the buy button left disabled. When that happens the console carries a `ProductForm: no matching variant` warning listing what was selected, what Shopify returned, and which values were unknown — check there first.
