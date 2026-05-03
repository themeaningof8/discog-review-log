# Harness & Guardrails Design (TypeScript)

## Goal

Establish a reproducible quality baseline before application features: package management, formatting/linting, typechecking, tests (including property-based testing), dead-code and unused dependency detection, Git hooks, and CI on GitHub Actions. **Browser bundling (Vite or similar) is explicitly out of scope for this phase.**

## Non-goals (this phase)

- Vite, SPA scaffolding, `index.html`, or frontend framework choice.
- Production deployment, hosting, or runtime secrets.
- Replacing Biome with ESLint unless a future spec requires plugin compatibility Biome cannot cover.

## Stack decisions


| Concern          | Choice               | Notes                                                                  |
| ---------------- | -------------------- | ---------------------------------------------------------------------- |
| Package manager  | pnpm                 | Lockfile + CI cache; `packageManager` in `package.json` with Corepack. |
| Language         | TypeScript, `strict` | `tsc --noEmit` in CI and optionally locally.                           |
| Format / lint    | Biome                | Single tool; `biome.json` at repo root.                                |
| Git hooks        | Lefthook             | `lefthook.yml`; **no Husky / lint-staged** for this design.            |
| Unit / PBT       | Vitest + fast-check  | Vitest runs tests; fast-check for property-based cases.                |
| Dead code / deps | knip                 | Run in CI; configuration tuned as `src/` grows.                        |
| CI               | GitHub Actions       | `push` and `pull_request` to default branch (adjust name if needed).   |


## Repository layout (target)

- `package.json` — scripts: `check` (Biome), `typecheck` (`tsc --noEmit`), `test` (Vitest), `knip` (knip), `prepare` or documented step for Lefthook install.
- `tsconfig.json` — `strict`, `src` included.
- `biome.json` — formatter + linter rules; scope includes config files as needed.
- `lefthook.yml` — e.g. `pre-commit`: `pnpm exec biome check --write` on staged paths (use Lefthook/Biome documented patterns for staged files).
- `knip.json` / `knip.jsonc` or knip section in `package.json` — entries for `src` when present; revise when adding apps/packages.
- `src/` — minimal entry (e.g. `src/index.ts`) so typecheck, tests, and knip have real targets.
- `src/**/*.test.ts` or `test/` — convention documented below; at least one trivial test plus optional tiny fast-check sample to prove wiring.
- `.github/workflows/ci.yml` — install with frozen lockfile, then `biome ci` (or equivalent), `tsc --noEmit`, `vitest run`, `knip`.

## CI job order

1. Checkout, setup Node (LTS aligned with local dev), enable pnpm (Corepack).
2. `pnpm install --frozen-lockfile`.
3. `pnpm exec biome ci` (or project script wrapping it).
4. `pnpm run typecheck`.
5. `pnpm test` (Vitest).
6. `pnpm exec knip` (or `pnpm run knip`).

Fail the job on any non-zero exit; no deployment steps.

## Local vs CI

- **Pre-commit (Lefthook):** Prefer fast checks only — Biome on staged changes. Running full knip on every commit is optional and often deferred to **CI only** to keep commits snappy.
- **Optional pre-push:** Could run `knip` or full `test`; document if enabled (default: **not** required locally if CI is trusted).

## Documentation conventions

- `docs/tech-stack.md` — living summary of runtime/tooling intent for contributors (updated when stack changes).
- `docs/harness-decisions.md` — pinned Node/pnpm, GitHub/CI policy, tool behavior defaults (Dependabot, hooks).
- Feature and harness specs live under `docs/superpowers/specs/` with naming `YYYY-MM-DD-<topic>-design.md`.
- Implementation plans (after this spec is approved for implementation work) go under `docs/superpowers/plans/` per project convention.

## Testing strategy

- **Example tests:** Vitest for deterministic cases.
- **Property-based tests:** fast-check where invariants matter (parsing, transforms, pure logic). Start with zero or one minimal property test to validate tooling; expand per feature specs.
- CI must run `vitest run` so tests cannot silently rot.

## Error handling

- Hook failures: developer reruns documented fix commands (`pnpm exec biome check --write`, etc.).
- CI failures: fix locally until `pnpm check` / `pnpm typecheck` / `pnpm test` / `pnpm knip` match CI expectations.

## Risks and mitigations


| Risk                                         | Mitigation                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| knip false positives or noisy unused exports | Adjust knip config (tags, entry files, ignore patterns) as codebase grows. |
| Biome vs TypeScript overlap                  | Use Biome for style/lint; `tsc` remains source of truth for types.         |
| fast-check + Vitest wiring                   | Keep one smoke property test in repo to catch breakage.                    |


## Approval

This document reflects requirements agreed on 2026-05-03: **no Vite in this phase**, **Lefthook**, **Biome**, **fast-check**, **knip**, **pnpm**, **GitHub Actions**.