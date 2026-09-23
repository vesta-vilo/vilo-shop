# Color switch

Homepage section that shows each ring color: two synced image sliders, a line of copy, and a row of color swatches. Clicking a swatch (or swiping an image) moves every slider to that color.

**Partial:** `src/_page-components/color-switch.html`  
**Styles:** `src/styles/components/color-switch.css`  
**Script:** `src/scripts/color-switch.js` (island `color-switch`, gated on `.color-switch` in `src/scripts/islands/registry.js`)  
**Assets:** `public/images/color-related-images/` — `<color>-1.webp` (main), `<color>-2.webp` (secondary)  
**Homepage:** `<load src="/_page-components/color-switch.html" />` in `src/index.html` (after the collage)

---

## Structure

| Block | Class | Slider hook |
|-------|-------|-------------|
| Main image | `.color-switch__media--main` | `.js-color-switch-main-slider` |
| Secondary image | `.color-switch__media--secondary` | `.js-color-switch-secondary-slider` |
| Copy | `.color-switch__copy` | `.js-color-switch-text-slider` |
| Swatches | `.color-switch__nav` → `.color-switch__swatch` | `.js-color-switch-swatch` |

Grid order:

| Mobile | Desktop (≥1024) |
|--------|-----------------|
| secondary → nav (overlaps both images) → main → copy | main (left column, spans all rows); secondary, copy, nav stacked on the right |

The section root uses the 145rem width pattern (see `SECTIONS.md`).

---

## Slides and swatches must line up by index

The script syncs slides **by position**, not by name. Slide *n* in each of the three sliders and swatch *n* must all be the same color. When adding, removing, or reordering a color, change all four lists in the same order:

1. Main slider slide (`<color>-1.webp`)
2. Secondary slider slide (`<color>-2.webp`)
3. Text slider slide
4. Swatch button

The first swatch starts with `is-active` and `aria-pressed="true"`; all others have `aria-pressed="false"`. The script updates both on change.

---

## Swatch gradient colors

Each swatch dot is a three-stop gradient. The colors are set **per swatch in the HTML** with inline custom properties on the `<button>`, not in CSS:

```html
<button type="button" class="color-switch__swatch js-color-switch-swatch"
  style="--swatch-color-1: #484e3e; --swatch-color-2: #727b64; --swatch-color-3: #dadada"
  aria-pressed="false">
  <span class="color-switch__swatch-dot" aria-hidden="true"></span>
  <span class="color-switch__swatch-label">Imperial Jade</span>
</button>
```

`color-switch.css` turns them into the dot background:

```css
background: linear-gradient(to top left, var(--swatch-color-1) 0%, var(--swatch-color-2) 73%, var(--swatch-color-3) 100%);
```

| Property | Gradient stop | Where it shows | Typical value |
|----------|---------------|----------------|---------------|
| `--swatch-color-1` | 0% | Bottom-right (shadow) | Darkest tone of the color |
| `--swatch-color-2` | 73% | Most of the dot | Base color |
| `--swatch-color-3` | 100% | Top-left (highlight) | Lightest tone, near white |

Rules:

- Set **all three** properties on every swatch. There are no fallbacks, so a missing one breaks the gradient.
- Use hex values from the design spec, ordered dark → base → light.
- Keep the gradient direction and stop positions in CSS. Change the colors in HTML only.
- For a flat color, set all three to the same value.

Current values:

| Color | `--swatch-color-1` | `--swatch-color-2` | `--swatch-color-3` |
|-------|--------------------|--------------------|--------------------|
| Golden Twist | `#998e67` | `#bfb07b` | `#f0ecd5` |
| Silver Twist | `#666666` | `#939291` | `#f1f1f1` |
| Imperial Jade | `#484e3e` | `#727b64` | `#dadada` |
| Glass Jade | `#cdcdcd` | `#cfcfcf` | `#f1f1f1` |
| Ivory Jade | `#e7e7e7` | `#f1f1f1` | `#ffffff` |

---

## JS hooks vs style classes

- The script only queries `js-` classes (and `.color-switch` for the section root). Do not style `js-` classes, and do not select `color-switch__*` classes from JS.
- Swatch buttons carry both `color-switch__swatch` (styles) and `js-color-switch-swatch` (script).
- The text slider is detected by `.js-color-switch-text-slider` and gets the vertical slide + fade effect. Touch swiping is turned off for the text slider.

---

## Editing checklist

1. Keep slides and swatches in the same order across all four lists.
2. Set all three `--swatch-color-*` properties on each new swatch.
3. Put new images in `public/images/color-related-images/` as `<color>-1.webp` / `<color>-2.webp`.
4. Use a descriptive `alt` in the form `Vilo ring - <Color name>`.
5. Keep swatch labels short. The active label is capped at `max-width: 12rem`.
