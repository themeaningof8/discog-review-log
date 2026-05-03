# Tech stack (discog-review-log)

Living notes for **tooling and runtime intent**. Update when decisions change.

## Current phase: harness only

Quality and automation first; **no browser bundler (Vite 等) in this phase.**


| Area               | Choice                                   |
| ------------------ | ---------------------------------------- |
| Package manager    | pnpm                                     |
| Language           | TypeScript (`strict`)                    |
| Format / lint      | Biome                                    |
| Git hooks          | Lefthook                                 |
| Tests              | Vitest + **fast-check** (property-based) |
| Unused code / deps | **knip**                                 |
| CI                 | GitHub Actions                           |


## Application runtime

**TBD** — to be filled when the product shape (CLI, API, worker, etc.) is decided. Bundler choice (if any) will be recorded here then.

## Operational defaults

Pinned versions, CI policy, Dependabot, and hook behavior: `**docs/harness-decisions.md`** (update when those change).

Summary: **Node 22 LTS**, **pnpm via Corepack + `packageManager`**, default branch `**main**`, Biome + knip + tests enforced in CI; Lefthook keeps pre-commit light.

## Specs and plans

- Designs: `docs/superpowers/specs/`
- Implementation plans: `docs/superpowers/plans/`
- Harness decision log: `docs/harness-decisions.md`

