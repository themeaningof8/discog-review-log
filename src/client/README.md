# `src/client` (Inertia + React)

**FSD + Steiger の対象はこのディレクトリだけ**（`pnpm run steiger` は `./src/client` を解析）。

## レイアウト（いまの形状）

- `**app/`** — クライアントエントリ（`index.tsx`）、全体 CSS（`styles.css`）。Vite / `vite-ssr-components` の `<Script>` もここを指す。
- `**pages/**` — Inertia ページ。`@hono/inertia/vite` の `pagesDir` と、クライアントの `import.meta.glob` は `**../pages/**/*.tsx**` 前提（`app/` の深さに合わせる）。
- `**pages.gen.ts**` — 生成物。手で編集しない。Steiger では無視設定済み。

新しい画面は FSD の流儀に沿って `pages` 以下に切る。スライスが増えたら `entities` / `features` / `shared`（クライアント内）などを足していく。

## Pages と UI スライスの役割（ルール）

**方針:** Inertia の `pages/*` は **配線（composition）だけ** にし、マークアップの本体は **`widgets` / `features` / `entities`** に置く。

### `pages/` に書くこと

- `@client/widgets/site-nav` の **`AppShell`**（`auth`・`main` の `className` は各ルート用の定数、例: `HOME_MAIN_CLASS`）
- サーバーから渡る props を **`AppShell` と `*PageContent` に渡すだけ** の default export コンポーネント

### `pages/` に書かないこと

- 長い JSX・一覧の `<li>` 構造・フォーム全体など（→ 対応する `*PageContent` へ）

### `widgets/site-nav`

- **`SiteNav`** と **`AppShell`**（ヘッダー＋`main` ラッパー）を **同一スライス** に置く。  
  Steiger は **異なる `widgets/*` スライス同士の import を禁止**するため、`AppShell` を別スライスに切り出して各画面ウィジェットから import する構成には **しない**。

### Steiger（`pnpm run steiger`）との関係

- **widgets 同士は import しない。** レイアウト（`AppShell`）とページ本文（`*PageContent`）の **合体は `pages/` で行う。**
- **`features`** は **`widgets` から import してよい**（例: `ReviewEditor`）。

## ウィジェットの粒度（いつ 1 スライスでよいか／分割するか）

**デフォルト:** ルート 1 本 ≈ `widgets/<route>-screen` のような **1 スライス + `*PageContent` 1 つ** から始めてよい。チーム内で「画面＝ここ」と境界が揃えばよい。

**このまま 1 ファイルに収めてよい例**

- リンク一覧だけのような **極小画面**（スライスとしては小さいが、他画面とパターンを揃えるなら独立スライスのままでもよい）

**分割・下位レイヤーへ寄せることを優先したい例**

- **巨大フォーム・複数ステップ**（例: 新規レビュー / 編集）→ 入力・タグ・スコアなどは **`features/*`** に寄せ、ウィジェットは **段・並び** に留める。
- **1 画面に独立した責務が複数**（例: 招待作成とユーザー一覧）→ **セクションごと**にウィジェットを分けるか、操作まわりは **`features`**。
- **ドメインオブジェクトの見た目が複数画面で再利用される**（レビュー 1 行・カバー付きタイトルなど）→ **`entities/*/ui`** に薄い presentational を置く。

迷ったら **「ファイルが読みにくくなった／テストしたい単位が複数ある」** を分割の目安にする。

## インポートエイリアス（`tsconfig` / Vite と一致）

- `@client/…` → このツリー直下
- 共有ドメインはルートの `@shared/…`（`src/shared`）

正本のプロダクト仕様は `**docs/superpowers/specs/2026-05-03-discog-review-log-design.md**`。