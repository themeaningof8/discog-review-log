# フェーズ 0〜2 実装設計

**作成日:** 2026-05-05  
**ステータス:** 承認済み  
**親ドキュメント:** `docs/superpowers/specs/2026-05-05-full-stack-incremental-roadmap-design.md`

## 概要

ロードマップのフェーズ 0〜2 を実装するための詳細設計。学習重視のため、各技術決定に「学習メモ」を添える。

| フェーズ | テーマ | 主な技術決定 |
|---------|--------|------------|
| 0 | ドキュメント整合 | `harness-decisions.md` / `tech-stack.md` に Bun 第一 + Astro/Vite 採用を追記 |
| 1 | Bun workspace + CI 完全移行 | `bun install` が root から通る。既存 CI を pnpm → Bun に一本化 |
| 2 | Elysia 最小 API | `apps/api` に `GET /health`。`bun:test` でサーバレステスト |

### 学習注釈の方針

- 各技術決定の「なぜ」を `> **学習メモ：**` ブロックでインライン記載
- writing-plans が生成するタスクにも「このステップで学ぶ概念」を 1 行添える

---

## フェーズ 0：ドキュメント整合

**学ぶこと:** 変更がハーネス文書に与える影響の整理。

### 変更対象

#### `docs/harness-decisions.md`

「ランタイムとパッケージマネージャ」テーブルに追加：

| 項目 | 推奨 |
|------|------|
| Bun | **Bun 第一**（フェーズ 1 以降）。バージョンは `bunfig.toml` または `.tool-versions` に pin。ロックファイルは `bun.lockb` |
| パッケージマネージャ移行 | フェーズ 1 で pnpm → Bun へ完全移行。移行完了後は `pnpm-lock.yaml` を削除 |

末尾の「アーキテクチャ（見送り中）」セクションに追加：

> **Vite（Astro 内蔵）** — ロードマップ `2026-05-05` にて意図的に採用。従来の「Vite を避ける」方針は本ロードマップで上書き。

#### `docs/tech-stack.md`

- pnpm 記載に「フェーズ 1 以降 Bun へ移行予定」の注記を追加
- フロントエンドに Astro + Solid + Tailwind v4 の行を追加（「予定」として）

### 完了の定義

- 上記 2 ファイルを更新して commit
- CI 変更なし、アプリコード追加なし

### やらないこと

- アプリコードの追加
- CI の変更
- pnpm-lock.yaml の削除（フェーズ 1 で行う）

---

## フェーズ 1：Bun workspace + CI 完全移行

**学ぶこと:** `package.json` workspaces の仕組み、Bun のスクリプト実行と lockfile の役割。

### workspace 構造

```
/                        ← root（workspace ルート）
├── package.json         ← "workspaces": ["apps/*"] を追加
├── bun.lockb            ← Bun のバイナリ lockfile（pnpm-lock.yaml を置き換え）
├── bunfig.toml          ← Bun の設定ファイル（`--frozen-lockfile` を CI のみ渡すなら不要。CI フラグで代替する場合は作成しない）
├── apps/
│   ├── web/
│   │   └── package.json ← name: "@discog/web"、スクリプト placeholder のみ
│   └── api/
│       └── package.json ← name: "@discog/api"、スクリプト placeholder のみ
└── src/                 ← 既存ハーネス（変更なし）
```

> **学習メモ：** `workspaces` はモノレポ内の複数パッケージを 1 回の `bun install` でまとめてインストールする仕組みです。`apps/web` と `apps/api` が別チームや別デプロイ先に育っても、依存を root で統一管理できます。npm / pnpm の workspaces と互換の設定形式です。

### 既存ハーネスの扱い

`src/` と既存スクリプト（`biome` / `typecheck` / `test` / `knip`）はそのまま維持する。`pnpm run` → `bun run` に置き換えるだけで動作する（Vitest は `bun run vitest` 経由で引き続き使用）。

> **学習メモ：** Bun はパッケージマネージャとして `npm`/`pnpm` の代替として使えます。既存の `scripts` の書き方は変わらず、`bun run <script>` で実行できます。ランタイムとしての Bun（`bun:test` 等）はフェーズ 2 以降で段階的に導入します。

### Bun バージョン固定

`.tool-versions` または `bunfig.toml` に stable バージョンを pin する（実装時に `bun --version` で確認し記録）。CI では `oven-sh/setup-bun@v2` の `bun-version` に同じバージョンを指定。

> **学習メモ：** バージョンを固定することで「自分のローカルでは動くが CI では動かない」を防ぎます。Bun は破壊的変更が少ないですが、再現性のために pin は重要です。

### CI 完全移行

`.github/workflows/ci.yml` を以下に置き換え（抜粋）：

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: "1.x.x"   # ← 実装時に stable バージョンで固定

- name: Install dependencies
  run: bun install --frozen-lockfile
```

- `actions/setup-node` / `cache: pnpm` を削除
- 以降のスクリプト呼び出しは `bun run <script>` に統一
- `pnpm-lock.yaml` を削除、`bun.lockb` をコミット

> **学習メモ：** `oven-sh/setup-bun` は Bun 公式が提供する GitHub Actions アクションです。`--frozen-lockfile` は `bun.lockb` と `package.json` の不一致があるとエラーにするオプションで、CI で「ロックファイルを更新し忘れた」を検知できます。

### 完了の定義

- root で `bun install` が通り `bun.lockb` が生成される
- `bun run validate` が緑（既存ハーネスが壊れていない）
- CI が Bun で通る
- `pnpm-lock.yaml` を削除済み

### やらないこと

- Astro・Elysia・Tailwind の導入
- `apps/web` / `apps/api` へのフレームワーク追加（空パッケージの skeleton のみ）
- `bun:test` への移行（フェーズ 2 以降）

---

## フェーズ 2：Elysia 最小 API

**学ぶこと:** Elysia のルート定義、`bun:test` でハンドラをサーバレスに叩く。

### ファイル構造（`apps/api` 内）

```
apps/api/
├── package.json          ← elysia を依存に追加、scripts 追加
├── tsconfig.json         ← Bun 向け TypeScript 設定
├── src/
│   ├── app.ts            ← Elysia インスタンスをエクスポート（サーバ起動しない）
│   └── app.test.ts       ← bun:test でハンドラを直接テスト
└── index.ts              ← サーバ起動エントリ（bun run dev 用）
```

> **学習メモ：** `app.ts` でインスタンスを分離してエクスポートするのは「テスタビリティ」のための設計です。`index.ts` はサーバを起動するだけ。テストは `app.ts` を直接 import してリクエストを模擬します。これによりサーバプロセスなしに API を検証できます。

### `src/app.ts`

```ts
import { Elysia } from "elysia";

export const app = new Elysia()
  .get("/health", () => ({ status: "ok" }));
```

> **学習メモ：** Elysia はメソッドチェーンでルートを定義します。`.get(path, handler)` の handler は値を返すだけ。フレームワークが JSON シリアライズを自動処理するため、`Response` や `JSON.stringify` を書く必要はありません。

### `src/app.test.ts`

```ts
import { describe, expect, it } from "bun:test";
import { app } from "./app";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await app.handle(
      new Request("http://localhost/health")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});
```

> **学習メモ：** `app.handle(request)` は Elysia のテスト用 API で、HTTP サーバを立てずに `Request` オブジェクトを直接渡して `Response` を受け取れます。`bun:test` は Bun に組み込まれたテストランナーで、`describe` / `it` / `expect` は Vitest とほぼ同じ構文です。追加インストール不要なのが Bun の特徴の 1 つです。

### `index.ts`（サーバ起動エントリ）

```ts
import { app } from "./src/app";

app.listen(3000);
console.log("API running at http://localhost:3000");
```

> **学習メモ：** `app.listen()` はサーバを起動するメソッドです。テストでは呼ばないため、`app.ts` と分離しています。開発時は `bun run dev`（`bun --watch index.ts`）で起動します。

### `apps/api/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "types": ["bun-types"]
  }
}
```

> **学習メモ：** `bun-types` は Bun ランタイム固有の API（`Bun.file()` など）に型を付けるパッケージです。root の `@types/node` とは別物で、Bun 環境専用のコードに必要です。`moduleResolution: "Bundler"` は Bun / Vite などのバンドラ環境向けの設定で、拡張子なしの import を許可します。

### `apps/api/package.json`（スクリプト）

```json
{
  "name": "@discog/api",
  "scripts": {
    "dev": "bun --watch index.ts",
    "test": "bun test"
  }
}
```

### CI への組み込み

フェーズ 1 で移行済みの `.github/workflows/ci.yml` に `apps/api` のテストステップを追加する：

```yaml
- name: Test (api)
  run: bun test
  working-directory: apps/api
```

### 完了の定義

- `apps/api` 内で `bun test` を実行してテストが通る
- サーバプロセスを起動しなくてもテストが完結している
- CI の `Test (api)` ステップが緑になる

### やらないこと

- DB、認証、OpenAPI スキーマ生成
- Eden Treaty（型安全クライアント）
- `apps/web` との接続（フェーズ 5 以降）

---

## 参照

- ロードマップ: `docs/superpowers/specs/2026-05-05-full-stack-incremental-roadmap-design.md`
- ハーネス設計: `docs/superpowers/specs/2026-05-03-harness-and-tooling-design.md`
- ハーネス運用方針: `docs/harness-decisions.md`
