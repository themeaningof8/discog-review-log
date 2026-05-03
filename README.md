# discog-review-log

## Prerequisites

- **Node 22.x** (see `.node-version` and `package.json` → `engines`). The repository is not tested on Node 23+; other versions may show pnpm’s **Unsupported engine** warning.
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

Runs Biome (`ci` mode), TypeScript `noEmit`, Vitest, and knip — same gates as CI.

Individual scripts: `pnpm run check`, `pnpm run check:ci`, `pnpm run typecheck`, `pnpm run test`, `pnpm run knip`.

## Troubleshooting

- **`WARN Unsupported engine: wanted: {"node":">=22 <23"} (current: ...)`**  
  Switch to Node **22.x** (e.g. `mise use node@22`, `nvm use 22`, or install from nodejs.org). Widen `engines` only if the team explicitly supports other majors (then update `.node-version`, CI, and `docs/harness-decisions.md`).

- **pnpm version mismatch**  
  Run `corepack prepare pnpm@10.33.2 --activate` and confirm `pnpm -v` matches the `packageManager` field.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
