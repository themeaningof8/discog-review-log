# `src/client` (Inertia + React)

**FSD + Steiger の対象はこのディレクトリだけ**（`pnpm run steiger` は `./src/client` を解析）。

## レイアウト（いまの形状）

- `**app/`** — クライアントエントリ（`index.tsx`）、全体 CSS（`styles.css`）。Vite / `vite-ssr-components` の `<Script>` もここを指す。
- `**pages/**` — Inertia ページ。`@hono/inertia/vite` の `pagesDir` と、クライアントの `import.meta.glob` は `**../pages/**/*.tsx**` 前提（`app/` の深さに合わせる）。
- `**pages.gen.ts**` — 生成物。手で編集しない。Steiger では無視設定済み。

新しい画面は FSD の流儀に沿って `pages` 以下に切る。スライスが増えたら `entities` / `features` / `shared`（クライアント内）などを足していく。

## インポートエイリアス（`tsconfig` / Vite と一致）

- `@client/…` → このツリー直下
- 共有ドメインはルートの `@shared/…`（`src/shared`）

正本のプロダクト仕様は `**docs/superpowers/specs/2026-05-03-discog-review-log-design.md**`。