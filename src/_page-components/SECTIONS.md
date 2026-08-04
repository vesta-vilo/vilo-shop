# Section partials

Guidance for page sections in `src/_page-components/` (e.g. `media-icons.html`, `customer-voice.html`).

## Horizontal layout baseline

Put width constraints on the **`<section>` root**, not on inner rows or `.container` wrappers.

### CSS pattern

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

### Tokens (`src/styles/variables.css`)

| Token | Value | Use |
|-------|-------|-----|
| `--page-padding-inline` | `1.8rem` | Mobile side inset in width `calc` |
| `--layout-gutter-desktop` | `3rem` | Desktop side inset in width `calc` |
| `--layout-menubar-max` | `145rem` | Max content width (same as `max-width: 145rem`) |

### Notes

- Do **not** combine this with `padding-inline` on the same element — the `calc` already reserves side space below the max width.
- At viewports ≥ 145rem wide, the section hits `max-width` and `margin-inline: auto` centers it.
- Inner rows should use `width: 100%` inside the section.
- Example implementation: `media-icons` — `src/_page-components/media-icons.html`, `src/styles/components/media-icons.css`.

## HTML blank lines

See `.cursor/rules/html-formatting.mdc` — at most one consecutive blank line between blocks.
