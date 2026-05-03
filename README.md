# discog-review-log

## Prerequisites

- **Node 25.6.x** matching `.node-version` (see `package.json` → `engines`). Other versions may show pnpm’s **Unsupported engine** warning.
- [Corepack](https://nodejs.org/api/corepack.html) (ships with Node; run `corepack enable` once per machine if needed).
- **pnpm** version pinned in `package.json` → `packageManager` (activate with Corepack; do not rely on a global pnpm that might be older).

## Setup

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
pnpm install
```

`prepare` runs `lefthook install` only when **not** in CI and a **`.git`** directory exists (so sandboxes and `pnpm pack` installs do not fail).

## Checks

```bash
pnpm run validate
```

Runs Biome (`ci` mode), Steiger (FSD under `src/client`), TypeScript `noEmit`, Vitest, and knip — same gates as CI.

Individual scripts: `pnpm run check`, `pnpm run check:ci`, `pnpm run steiger`, `pnpm run typecheck`, `pnpm run test`, `pnpm run knip`.

## Troubleshooting

- **`WARN Unsupported engine: ... (current: ...)`**  
  Use the **patch in `.node-version`** (e.g. `mise install` / `nvm use` / official installer) so your runtime matches **CI and `@types/node`**. Widen `engines` in `package.json` only with an explicit team decision (then update `docs/harness-decisions.md`).

- **pnpm version mismatch**  
  Run `corepack prepare pnpm@10.33.2 --activate` and confirm `pnpm -v` matches the `packageManager` field.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
