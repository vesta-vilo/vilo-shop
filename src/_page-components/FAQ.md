# FAQ

Tabbed FAQ blocks and accordion items used on product/support pages.

**Styles:** `src/styles/components/faq.css`  
**Tabs JS:** `src/scripts/Faq.js` (`<faq-tabs>` custom element)

---

## Partials

| File | Typical use |
|------|-------------|
| `faq.html` | Shorter FAQ sets |
| `faq-page.html` | Full product FAQ (many tabs) |
| `faq-returns.html`, `faq-exchanges.html`, `faq-contact-us.html`, `faq-size-guide.html`, `faq-care-guide.html` | Page-specific FAQ content |

---

## Tabs (`.faq-nav` / `.tab-btn`)

Buttons live in `.faq-nav` inside `<faq-tabs>`. `Faq.js` toggles `.active` on the matching `.tab-btn` and `.tab-content`.

| Token / rule | Value |
|--------------|-------|
| Height | `4.4rem` |
| Gap | `1.2rem` |
| Padding | `0.8rem 1.5rem` |
| Radius (inactive) | `--border-radius-12` (`1.2rem`) |
| Font | `1.4rem` mobile → `1.8rem` from 768px |

### Active background

Active state uses a stretched PNG via `::before` (opacity crossfade), not a solid fill:

- Asset: `/images/icons/faq-tab-active-bg.png` (`public/images/icons/`)
- `background-size: 100% 100%` — width squashes/stretches with the label; height fills the button (plus `2px` / `0.2rem` below via `inset: 0 0 -0.2rem`)
- Inactive: tertiary fill + radius; active: transparent fill, `border-radius: 0` so the PNG shape shows

Do not rely on SVG `preserveAspectRatio` for this — the PNG is the source of truth.

---

## Accordion icons (`.faq-icon`)

Markup stays empty: `<span class="faq-icon"></span>` inside each `<details class="faq-item">` summary.

| State | Asset |
|-------|-------|
| Closed | `/images/icons/icon-faq-plus.png` (`::before`) |
| Open (`[open]`) | `/images/icons/icon-faq-minus.png` (`::after`) |

Swap is an opacity crossfade (`0.3s`). Icon size: `1.4rem` mobile → `2.2rem` from 768px.

---

## Editing checklist

- Tab labels: keep button order aligned with `.tab-content` order (`Faq.js` uses index).
- Replacing the active tab art: update `faq-tab-active-bg.png` only; keep CSS stretch rules.
- Replacing plus/minus: swap the PNGs; no HTML change needed.
