# discog-review-log

## Prerequisites

- [Bun](https://bun.sh) **1.3.5 or later** — install with `brew install bun` (macOS) or see https://bun.sh/docs/installation

## Setup

```bash
bun install
```

Git hooks (Lefthook) are installed automatically via the `prepare` script.

## Checks

```bash
bun run validate
```

Runs Biome (`ci` mode), TypeScript `noEmit`, Vitest, Astro `apps/web` build, and knip — same gates as CI.

Individual scripts: `bun run check`, `bun run check:ci`, `bun run typecheck`, `bun run test`, `bun run build:web`, `bun run knip`.

## Web app (Astro + Solid)

```bash
bun run dev:web
```

開発サーバーでトップページの Solid island（カウンター）を確認できる。

## Troubleshooting

- **Bun version mismatch**  
  Check `package.json` → `packageManager` for the pinned Bun version. Install or update with `brew install bun` and confirm `bun --version` matches.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
