# Glass Swiper navigation

Frosted circular prev/next controls shared across carousels (gallery, alter-gallery, free-scroll, customer-voice, homepage product, PDP main media).

**Shared styles:** `src/styles/components/base.css` (`.glass-swiper-navigation`, `.glass-swiper-navigation-btn`)

Section layout overrides stay in each section CSS file (gutters, alter-gallery prev placement, PDP show/hide).

---

## Class split

| Role | Classes | Purpose |
|------|---------|---------|
| **Styles** | `.glass-swiper-navigation`, `.glass-swiper-navigation-btn` | Look and shared layout only |
| **JS hooks** | Section-specific `*-button-prev` / `*-button-next` | Swiper `navigation.nextEl` / `prevEl` |

Do **not** use Swiper’s default `.swiper-button-prev` / `.swiper-button-next` on these glass buttons — those styles force absolute positioning and break the flex overlay.

### Markup pattern

```html
<div class="…-slider-viewport"> <!-- position: relative -->
  <div class="swiper …-slider">…</div>
  <div class="glass-swiper-navigation">
    <div class="gallery-swiper-button-prev glass-swiper-navigation-btn">
      <load src="/_icons/icon-prev-slide-arrow-dark.html" />
    </div>
    <div class="gallery-swiper-button-next glass-swiper-navigation-btn">
      <load src="/_icons/icon-next-slide-arrow-dark.html" />
    </div>
  </div>
</div>
```

Wire Swiper to the section-specific button classes (scoped to the section when multiple carousels exist on a page).

---

## JS hooks by section

| Section | Prev / next classes | Script |
|---------|---------------------|--------|
| Gallery (mobile) | `.gallery-swiper-button-prev` / `-next` | `gallery-swiper.js` |
| Alter gallery | `.alter-gallery-swiper-button-prev` / `-next` | `alter-gallery-swiper.js` |
| Free-scroll | `.free-scroll-swiper-button-prev` / `-next` | `free-scroll-swiper.js` |
| Customer voice | `.customer-voice-swiper-button-prev` / `-next` | `customer-voice.js` |
| Homepage product | `.swiper-ps-button-prev` / `-next` | `home-page-product-swiper.js` |
| PDP main media | `.product-main-swiper-button-prev` / `-next` | `ProductMedia.js` |

---

## Sizing and inset

| Breakpoint | Button | Icon width | Nav `padding-inline` |
|------------|--------|------------|----------------------|
| Mobile (default) | `4.8rem` | `2.8rem` | `2.6rem` (on top of any section/container page padding) |
| ≥768px | `6rem` | `2.8rem` | `2rem` |

Disabled state: `.glass-swiper-navigation-btn.swiper-button-disabled` (hidden via opacity/visibility).

---

## Section-specific layout notes

- **Free-scroll / customer-voice (desktop):** nav is pinned to section gutters via `.free-scroll-section .glass-swiper-navigation` / `.customer-voice-section .glass-swiper-navigation` in their CSS files.
- **Alter-gallery:** prev is absolutely placed to the section left; next stays on the carousel (`alter-gallery.css`). Do not put `why-vilo`-style section classes on the nav row.
- **PDP (`product-media`):** `.glass-swiper-navigation` is `display: none` by default; shown from 768px up.
- **Homepage product:** `.product-wrapper-homepage .glass-swiper-navigation` is shown on mobile and desktop; fraction pagination lives in `.swiper-ps-nav-holder` below the carousel.

---

## Adding glass nav to a new carousel

1. Wrap the swiper in a `position: relative` viewport.
2. Add the markup pattern above with **new** section-specific `*-button-prev` / `*-button-next` class names.
3. Point that section’s Swiper `navigation` options at those classes (prefer `querySelector` scoped to the section).
4. Only add CSS in the section file if you need layout overrides — do not re-declare the glass look.
