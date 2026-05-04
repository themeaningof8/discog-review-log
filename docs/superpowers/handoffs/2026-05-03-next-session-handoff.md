# 引き継ぎ — discog-review-log アプリ実装の続き

**このメモの用途:** 新しいチャット／エージェントが **追加コンテキストなしで** 実装を再開できるようにする。

---

## 最初に読むファイル（優先順）

1. **製品・スタックの正本** — `docs/superpowers/specs/2026-05-03-discog-review-log-design.md`
2. **実装計画（チェックリスト）** — `docs/superpowers/plans/2026-05-03-discog-review-log-app.md`
3. **エージェント向けルート** — `CLAUDE.md`、`.cursor/rules/project-harness.mdc`
4. **フォルダ単位の補助** — `src/client/README.md`、`src/server/README.md`

計画書の **Task 番号** がそのまま次の作業単位になる。

---

## 環境・コマンド

- **Node:** `engines` は **>=22 <23**（`.node-version` は `22`）。計画本文に「Node 25」とある箇所は **リポジトリ実態とズレている**ので、`package.json` / `.node-version` を優先する。
- **パッケージマネージャ:** **pnpm のみ**（`packageManager` フィールドに準拠）。
- **検証パイプライン:** `pnpm run validate`  
= Biome CI → **Steiger（`./src/client` のみ）** → `tsc` → Vitest → knip。
- **ビルド:** `pnpm run build`（CI にも含まれる）。
- **ローカル D1 マイグレーション:** `pnpm run db:migrate:local`  
  - `wrangler.jsonc` の該当 D1 に `**migrations_dir`: `"drizzle"`** が設定済み。

---

## 完了していること（実装計画との対応）

以下は **すでにマージ済みの作業ディレクトリを前提**にしている（未コミットなら `git status` で確認）。


| 領域              | 内容                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task 1–6 相当** | Vite / Cloudflare プラグイン / Hono + Inertia hello、`src/client/app/` にエントリ移動、Tailwind、`vite.config` の `inertiaPages({ pagesDir, outFile, serverModule })` |
| **Task 7–8 相当** | Drizzle `schema` + `drizzle/0000_init.sql`（**FK 順は手修正済み**）、`createDb`、`dbMiddleware`、`Env`                                                            |
| **ハーネス**        | Biome、Vitest、knip、Lefthook、`validate`                                                                                                                 |
| **Steiger**     | `steiger.config.ts` + `@feature-sliced/steiger-plugin`、`pnpm run steiger`、`pages.gen.ts` は ignores                                                    |
| **パスエイリアス**     | `tsconfig` の `@shared/*`, `@client/*`, `@server/*` と Vite / Vitest の alias を対応                                                                        |
| **CI**          | Biome → Steiger → typecheck → **build** → test → knip                                                                                                 |
| **ドキュメント**      | `src/client/README.md` / `src/server/README.md`、`CLAUDE.md` の Steiger / クライアント範囲を更新                                                                   |


**チェックポイント（計画どおり）**

- **Checkpoint A（scaffold）** — 通過想定（`pnpm run dev` / `build`）。
- **Checkpoint B（DB）** — ローカル D1 にマイグレーション適用済みなら通過想定。

---

## 未着手・次に進めるタスク（計画書ベース）

実装計画 `**2026-05-03-discog-review-log-app.md`** の **Task 9 から**がメインライン。


| 開始     | 内容（要約）                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------- |
| **9**  | `src/server/lib/password.ts`（PBKDF2）+ テスト                                                         |
| **10** | `sanitizeHtml.ts` + テスト（TipTap 向け allowlist）                                                      |
| **11** | KV セッション + 署名 Cookie（`session-cookie.ts`, `middleware/session.ts`）                                |
| **12** | 招待・登録・ログイン・ログアウト（`routes/auth.tsx` + Inertia ページ）→ **Checkpoint C**                               |
| **13** | Discogs 取得 + `releases` キャッシュ、`parseDiscogsReleaseId`（`src/shared`）                               |
| **14** | ライター向けレビュー作成・編集・公開、TipTap、`scoreAxes`                                                             |
| **15** | 公開ルート（ホーム・リリース・レビュー詳細）                                                                            |
| **16** | 管理者ルート + `middleware/auth.ts`                                                                     |
| **17** | knip / vitest / biome の再調整（計画は古いパス `src/client/app.tsx` を参照 → **実際は `src/client/app/index.tsx`**） |
| **18** | CI の build は **既に追加済み** → 重複追記に注意                                                                 |
| **19** | ルート `README.md` に dev / migrate / secrets の運用手順                                                   |
| **20** | 最終 validate + 手動スモーク → **Checkpoint D**                                                           |


計画の **ファイルマップ** にある `src/client/app.tsx` は廃止済み。**エントリは `src/client/app/index.tsx`**。

---

## 実装上の注意（ハマりどころ）

1. **Inertia のページ解決** — クライアントは `src/client/app/index.tsx` から `**../pages/**/*.tsx`** で glob。ページをネストして名前を変える場合は **サーバー側 `c.render('Name', …)` と glob の両方**を直す。
2. `**wrangler.jsonc`** — `database_id` / KV `id` はプレースホルダのまま。**リモート利用時**は `wrangler` で作成した ID に差し替え（コミット方針はチームルールに合わせる）。
3. **Steiger** — `**pnpm exec steiger .` は使わない**（リポジトリ直下をスキャンすると `src` がレイヤーと誤認される）。**常に `pnpm run steiger`（`./src/client`）**。
4. `**sanitize-html`** — Node 寄り。**Workers 本番で問題が出たら** `nodejs_compat` や代替を検討（計画・設計にも「実装時選定」の余地あり）。
5. **knip** — `ignoreDependencies` に将来使う依存が列挙されていることがある。実装が進んだら **依存が実コードから参照されるようにしてリストを縮める**とよい。

---

## 関連ファイル一覧（よく触る）


| 種別               | パス                                                               |
| ---------------- | ---------------------------------------------------------------- |
| Worker エントリ      | `src/server/worker.ts`                                           |
| Hono アプリ組み立て     | `src/server/app.ts`                                              |
| Inertia SSR      | `src/server/ssr.tsx`, `src/server/root-view.tsx`                 |
| DB               | `src/server/db/schema.ts`, `src/server/db/client.ts`, `drizzle/` |
| Wrangler         | `wrangler.jsonc`                                                 |
| Vite             | `vite.config.ts`                                                 |
| FSD / Steiger 対象 | `src/client/` のみ（`steiger.config.ts`）                            |


---

## この引き継ぎファイル自身

- **パス:** `docs/superpowers/handoffs/2026-05-03-next-session-handoff.md`
- **更新タイミング:** 大きなマイルストーン（Checkpoint C/D）やディレクトリ方針変更のたびに追記すると次セッションが楽になる。