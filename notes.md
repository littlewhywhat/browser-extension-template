# Browser Extension Template — Implementation Plan

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
| Error handling | Effect (background/popup), plain discriminated unions (content) |
| Linting/formatting | Biome |
| Browser target | Chrome only (Manifest V3) |

## Architecture

```
src/
├── extension/                  # extension context (background + popup)
│   ├── background/
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── shared/
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
│       ├── use-draggable.ts
│       └── components/
└── types/
    └── messages.ts             # pure types — only bridge between extension/ and content/
```

### Import Rules

- `extension/` imports from `extension/shared/` and `types/`
- `content/` imports from `content/` and `types/`
- `types/` imports nothing
- No cross-imports between `extension/` and `content/`

## Popup

- React + Radix Themes
- Sends messages to background via `sendMessage`
- Example: displays extension status, settings toggle

## Content Script — Inline

- Preact with `@jsxImportSource preact` pragma
- Renders directly into host DOM, reuses host page CSS classes
- `mountInline(target, Component)` — one-shot render
- `observeAndInject(config)` — MutationObserver + IntersectionObserver utility
  - `trigger: 'mutation' | 'scroll' | 'both'`
  - `markerAttr` prevents double-injection
  - Returns `dispose()` for cleanup
- Example: "Weather" button injected next to Google search bar

## Content Script — Floating

- Preact + Tailwind inside Shadow DOM
- `mountFloating(Component, options)` — creates fixed-position shadow root container
  - Options: position, draggable, size
- `useDraggable(ref)` — Preact hook for drag handling
- Tailwind CSS injected into shadow root via Vite `?inline` import
- Example: draggable weather overlay panel

## Background

- Effect for composing async handlers
- `pipe`, `Effect.Do`, `Effect.flatMap`, `Effect.tap`, `Effect.tryPromise`
- Handles messages from popup and content scripts
- Example: handles `get-weather` message

## Messaging

Two separate message maps in `types/messages.ts`:
- `BackgroundMessages` — handled by background, sent from popup/content
- `ContentMessages` — handled by content, sent from background via sendToTab

Each side has its own messaging.ts with typed wrappers:
- `extension/shared/messaging.ts` — sendMessage, onMessage, sendToTab
- `content/messaging.ts` — sendMessage, onMessage

## Storage

- Typed wrapper around `chrome.storage.local`
- Lives in `extension/shared/storage.ts`

## Frame Context

- `content/frame-context.ts` — utility for content scripts to identify their position
- isTop, url, depth
- Used when `all_frames: true` is enabled in manifest

## Example: Google Weather

- Content script matches `https://www.google.com/*`
- Inline: observes for Google search bar, injects a "Weather" button using host page classes
- Button click opens a floating draggable overlay
- Overlay shows placeholder weather info
- Background handles `get-weather` message using Effect pipe
- Popup shows extension status with Radix Themes UI

## Build

- `pnpm dev` — Vite dev server with CRXJS HMR
- `pnpm build` — production build to `dist/`
