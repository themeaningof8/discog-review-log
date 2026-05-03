# discog-review-log — Claude / agent context

## First reads

- `docs/tech-stack.md` — stack and phase (harness-first; **no Vite** unless specs change).
- `docs/harness-decisions.md` — Node 22, pnpm pins, CI/GitHub defaults, Biome/knip/hooks policy.
- `docs/superpowers/specs/` — design specs; naming `YYYY-MM-DD-<topic>-design.md`.

## Rules

- Use **pnpm** only for installs (`packageManager` + Corepack when present). Do not switch to npm/yarn without explicit instruction.
- Implement **Biome, Lefthook, Vitest + fast-check, knip, GitHub Actions** per the harness design spec when writing implementation code.
- Do **not** add **FSD / Steiger** unless the user updates documentation.

## Cursor

Project Cursor rules live under **`.cursor/rules/`** (kept in sync with the docs above).
