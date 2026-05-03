# discog-review-log

## Prerequisites

- Node **22** (see `.node-version`)
- [Corepack](https://nodejs.org/api/corepack.html) enabled (`corepack enable`)
- **pnpm** via Corepack (version pinned in `package.json` → `packageManager`)

## Setup

```bash
corepack enable
pnpm install
```

Git hooks (Lefthook) install on `pnpm install` via the `prepare` script.

## Checks

```bash
pnpm run validate
```

Runs Biome (`ci` mode), TypeScript `noEmit`, Vitest, and knip — same gates as CI.

Individual scripts: `pnpm run check`, `pnpm run check:ci`, `pnpm run typecheck`, `pnpm run test`, `pnpm run knip`.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
