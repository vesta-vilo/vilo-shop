# Video section

Homepage heading + looping muted video that grows to full viewport width as you scroll, with a play/pause toggle.

**Partial:** `src/_page-components/video-section.html`  
**Styles:** `src/styles/components/video-section.css`  
**Script (island):** `src/scripts/video-section.js` — registered in `islands/registry.js` with selector `.video-section`  
**Assets:** `public/videos/vilo-full-video-web.mp4`, poster `public/images/home-page/vilo-full-video-poster.webp`, icons `public/images/icons/icon-play.png` / `icon-pause.png`  
**Homepage:** `<load src="/_page-components/video-section.html" />` in `src/index.html` (before the `alter-gallery-section`)

---

## Structure

```
section.video-section
├── h2.video-section__title
└── div.video-section__media.js-video-section__media
    ├── video.video-section__video   (muted loop playsinline, preload="metadata", no autoplay)
    └── button.video-section__control.js-video-section__control[data-state]
        ├── img.video-section__control-icon--pause
        └── img.video-section__control-icon--play
```

`.video-section__*` classes are for styling; `.js-video-section__*` classes are the hooks the script queries. Keep both when editing markup.

---

## Scroll grow (full-bleed)

The script writes two custom properties on the section root; CSS does the rest.

| Property | Set by | Meaning |
|----------|--------|---------|
| `--video-grow` | `video-section.js` | Progress `0 → 1` |
| `--video-bleed-width` | `video-section.js` | `document.documentElement.clientWidth` in px (viewport width without scrollbar) |
| `--video-radius` | CSS | Corner radius at rest: `var(--border-radius-30)` mobile, `6rem` desktop |

- **Start:** the media's top edge reaches **70%** of the viewport height (`GROW_START` in the script).
- **End (`1`):** the full-bleed block would be vertically centered in the viewport.
- `.video-section__media` widens by `(bleed width − section width) × grow`, with an equal negative `margin-inline` on each side so it stays centered. The radius scales to `0` as `grow` hits `1`.
- Scroll/resize listeners are attached only while the section intersects the viewport (IntersectionObserver) and are throttled with `requestAnimationFrame`.

The section itself still uses the **145rem width pattern** (see `SECTIONS.md`); only the media breaks out of it.

---

## Playback

- The video is **paused on load** (no `autoplay` attribute in the markup).
- It **plays** as soon as any pixel of `.video-section__media` is visible and **pauses** once it is fully out of view.
- Auto-play is skipped when:
  - the user prefers reduced motion (`prefers-reduced-motion: reduce`, re-checked live), or
  - the user paused it with the button. Pressing play again hands control back to the visibility logic.
- The button's `data-state` (`playing` / `paused`) is synced from the video's `play` / `pause` events and toggles which icon shows. `aria-label` switches between "Play video" and "Pause video".

---

## Layout tokens

| Token | Mobile | Desktop (≥1024) |
|-------|--------|-----------------|
| Section padding-block | `12rem 7rem` | `16rem 6rem` |
| Gap title ↔ video | `4rem` | `9rem` |
| Video aspect ratio | `3 / 4` (`object-fit: cover`) | `16 / 9` |
| Video radius (at rest) | `3rem` | `6rem` |
| Control size / radius | `3.4rem` / `1rem` | `4.2rem` / `var(--border-radius-12)` |
| Control offset (right, bottom) | `2rem`, `2rem` | `4rem`, `3rem` |
| Control icon | `1.6rem` | `2rem` |

---

## Typography

| Element | Mobile | Desktop |
|---------|--------|---------|
| Title | Geograph 2.6 / 3.2rem, max-width 31rem, centered | 4.8 / 5.6rem, max-width 65rem |

Color token: `var(--text-color-secondary)`. Font: `var(--primary-font)`.

---

## Editing checklist

1. Swapping the video: replace the file under `public/videos/`, update the `src` and `width`/`height` attributes, and regenerate the poster (`.webp`, same framing) so there is no visual jump when playback starts.
2. Mobile shows a **3:4 center crop** of the 16:9 source — keep the subject centered or supply a separate mobile cut.
3. Keep `muted`, `playsinline` and `loop` on the `<video>` — browsers will block muted-less autoplay, and iOS goes fullscreen without `playsinline`. Keep `aria-hidden="true"` too: the video is decorative (the heading carries the message) and the play/pause button stays accessible.
4. Do not add `autoplay` — the script does not remove it, and it would bypass the reduced-motion and visibility logic.
5. If the section is used on another page, no extra JS wiring is needed — the island loads whenever `.video-section` is present.
