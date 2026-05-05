# discog-review-log — Claude / agent context

## First reads

- `docs/tech-stack.md` — stack and phase (harness-first; **Vite（Astro 内蔵）を採用** — ロードマップ `2026-05-05` 参照).
- `docs/harness-decisions.md` — Node 22, pnpm pins, CI/GitHub defaults, Biome/knip/hooks policy.
- `docs/superpowers/specs/` — design specs; naming `YYYY-MM-DD-<topic>-design.md`.

## Rules

- Use **Bun** for installs (`bun install`). pnpm はフェーズ 1 完了後に廃止。npm/yarn/pnpm を新たに使わないこと。
- Implement **Biome, Lefthook, Vitest + fast-check, knip, GitHub Actions** per the harness design spec when writing implementation code.
- Do **not** add **FSD / Steiger** unless the user updates documentation.

## Cursor

Project Cursor rules live under **`.cursor/rules/`** (kept in sync with the docs above).
