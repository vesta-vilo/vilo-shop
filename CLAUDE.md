# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cursor-specific rule files mirroring this guidance live in **`.cursor/rules/`** (`vilo-core.mdc`, `html-partials.mdc`, `section-layout.mdc`, `javascript.mdc`, `product-pages.mdc`, `menu.mdc`, `html-formatting.mdc`).

## Commands

Package manager is pnpm (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`; CI installs with `pnpm install --frozen-lockfile`).

- `pnpm dev` — start the Vite dev server
- `pnpm build` — build to `dist/`
- `pnpm preview` — preview the production build
- `pnpm deploy` — build and publish `dist/` to GitHub Pages via `gh-pages`

There is no test suite, linter, or type checker configured in this repo.

## Architecture

Vilo is a static marketing site (product landing pages, blog, FAQ, team bios) built with **Vite in multi-page mode** — there is no client-side framework or router. Every route is a physical `index.html` file under `src/`, and Vite discovers them automatically.

### Page discovery and routing

`vite.config.js` walks `src/` recursively at config-load time (`getHtmlEntries`) and registers every `index.html` it finds as a Rollup build input, skipping `_page-components` and other ignored dirs. This means **adding a new page is just adding a new `src/<route>/index.html` file** — no manual registration needed. A dev-server middleware in the same config 301-redirects extensionless URLs to their `/index.html`-backed directory form.

### HTML partials (`<load src="...">`)

Shared markup is not templated via JS includes but via `vite-plugin-html-inject`, which processes a custom `<load src="/path/to/partial.html" />` tag at build time and inlines the referenced file's contents. Partials live in `src/_page-components/` (page sections: menus, footer, FAQ, product content, person-page bios) and `src/_icons/` (inline SVG icon fragments). Pages compose themselves almost entirely out of these `<load>` tags plus page-specific markup — read a page's `index.html` top-to-bottom to see which partials it pulls in.

Some reusable components have their own guides under `src/_page-components/` — check these before editing:

| Doc | Scope |
|-----|--------|
| `SECTIONS.md` | Section layout (145rem max width, gutters) + index of section guides |
| `MENU.md` | Site nav (desktop/mobile entry files, shop menu, Experience menu rows) |
| `EXPERIENCE-GRID.md` | Why Vilo image-tile grid (menu + page section partials, styles, accessibility) |
| `COLLAGE.md` | Homepage collage (two media + copy rows; stack + cover layouts) |
| `GLASS-SWIPER-NAV.md` | Shared frosted carousel prev/next (style classes vs section JS hooks) |
| `FAQ.md` | FAQ tabs, active PNG background, accordion plus/minus icons |

**Menu:** desktop/mobile menus are driven from `desktop-menu.html`, `mobile-menu.html`, and `header-content.html`, with header `data-dropdown-id` / mobile `data-child-links-list-id` needing to match each row's `data-menu-id` / `data-parent-link-id`. The "shop" menu has an active (`-extended`) variant and a legacy variant kept only for reference — see `MENU.md` before touching menu content.

**Experience grid (Why Vilo):** six linked image tiles used in the Experience menu and as a page section. Menu and section have **separate partials** (`components/experience-grid-menu.html`, `components/experience-grid-section.html`) in `_page-components/components/` so content can diverge; styles are shared in `experience-grid.css`. Menu mobile layout is scoped via `.second-level-menus`; section-only layout via `section.why-vilo` (do not put `why-vilo` on menu rows). Menu row visibility: `desktop-menu.css`. Full details: `EXPERIENCE-GRID.md`. Homepage: separate `heading-section` above `<load src="/_page-components/why-vilo-section.html" />` — heading is not inside the section partial.

**Collage:** two homepage rows of lifestyle media + copy (`collage.html` / `collage.css`). Row 1 stacks two 75% images in a 1:1 block (media left); row 2 is a single cover image (media right). Mobile stacks media above text. Uses the 145rem section width pattern. Full details: `COLLAGE.md`.
**Glass Swiper navigation:** frosted circular prev/next shared across carousels. Styles use `.glass-swiper-navigation` / `.glass-swiper-navigation-btn` in `base.css`; each section keeps its own `*-button-prev` / `*-button-next` for JS. Do not use Swiper’s default `.swiper-button-prev` / `.swiper-button-next` on these controls. Full details: `GLASS-SWIPER-NAV.md`.

Shop extended labels in `menu-shop-extended-links.html` use `data-text` on `.shop-extended__menu-text` so CSS can reserve bold-hover width via `attr(data-text)`. **`data-text` must exactly match the text inside that span** — if they diverge, hover weight will shift badges/layout.

### JavaScript

Plain ES modules, no framework or centralized state management.

**Entry:** `src/scripts/index.js` imports `core.js` (always loaded) and `islands/boot.js` (lazy-loads page-specific modules). All pages still reference `index.js`; no per-page script entry files needed.

**Islands architecture** (`src/scripts/islands/`):

- `core.js` — site chrome on every page: fade-in (`script.js`), tracking, header scroll behavior, mobile/desktop menus, announcement bar.
- `registry.js` — maps a DOM selector to a dynamic `import()`. Vite emits one chunk per island; only islands whose selector matches the current page are downloaded.
- `boot.js` — on `DOMContentLoaded`, scans the registry and loads matching islands in parallel.
- `on-ready.js` — `onReady(fn)` helper for island modules that may load after `DOMContentLoaded` (use instead of a raw `DOMContentLoaded` listener).

To add a new island: create the script module (if new), add an entry to `registry.js` with the selector that gates loading, and use `onReady` for any init that queries the DOM.

Two initialization patterns are used throughout `src/scripts/`:
- **Custom elements** (`customElements.define(...)`) for components with lifecycle needs — e.g. `AnnouncementBar.js`, `DesktopMenu.js`, `MobileMenu.js`, `ModalDialog.js`, `ProductMedia.js`. These hook `connectedCallback`/`disconnectedCallback`.
- **Plain query-and-bind functions** for simpler behavior (parallax, swipers, fade-in-on-scroll in `script.js`, event tracking). Island-bound scripts should wrap init in `onReady` from `islands/on-ready.js`.

Swiper (`swiper` npm package) powers the various carousels/sliders (galleries, product media, menus); GSAP (`gsap`) powers scroll/parallax animation. Overlay prev/next on most carousels use the shared glass nav pattern — see `GLASS-SWIPER-NAV.md`. `EventTracking.js` wires up Facebook Pixel tracking generically via a `data-fb-event="EventName"` attribute on any clickable element — prefer adding that attribute over writing bespoke tracking code.

**Mobile menu:** `MobileMenu.js` uses shadow DOM; drawer/overlay styles are in `MobileMenu.styles.js` (not `header.css`). Overlay color/blur reads `--backdrop-color-rgb`, `--backdrop-opacity`, and `--backdrop-blur` from `variables.css`. The announcement bar is not rendered inside the mobile drawer.

### Product pages (`product-media`, variant media JSON)

PDP galleries use the `ProductMedia` custom element (`ProductMedia.js`) — main fade swiper, thumb strip, pagination, and a desktop-only `.product-media-video` block (image in markup; styled in `product-section.css`).

Each PDP ends with a JSON script tag (kept at the bottom of `<body>` so it does not block render):

```html
<script type="application/json" data-product-variant-media>{ ... }</script>
```

Parsed by `media-utils.js`; consumed by `ProductMedia` on `variant:changed` (`detail.variant`), which `ProductForm` emits on color swatch change and once on connect (checked color, or `data-default-variant` when there is no color picker).

**Schema per variant key** (key = color radio `value`, or a single key like `"Default"` when there is no color picker):

```json
"Glass Jade": {
  "images": ["...", "..."],
  "video": { "src": "...", "alt": "VILO Ring - Glass Jade" }
}
```

- `images` — 7–9 gallery URLs (markup has 9 slides; slides 7–9 usually duplicate 4–6). Updates main + thumb swipers on variant change.
- `video` — updates `.product-media-video img` (`src` + `alt`). `video` may be a src string; if omitted, the first gallery image is used.
- Legacy array-only values (`"Glass Jade": ["url", ...]`) still work.

When editing the default variant, also update the visible gallery `<img>` srcs, `.product-media-video` defaults, and `<link rel="preload">` entries in `<head>`.

### Styles

Plain CSS, no preprocessor. `src/styles/index.css` is the entry point pulling in `reset.css`, `variables.css`, `fonts.css`, `flex.css`, and everything under `src/styles/components/` — one file per component/section, generally mirroring the `_page-components` partial it styles.

**Design units:** specs are usually in px; in CSS use `rem` with **1rem = 10px** (e.g. 18px → `1.8rem`, 1450px → `145rem`). Shared layout tokens live in `variables.css` — e.g. `--page-padding-inline`, `--layout-menubar-max` (1450px), `--layout-product-section-max`.

**Heading sections:** optional mobile text alignment via `heading-section--text-left-mobile` or `heading-section--text-right-mobile` on `heading-section` (centered again from 768px up); see `heading-section.css`.

#### Section layout baseline

Apply horizontal sizing on the **section root** (not inner rows/containers). This keeps side gutters on narrow viewports and caps content at **145rem** (`--layout-menubar-max`) on wide screens — no extra `padding-inline` needed when using the width `calc`.

**Mobile (default):**

```css
.my-section {
  width: calc(100% - 2 * var(--page-padding-inline));
  max-width: 145rem;
  margin-inline: auto;
}
```

**Desktop (`min-width: 1024px`):**

```css
@media (min-width: 1024px) {
  .my-section {
    width: calc(100% - 2 * var(--layout-gutter-desktop));
  }
}
```

Reference: `src/styles/components/media-icons.css`, `src/_page-components/SECTIONS.md`.

### Assets

Static assets referenced with root-relative paths (e.g. `/images/...`) live in `public/` (served as-is by Vite, copied verbatim into `dist/`). Font files and a few build-processed assets live under `src/assets/`.

### Deployment

`.github/workflows/ci.yml` builds on push to `main` and deploys `dist/` to GitHub Pages (custom domain via `CNAME`). `pnpm deploy` is the manual equivalent for local use.

### Git workflow

Branches are named `vilo-<ticket-number>` (or `fix/vilo-<ticket-number>`) against a Linear/Jira-style issue tracker; `staging` and `main` are the long-lived integration/production branches.

- New work branches off of `main`.
- Open a PR into `staging` first. Merging it deploys to the staging store for preview/approval.
- Once approved on staging, `staging` is merged into `main` — by that point the PR should be ready as-is (final gate, not a place to make further changes).
- `staging` is not guaranteed to be in sync with `main` — it can drift ahead or behind, so don't assume `staging` reflects the latest `main`, or vice versa. Diff against the branch you actually care about rather than assuming equivalence.
