# Multiple image display

Freeform collage of nine overlapping photos (five lifestyle shots + four ring close-ups) around a centered heading, "Made for a colorful life". Design: Sketch "Multiple Image Display_0928" (1875 desktop artboard with a 1450 content frame / 414 mobile artboard).

**Partial:** `src/_page-components/multiple-image-display.html`  
**Styles:** `src/styles/components/multiple-image-display.css`  
**Script:** none  
**Assets:** `public/images/sections/multiple-image-display/*.webp` — each photo is cropped to its Sketch mask and exported at 2× the desktop tile size  
**Demo:** `<load src="/_page-components/multiple-image-display.html" />` in `src/page/demo/index.html`

---

## Layout: single-area grid stack

The section root is the grid. It has one area (`grid-template-areas: "stack"`), and the heading and every `<img>` use `grid-area: stack`, so they all sit in the same cell. Each item is placed with three custom properties set per modifier class:

| Property | Applied as | Meaning |
|----------|-----------|---------|
| `--x` | `margin-inline-start` | Left offset, % of section width |
| `--y` | `margin-block-start` | Top offset, **also % of section width** |
| `--w` | `width` | Tile width, % of section width (height comes from the `width`/`height` attributes) |

Percentage margins on grid items resolve against the grid area's **inline** size, even vertical ones. That means the whole composition scales with the section width, and the grid row grows to fit the lowest item, so you don't need a fixed `aspect-ratio` or absolute positioning. The heading font size uses `cqi` (the section is an `inline-size` container), so the text scales at the same rate as the photos.

To get a value from Sketch, take the tile's offset from the content frame and divide by the frame width: 1450 for desktop, 414 for mobile. For example, `x = 553 → 553 / 1450 = 38.138%`.

**Tiles are numbered, not named**, so a photo can be swapped without renaming its class. Lifestyle photos are `--1` … `--5`; each ring close-up takes the number of the lifestyle photo it sits next to, plus `-small` (`--1-small`, `--2-small`, `--4-small`, `--5-small`). Photo 3 has no close-up.

**Paint order = DOM order.** Lifestyle photos come first and ring close-ups (`--N-small`, plus `--ring`, which add the soft shadow) come last, so the close-ups overlap on top. The heading comes first in the DOM for document outline; it doesn't overlap any tile.

---

## Breakpoints

| Range | Layout | Width |
|-------|--------|-------|
| < 768px | Mobile positions (414 artboard); tiles bleed past the viewport edges, clipped by `overflow-x: clip` | `100%` (full-bleed, intentionally not the 145rem gutter pattern) |
| ≥ 768px | Desktop positions (1450 artboard) | `calc(100% - 2 * --page-padding-inline)`, max 145rem |
| ≥ 1024px | Same | `calc(100% - 2 * --layout-gutter-desktop)`; radius 30px (20px below) |

Vertical padding: 120px mobile / 160px from 768px. As the last child of `<main>`, the section picks up the global 18rem bottom padding from `base.css`.

---

## Editing

- **Swap a photo:** change only the `src`/`alt` — the `--N` class stays with the slot. Keep the same aspect ratio (or update the `width`/`height` attributes), and export at 2× the desktop tile size as WebP.
- **Move a tile:** change only its `--x` / `--y` / `--w`, in the mobile block and/or the `min-width: 768px` block.
- **Add a tile:** add an `<img class="multiple-image-display__item multiple-image-display__item--6">` (next free number; for a ring close-up next to photo N, use `--N-small` plus `--ring`) and give it its own `--x` / `--y` / `--w` rules for both breakpoints. Without them it falls back to the top-left corner.
