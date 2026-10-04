# Shipping Waves

A static rollout card shown under the buy button: a header (icon, title, subtitle), four wave cards, and an info note.

**Partial:** `src/_page-components/components/product-shipping-waves.html`
**Styles:** `src/styles/components/product-shipping-waves.css`
**Script:** none

Used by `product-section-content.html` (`/`, `/product/`).

---

## Placement

Load it inside `<product-form>`, after the perks row:

```html
<load src="/_page-components/components/product-payment-perks.html" />
<load src="/_page-components/components/product-shipping-waves.html" />
```

The partial has no args. To change the copy, edit the partial.

## Editing waves

- **Current wave:** add `.is-current` to its `li.shipping-waves__wave` (blue border and tint). Move the `badge-earliest.webp` badge (`.shipping-waves__badge`, absolutely positioned top-left) along with it if it should follow.
- **Card rows:** each wave has three rows: `.shipping-waves__wave-title`, `.shipping-waves__wave-batch`, `.shipping-waves__wave-date`. The list is a 4-column grid and each card uses `grid-template-rows: subgrid`, so the rows line up across cards. Because of this, the short divider above each date stays on one line even when a card's text wraps. Keep all three elements in every card.
- **Line breaks:** the dates use `<br>` and the batch text uses literal non-breaking hyphens (`‑`, U+2011 — looks like `-` in the editor) to control wrapping in the narrow mobile cards. Check both widths after editing.
- **Number of waves:** the grid is `repeat(4, …)`. To add or remove a wave, change the column count too.

## Last card (arrow tip)

`.shipping-waves__wave--next` is drawn as an arrow. Its body is a `::before` box with left radii and no right border. The tip is a separate fixed-width inline SVG (`--shipping-waves-tip-width`), so its corners don't stretch with the card width.

- There are two SVGs with different proportions: `--mobile` (`2.6rem` wide) and `--desktop` (`3.1rem`, from 768px). CSS shows one at a time.
- Each SVG has a `-fill` path (card background) and a `-stroke` path (`vector-effect: non-scaling-stroke`, so the border stays 1px after scaling).
- If you change the card height or background, update the tip's `fill` or `viewBox` to match. If you change the tip width, update `--shipping-waves-tip-width` in both breakpoints.

## Assets

- `/images/icons/icon-shipping.webp` (header icon, decorative `alt=""`)
- `/images/badges/badge-earliest.webp` (current-wave badge)
- `/images/icons/icon-info.png` (note icon, decorative)
