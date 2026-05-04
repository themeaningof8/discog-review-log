# `src/server` (Cloudflare Workers + Hono)

**FSD にはしない**。サーバー側はルート・ミドルウェア・DB の並びで読む。

## エントリ

- **`worker.ts`** — Worker の default export（`wrangler.jsonc` の `main`）。
- **`app.ts`** — `createApp()` で Hono を組み立てる。
- **`root-view.tsx` / `ssr.tsx`** — Inertia の HTML シェルと SSR 用ページ解決。

## データ・環境

- **`types.ts`** — `Env`（`DB`, `SESSIONS`, `DISCOGS_USER_TOKEN`, `APP_SECRET` など）。ルートやミドルウェアの型に使う。
- **`db/`** — Drizzle スキーマと `createDb`。
- **`middleware/`** — 例: D1 を `c.set("db", …)` で載せる処理。

Secrets はリポジトリに含めず、Wrangler / CI の想定どおりに渡す。

設計の正本は **`docs/superpowers/specs/2026-05-03-discog-review-log-design.md`**。
