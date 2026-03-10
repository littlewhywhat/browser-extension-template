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

### Messaging: Two Separate Direction Maps

- `BackgroundMessages` — handled by background, sent from popup/content
- `ContentMessages` — handled by content, sent from background via `sendToTab`
- Each side has its own `messaging.ts` with typed wrappers
- Messages carry plain discriminated unions `{ ok: true, data } | { ok: false, error }` — no framework types cross the wire

### Effect Only Where It Makes Sense

- Effect lives in background service worker — composing async pipelines, retry, error handling
- Content scripts use plain promises/discriminated unions — zero Effect overhead in page context
- Popup can optionally use Effect (no size constraint) but doesn't need to

### Observation Patterns

- `observeAndInject` handles both DOM mutations and scroll visibility
- MutationObserver detects new elements, IntersectionObserver gates on visibility
- Marker attributes prevent double-injection
- Returns `dispose()` for cleanup on SPA navigation

### Frame Awareness

- Content scripts can run in all frames via `all_frames: true`
- `frameContext` utility identifies position: isTop, url, depth
- Background uses `chrome.webNavigation.getAllFrames` to get the full frame tree
- Full page tree reconstruction (scraping iframes) is a separate lib concern, not template

### Code Style

- Arrow functions everywhere — enforced by Biome `useArrowFunction` rule
- No comments in code
- Biome for linting and formatting
- TypeScript strict mode

### Build & Packaging

- CRXJS (Vite plugin) handles manifest, HMR, content script bundling
- `pnpm dev` — Vite dev server with HMR, CORS configured for `chrome-extension://`
- `pnpm build` — production build to `dist/` + `release/release.zip` via `vite-plugin-zip-pack`
- CSS imported in JS entry points (not manifest `css` array) — CRXJS processes through Vite pipeline

### Generic vs Example Separation

- Template infrastructure (messaging, mounting, observation, storage pattern) stays generic
- Example-specific code (weather types, components, Google selectors, handler logic) should live in clearly separated `example/` subfolders
- Deleting all `example/` folders leaves a working skeleton ready for new extension logic

## Stack

| Aspect | Choice |
|--------|--------|
| Language | TypeScript (strict) |
| Package manager | pnpm |
| Bundler | CRXJS (Vite plugin) |
| Popup | React + Radix Themes |
| Content script (inline) | Preact, reuse host page styles |
| Content script (floating) | Preact + Tailwind in Shadow DOM |
| Background | Service worker, Effect for business logic |
| Error handling | Effect (background), plain discriminated unions (content) |
| Linting/formatting | Biome |
| Browser target | Chrome only (Manifest V3) |

## Architecture

```
src/
├── extension/                  # extension context (background + popup)
│   ├── background/
│   │   └── index.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── shared/                 # shared between background + popup ONLY
│       ├── messaging.ts
│       └── storage.ts
├── content/                    # isolated sandbox (injected into pages)
│   ├── index.ts
│   ├── messaging.ts
│   ├── frame-context.ts
│   ├── content.css
│   ├── inline/
│   │   ├── mount.ts
│   │   ├── observe-and-inject.ts
│   │   └── components/
│   └── floating/
│       ├── mount.ts
│       ├── floating.css
│       ├── setup-drag.ts
│       └── components/
└── types/
    └── messages.ts             # pure types — only bridge between extension/ and content/
```
