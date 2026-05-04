# discog-review-log — Claude / agent context

## First reads

- `docs/tech-stack.md` — quality baseline + **application runtime** (Vite / Workers / Hono / Inertia per **`2026-05-03-discog-review-log-design.md`**).
- `docs/harness-decisions.md` — Node 25, pnpm pins, CI/GitHub defaults, Biome/knip/hooks policy.
- `docs/superpowers/specs/` — design specs; naming `YYYY-MM-DD-<topic>-design.md`.

## Rules

- Use **pnpm** only for installs (`packageManager` + Corepack when present). Do not switch to npm/yarn without explicit instruction.
- Implement **Biome, Lefthook, Vitest + fast-check, knip, GitHub Actions** per the harness design spec when writing implementation code.
- **FSD / Steiger** は **`src/client` のみ**（`src/client/README.md`）。サーバーは FSD にしない。

## Cursor

Project Cursor rules live under **`.cursor/rules/`** (kept in sync with the docs above).
