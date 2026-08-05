# Collage

Two editorial image + copy rows used on the homepage. No JS — layout and stacking are CSS only.

**Partial:** `src/_page-components/collage.html`  
**Styles:** `src/styles/components/collage.css`  
**Assets:** `public/images/sections/collage/`  
**Homepage:** `<load src="/_page-components/collage.html" />` in `src/index.html` (after the gallery section)

---

## Structure

| Row | Desktop | Mobile |
|-----|---------|--------|
| 1 — `.collage__row--media-left` | Stacked media left, text right | Media above, text below |
| 2 — `.collage__row--media-right` | Text left, cover media right | Media above, text below |

Each text block is a **subheading** (`.collage__subheading`) + **description** (`.collage__description`). There is no section heading inside the partial.

---

## Media

### Row 1 — stacked (`.collage__media--stack`)

Two overlapping 1:1 images inside a 1:1 media block. Each image is **75%** of the block:

| Layer | Class | Position |
|-------|-------|----------|
| Back | `.collage__media-img--back` | Top-left |
| Front | `.collage__media-img--front` | Bottom-right |

Desktop media size: `width` / `max-width: 71rem` (710px). First-row text has `padding-top: 13rem`.

### Row 2 — cover (`.collage__media--cover`)

Single image, full cover of a 1:1 media block. Desktop: `width` / `max-width: 94.5rem` (945px). Text column: `max-width: 34rem` (340px), left-aligned via `justify-content: space-between` on the row.

---

## Layout tokens

Section root uses the **145rem width pattern**:

```css
.collage {
  width: calc(100% - 2 * var(--page-padding-inline));
  max-width: 145rem;
  margin-inline: auto;
}

@media (min-width: 1024px) {
  .collage {
    width: calc(100% - 2 * var(--layout-gutter-desktop));
  }
}
```

| Token | Mobile | Desktop (≥1024) | ≥1450 |
|-------|--------|-----------------|-------|
| Gap between rows | `5rem` (50px) | `8rem` (80px) | same |
| Gap media ↔ text | `3rem` (30px) | `5rem` (50px) | `13rem` (130px) |
| Image border-radius | `2rem` (20px) | `3rem` (30px) | — |

Desktop rows use `align-items: flex-start` so copy sits at the top of the media.

---

## Typography

| Element | Mobile | Desktop |
|---------|--------|---------|
| Subheading | Geograph 2.6 / 4.9rem, `#3F4142`, max-width 48rem | 4.8 / 5.6rem |
| Description | Geograph 1.5 / 2.1rem, `#3F4142` | 1.8 / 2.8rem, max-width 42.6rem |

Color token: `var(--text-color-tertiary)`. Font: `var(--primary-font)`.

---

## Editing checklist

1. Swap image `src`s under `/images/sections/collage/` (keep stack = two images, cover = one).
2. Keep stack images at 75% / corner positions unless design changes.
3. Preserve the 145rem section width pattern — do not add `padding-inline` on the same element as the width `calc`.
4. Descriptive `alt` on all images (not empty).
