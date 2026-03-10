# Browser Extension Template

## Key Principles

### Architecture: Two Isolated Worlds

- `extension/` (background + popup) and `content/` are completely separate sandboxes
- `types/` is the only bridge — pure TypeScript type definitions, zero runtime code
- `extension/` imports from `extension/shared/` and `types/`
- `content/` imports from `content/` and `types/`
- No cross-imports between `extension/` and `content/`

### Dependency Boundaries

- `types/` — no framework imports, no dependencies. Pure TypeScript
- `extension/shared/` — shared between background and popup only. No React, no Effect
- `extension/background/` — Effect for business logic. Heavy deps stay here
- `extension/popup/` — React + Radix Themes. Self-contained
- `content/` — Preact + Tailwind. Lightweight, never imports from `extension/`

### Content Script Weight Matters

- Content scripts are injected into every matching page — bundle size directly affects user experience
- Preact (~3KB) over React (~40KB) for content scripts
- Tailwind (tree-shaken, only used classes) for floating UI in Shadow DOM
- Background and popup have zero size constraints — load once, not per-page

### Two Content Script Rendering Modes

- **Inline** — Preact rendered directly into host DOM, no style isolation, reuses host page CSS classes. For buttons, badges, annotations that blend in
- **Floating** — Preact + Tailwind inside Shadow DOM. Style isolation from host page. For sidebars, overlays, draggable panels that sit on top

### Shadow DOM for Floating, No Shadow DOM for Inline

- Floating overlays are self-contained UI — need style isolation so host page can't break them
- Inline injections deliberately inherit host page styles to blend in
- Tailwind CSS injected into shadow root via Vite `?inline` import
