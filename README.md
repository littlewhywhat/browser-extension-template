# browser-extension-template

Key principles reflected:

- `shared/` — only truly cross-environment code: type definitions, thin typed transport wrappers. No framework imports, no Effect, no React, no Preact. Pure TypeScript.
- `content/` — all content-script-specific utilities live here (mounting, observation, frame context). Preact + Tailwind.
- `background/` — Effect-based business logic, message handlers. Heavy dependencies stay here.
- `popup/` — React + Radix Themes. Self-contained.
