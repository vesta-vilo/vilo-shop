# Menu editing guide

Menus are loaded site-wide from two entry files. Edit content in the component files below — not in individual pages.

## Entry points

| Area | File |
|------|------|
| Desktop dropdown | `src/_page-components/desktop-menu.html` |
| Mobile drawer | `src/_page-components/mobile-menu.html` |
| Header nav labels & links | `src/_page-components/header-content.html` |

Header `data-dropdown-id` (desktop) and mobile `data-child-links-list-id` must match each row’s `data-menu-id` / `data-parent-link-id` (`experience`, `shop`).

---

## Why Vilo (Experience)

| What | File |
|------|------|
| Desktop layout & hero image | `components/desktop-menu-row-experience.html` |
| Desktop link columns | `components/menu-experience-links-col-1.html`, `menu-experience-links-col-2.html` |
| Mobile sub-menu | `components/mobile-menu-row-experience.html` |
| Styles | `src/styles/components/desktop-menu.css` |

---

## Shop (extended — active)

| What | File |
|------|------|
| Desktop cards, promos & layout | `components/desktop-menu-row-shop-extended.html` |
| Mobile carousel cards & promos | `components/mobile-menu-row-shop-extended.html` |
| Product links (shared desktop + mobile) | `components/menu-shop-extended-links.html` |
| Mobile carousel behavior | `src/scripts/mobile-shop-menu-swiper.js` |
| Styles | `desktop-menu.css` (desktop), `mobile-menu-shop.css` (mobile) |

**Tip:** Edit product links once in `menu-shop-extended-links.html`. Showcase cards and promos are duplicated in the desktop and mobile row files — update both when changing cards or promo copy.

---

## Legacy (not loaded)

These are kept for reference; they are not included in `desktop-menu.html` or `mobile-menu.html`:

- `components/desktop-menu-row-shop.html`
- `components/mobile-menu-row-shop.html`
- `components/menu-shop-links.html`

To use the simple shop layout instead, swap the `-shop-extended` loads in both entry files for these legacy files.
