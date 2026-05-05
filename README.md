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

## ローカルで front ↔ API（フェーズ 5）

1. ターミナル A で API を起動する。

   ```bash
   bun run dev:api
   ```

   `http://127.0.0.1:3000/health` が `{"status":"ok"}` を返すこと。

2. ターミナル B で Astro を起動する。

   ```bash
   bun run dev:web
   ```

3. ブラウザで Astro の URL（通常 `http://localhost:4321`、表示はターミナルに従う）を開き、ページ下部の **「API /health（dev プロキシ）」** に `{"status":"ok"}` が表示されればよい。

   フロントは `fetch("/api/health")` だけを行い、Vite の `server.proxy` が `/api` を API サーバへ転送する（CORS は不要）。

## Troubleshooting

- **Bun version mismatch**  
  Check `package.json` → `packageManager` for the pinned Bun version. Install or update with `brew install bun` and confirm `bun --version` matches.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
