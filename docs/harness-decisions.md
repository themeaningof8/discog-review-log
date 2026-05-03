# ハーネス関連の意思決定（推奨デフォルト）

実装・CI・運用でブレないようにするための推奨。変更したら本ファイルと `docs/tech-stack.md` を更新する。

## ランタイムとパッケージマネージャ

| 項目 | 推奨 |
|------|------|
| Node | **22.x（Active LTS）** — 採用時点の最新マイナー／パッチに pin（例: `.node-version` に `22.14.0`） |
| `engines` | `package.json` に `"node": ">=22 <23"` など、上記と整合させる |
| pnpm | **Corepack** + `package.json` の `packageManager` に **フルバージョン**（例 `pnpm@10.x.x` — 導入時に `pnpm -v` で確定） |
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

## 依存更新

| 項目 | 推奨 |
|------|------|
| Dependabot | GitHub 標準で **週 1**、`npm`、`directory: "/"` |
| マージ | セキュリティ PR も **CI 緑を確認してから**マージ |

## ドキュメント

| 項目 | 推奨 |
|------|------|
| README | Node 22 + Corepack + pnpm、`pnpm install` → 検証用スクリプト（実装後の名前に合わせる）を **短く記載** |
| 変更時 | ピン止めやポリシーが変わったら **本ファイルと `tech-stack.md` を同期** |

## 任意（あとからでよい）

- `.vscode/extensions.json` で Biome 拡張を推奨
- `npm audit` を CI に常時載せるかは **オプション**（ノイズが大きいなら見送りまたは重大度フィルタ）

## アーキテクチャ（見送り中）

- **FSD / Steiger** — 現時点では導入しない。UI 方針が固まったら別途検討。

## 関連ドキュメント

- `docs/tech-stack.md` — スタック一覧
- `docs/superpowers/specs/2026-05-03-harness-and-tooling-design.md` — ハーネス設計 spec
