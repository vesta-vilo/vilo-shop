# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

`src/_page-components/MENU.md` documents the site nav specifically: desktop/mobile menus are driven from `desktop-menu.html`, `mobile-menu.html`, and `header-content.html`, with header `data-dropdown-id` / mobile `data-child-links-list-id` needing to match each row's `data-menu-id` / `data-parent-link-id`. The "shop" menu has an active (`-extended`) variant and a legacy variant kept only for reference — check that file before touching menu content.

Shop extended labels in `menu-shop-extended-links.html` use `data-text` on `.shop-extended__menu-text` so CSS can reserve bold-hover width via `attr(data-text)`. **`data-text` must exactly match the text inside that span** — if they diverge, hover weight will shift badges/layout.

### JavaScript

Plain ES modules, no framework or centralized state management. `src/scripts/index.js` is the single entry point imported from `src/index.html` (other pages import their own subset of scripts directly, as needed) and is just a flat list of side-effecting imports — each script self-initializes via `DOMContentLoaded` listeners or immediately-invoked init functions, rather than being called from a central orchestrator.

Two initialization patterns are used throughout `src/scripts/`:
- **Custom elements** (`customElements.define(...)`) for components with lifecycle needs — e.g. `AnnouncementBar.js`, `DesktopMenu.js`, `MobileMenu.js`, `ModalDialog.js`, `ProductMedia.js`. These hook `connectedCallback`/`disconnectedCallback`.
- **Plain query-and-bind functions** run on `DOMContentLoaded` for simpler behavior (parallax, swipers, fade-in-on-scroll in `script.js`, event tracking).

Swiper (`swiper` npm package) powers the various carousels/sliders (galleries, product media, menus); GSAP (`gsap`) powers scroll/parallax animation. `EventTracking.js` wires up Facebook Pixel tracking generically via a `data-fb-event="EventName"` attribute on any clickable element — prefer adding that attribute over writing bespoke tracking code.

### Styles

Plain CSS, no preprocessor. `src/styles/index.css` is the entry point pulling in `reset.css`, `variables.css`, `fonts.css`, `flex.css`, and everything under `src/styles/components/` — one file per component/section, generally mirroring the `_page-components` partial it styles.

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
