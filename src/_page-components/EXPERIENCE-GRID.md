# Experience grid

Six linked image tiles (Deep Sensing, Materials, AI & Personalization, etc.). **Menu and section use separate HTML partials** so content can change independently; styles live in one file.

**Styles:** `src/styles/components/experience-grid.css`

---

## Partials

| Context | File |
|---------|------|
| Menu (Experience dropdown / mobile drawer) | `components/experience-grid-menu.html` |
| Page section | `components/experience-grid-section.html` |

Markup is the same today; edit the partial that matches where the grid is used.

---

## Menu

Loaded from the Experience nav item (desktop dropdown + mobile drawer sub-menu).

| What | File |
|------|------|
| Desktop row | `components/desktop-menu-row-experience.html` |
| Mobile row | `components/mobile-menu-row-experience.html` |
| Grid cells | `components/experience-grid-menu.html` |
| Row visibility | `src/styles/components/desktop-menu.css` |

- **Desktop:** 4 columns (base `.experience-grid` rules).
- **Mobile:** 2 columns via `.second-level-menus` in `experience-grid.css`.

Menu wiring is documented in `MENU.md`.

---

## Section (Why Vilo)

Grid wrapper only — **heading is a separate `heading-section`** on the page, not inside the section partial.

| What | File |
|------|------|
| Grid wrapper | `why-vilo-section.html` (`section.why-vilo`) |
| Grid cells | `components/experience-grid-section.html` |
| Homepage example | `src/index.html` — heading + `<load why-vilo-section.html />` before product section |

**Homepage heading:** left-aligned on mobile via `heading-section--text-left-mobile`; centered from 768px up (default `heading-section` behavior).

Section-specific layout is scoped under `.why-vilo` in `experience-grid.css` (3 columns desktop, custom gaps/padding/typography, `max-width: var(--layout-menubar-max)`).

---

## Accessibility

Each cell is an `<a>` with a visible title. The plus icon wrapper uses `aria-hidden="true"` — decorative only; the link text carries the label.

---

## Heading mobile alignment

Modifiers on `heading-section` (see `heading-section.css`):

| Class | Mobile |
|-------|--------|
| `heading-section--text-left-mobile` | Left |
| `heading-section--text-right-mobile` | Right |
| *(none)* | Center |

Desktop (≥768px) is always centered.
