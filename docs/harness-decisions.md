# ハーネス関連の意思決定（推奨デフォルト）

実装・CI・運用でブレないようにするための推奨。変更したら本ファイルと `docs/tech-stack.md` を更新する。

## ランタイムとパッケージマネージャ

| 項目 | 推奨 |
|------|------|
| Node | **25.6.x** — `.node-version` で **パッチまで** pin（例 `25.6.0`）。`@types/node` は **同じパッチ**に固定し、型とランタイムの API 面を揃える。要件により Current を採用；組織方針で LTS 固定が必要なら別途見直し |
| `engines` | `package.json` に **メジャー帯**（例 `"node": ">=25 <26"`）。**実際に合わせるパッチ**は `.node-version` と固定の `@types/node` |
| mise | **`mise.toml` で `node` を二重に pin しない**（単一の情報源は `.node-version`）。mise は標準で `.node-version` を拾う |
| pnpm | **Corepack** + `package.json` の `packageManager` に **フルバージョン**（例 `pnpm@10.x.x` — 導入時に `pnpm -v` で確定）。ローカルでは `corepack prepare pnpm@<pin> --activate` を README に合わせて実行する |
| ロックファイル | `pnpm-lock.yaml` をコミットし、CI は `--frozen-lockfile` |

## Git / GitHub

| 項目 | 推奨 |
|------|------|
| 既定ブランチ | **`main`** |
| CI トリガー | `push` / `pull_request` を **`main` 向け**（別ブランチ運用なら追加） |
| ブランチ保護（`main`） | PR 必須、**CI 成功をマージ条件**に含める |
| マージ | **Squash merge** を既定にしやすい（チーム方針で変更可） |

## ツールの振る舞い

| 項目 | 推奨 |
|------|------|
| Biome | 最初から **推奨寄りのルール**で開始。format / lint を CI で強制 |
| knip | CI で実行し **失敗でブロック**。最初にベースラインを緑にし、ノイズは **設定で解消**（警告オンリーに逃げない） |
| Vitest / fast-check | CI で `vitest run` を必須。**ダミーでも 1 テスト**を残し、テストランナー破綻に気づけるようにする |
| Lefthook | **pre-commit は Biome のみ**（高速）。knip・全テストは **CI** |
| `pnpm install` の `prepare` | **`CI` または `.git` が無い環境では Lefthook をインストールしない**（コンテナ・ tarball 利用時の失敗を避ける） |

## 依存更新

| 項目 | 推奨 |
|------|------|
| Dependabot | GitHub 標準で **週 1**、`npm`、`directory: "/"` |
| マージ | セキュリティ PR も **CI 緑を確認してから**マージ |

## ドキュメント

| 項目 | 推奨 |
|------|------|
| README | Node 25 + Corepack + `corepack prepare` で pnpm pin、`pnpm install` → `pnpm run validate`。**Unsupported engine** 時は Node 25 へ切り替える旨を記載 |
| 変更時 | ピン止めやポリシーが変わったら **本ファイルと `tech-stack.md` を同期** |

## 任意（あとからでよい）

- `.vscode/extensions.json` で Biome 拡張を推奨
- `npm audit` を CI に常時載せるかは **オプション**（ノイズが大きいなら見送りまたは重大度フィルタ）

## アーキテクチャ（見送り中）

- **FSD / Steiger** — 現時点では導入しない。UI 方針が固まったら別途検討。

## 関連ドキュメント

- `docs/tech-stack.md` — スタック一覧
- `docs/superpowers/specs/2026-05-03-harness-and-tooling-design.md` — ハーネス設計 spec
