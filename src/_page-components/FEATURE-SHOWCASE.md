# Feature showcase

App feature section: heading, a row of pill tabs, and one slider per tab. Clicking a pill swaps the visible slider. Design: Sketch "App Feature Showcase" (1875 desktop / 375 mobile artboards).

**Partial:** `src/_page-components/feature-showcase.html`  
**Styles:** `src/styles/components/feature-showcase.css`  
**Script:** `src/scripts/feature-showcase.js` (island `feature-showcase`, gated on `.feature-showcase` in `src/scripts/islands/registry.js`)  
**Assets:** `public/images/sections/feature-showcase/` — `icons/` (tab icons, `*.png`), `media/` (cover + card images, `*.webp`)  
**Demo:** `<load src="/_page-components/feature-showcase.html" />` in `src/page/demo/index.html`

---

## Structure

| Block | Class | Notes |
|-------|-------|-------|
| Heading | `.feature-showcase-headings` (`.title`, `.subtitle`) | Centered |
| Tabs | `.feature-showcase-tabs` → `.feature-showcase-tab` | `role="tablist"` / `role="tab"`; active pill has `.is-active` + `aria-selected="true"` |
| Panels | `.feature-showcase-panel` | One per tab, `role="tabpanel"`; inactive panels have `hidden` |
| Slider | `.feature-showcase-slider` → `.feature-showcase-slide` | Swiper, one instance per panel |
| Cover | `.feature-showcase-slide--cover` | First slide, full card height |
| Nav | `.feature-showcase-swiper-button-prev` / `-next` | Glass nav pattern (see `GLASS-SWIPER-NAV.md`) |

Each tab's `aria-controls` must match its panel `id` (`feature-showcase-tab-<name>` ↔ `feature-showcase-panel-<name>`). The script finds panels through `aria-controls`.

The section root uses the 145rem width pattern (see `SECTIONS.md`). It sets `display: block` to override the global `section { display: flex }` in `base.css`.

---

## Layout

| | Mobile (default) | Desktop (≥768) |
|---|---|---|
| Tabs | 44px pills, wrap, left-aligned | 54px pills, centered |
| Subtitle | `padding: 1.65rem 0.4rem` (77px box in design) | no padding |
| Cover slide | hidden | 32.8rem wide, stretches to the tallest card |
| Cards | 1.2 per view, 16px gap | 30rem wide (`slidesPerView: 'auto'`), 20px gap |
| Nav position | centered on the card image (`100cqw`-based `top`) | `top: 15rem` (half the 30rem image) |

The slider settings mirror `alter-gallery-swiper.js`: no loop. The difference is that the large image is the first slide, so it swipes off with the cards instead of staying fixed.

---

## Tab icons

Each pill shows two `<img>`s and CSS shows one at a time:

- `.feature-showcase-tab-icon--default`: dark icon, inactive (outlined) pill
- `.feature-showcase-tab-icon--active`: white icon, active (dark blue) pill

File names are not consistent: for sleep, heart, energy and temperature, `<name>.png` is white and `<name>-active.png` is dark. For **cycle** it is the other way round. Pick files by color, not by name.

---

## Switching behavior

- Each panel's Swiper is created the first time its panel is shown (Swiper can't measure inside `display: none`), then `update()` runs on every show.
- Each tab keeps its slide position between switches (no reset).
- The incoming slider fades in (0.4s keyframe on `.feature-showcase-panel.is-active .feature-showcase-slider`). The animation restarts because the panel goes from `display: none` to shown. Disabled under `prefers-reduced-motion`.
- The fade is on the slider, **not the panel**: opacity on an ancestor breaks the glass buttons' `backdrop-filter` while it animates.
- Nav is `visibility: hidden` until Swiper adds `.swiper-initialized`, so the prev arrow doesn't flash before its disabled state is set.
- Arrow keys / Home / End move between tabs.

---

## Swiper CSS specificity

`swiper/css` is imported by the island and loads **after** `index.css`, so equal-specificity rules lose to it (`.swiper-slide { display: block; width: 100%; height: 100% }`). Slide rules that override Swiper are scoped under the section instead of using `!important`:

- `.feature-showcase .feature-showcase-slide { width: 30rem }`
- `.feature-showcase .feature-showcase-slide--cover { display: none }` (mobile) / `{ display: block; width: 32.8rem; height: auto }` (desktop)

The cover rule must come after the card rule (same specificity). Swiper skips `display: none` slides when building snap points, which is how the cover is dropped on mobile. At ≥768 Swiper clears its own inline slide widths because a breakpoint sets `slidesPerView: 'auto'`.

---

## Content

Per tab: the cover image plus the same 4 cards in a different order (so the switch is visible). To change content, edit the slides in each panel. Keep the `swiper-slide` class on every slide and `--cover` on the first.
