# discog-review-log — Application Design

**作成日:** 2026-05-03  
**ステータス:** 確定（実装は別途 implementation plan に委譲）

## Goal

Discogs API を用いた **音楽レビューログ Web アプリ** を提供する。

- **レビュー対象:** レコード / CD（リリース単位、Discogs のリリース ID に紐づける）
- **ライター:** 招待制、最大 10 名程度
- **閲覧:** 一般公開（未ログインでも読める）
- **レビュー内容:** 複数軸スコア（サウンド・歌詞・アートワーク等）＋リッチテキスト本文＋タグ / ジャンル

## Non-goals（本設計の範囲外）

- Discogs OAuth による「Discogs アカウント連携ログイン」
- アプリ内 Discogs 検索（リリース ID 手入力方式を採用）
- 汎用ヘッドレス CMS（データ構造がドメイン固有のため不採用。理由は「主要な設計判断」を参照）
- 本書単体での **インフラプロビジョニング手順の網羅**（Wrangler / Secrets の具体値は実装計画・運用ドキュメントで補う）

## Relationship to the harness phase

先行する **Harness & Guardrails**（`2026-05-03-harness-and-tooling-design.md`）はリポジトリ品質のベースラインである。本仕様は **アプリケーション本体** の形状とスタックを定義する。  
**Vite の採用はハーネス「フェーズ1」の非目標と相反するが、フェーズ移行後のアプリ実装として本書で正式に採用する。** ローカル開発・CI の順序は実装計画でハーネスと統合する。

## Confirmed stack

### Frontend

| 役割 | 採用 |
|------|------|
| UI | React |
| SSR ブリッジ | Inertia.js（`@inertiajs/react`） |
| リッチテキスト | TipTap（ヘッドレス） |
| スタイリング | Tailwind CSS v4 |
| ビルド | Vite |

### Server

| 役割 | 採用 |
|------|------|
| HTTP | Hono |
| Inertia | `@hono/inertia`（公式ミドルウェア） |
| ORM | Drizzle ORM |
| 言語 | TypeScript |

### Infrastructure（Cloudflare・無料枠を前提に設計）

| 役割 | 採用 | 無料枠（目安） |
|------|------|----------------|
| ランタイム | Cloudflare Workers | 10 万 req / 日 など |
| DB | Cloudflare D1（SQLite） | 容量・読取上限に留意 |
| セッション | Cloudflare KV | 読取上限に留意 |
| 静的アセット | Cloudflare Pages | プロジェクト方針に合わせて配信 |

### External API

| 役割 | 採用 |
|------|------|
| メタデータ | Discogs API（**User Token** 認証、サーバーのみ） |

## Repository layout（シングルレポ）

Inertia はサーバーとクライアントを一体として扱う前提のため、**リポジトリ分割は採用しない**。現規模ではモノレポ（pnpm workspace 等）も過剰と判断。

```
project-root/
  src/
    server/       # Hono・ルーティング・ハンドラ・DB アクセス
    client/       # React ページ・コンポーネント
    shared/       # 型・共有バリデーション
  public/
  docs/
  wrangler.toml   # または wrangler.jsonc
  vite.config.ts
  drizzle.config.ts
  package.json
```

## Major design decisions

### 認証

- **Discogs OAuth は使わない。** API はリリース情報取得のみであり、サーバー側の User Token で足りる。
- **ライター・管理者** は独自アカウント。管理者が **招待トークン付きリンク** を発行し、受信者が `/invite/:token` でパスワード設定後にアカウントを有効化する。
- **セッション** は Cloudflare KV に保存し、クライアントには HttpOnly Cookie 等でセッション ID を渡す（具体は実装計画で定義）。**セッションレコードは D1 に持たない。**

### ヘッドレス CMS 不採用

レビューは Discogs 紐付け・複数軸スコア・タグが絡む。**汎用 CMS のスキーマに乗せても Discogs 連携とスコア UI は自前**になり、複雑さだけが増す。本文編集は TipTap、管理画面は自前実装とする。

### Discogs 連携（案 A 採用）

ライターが Discogs のリリース URL 等から **リリース ID を取得**し、作成画面に入力する。サーバーが Discogs API を呼び出し、**D1 の `releases` にキャッシュ**（`cached_at` で鮮度管理）したうえでプレビュー表示し、執筆に進む。

**案 B（アプリ内検索）** はレート制限・実装コストを踏まえ、招待制・小規模の前提では **採用しない**。

### リッチテキスト

TipTap を採用。ヘッドレスにより Tailwind v4 で UI を完全にコントロール可能。保存形式は **v1 では TipTap が出力する HTML をそのまま D1 に保存**する（下記「セキュリティ」でサニタイズを必須とする）。

## Data model（概略）

論理モデル。物理カラム名・索引は Drizzle マイグレーションで確定する。

| テーブル | 用途 |
|----------|------|
| `users` | id, name, email, password_hash, role, invited_by, created_at 等 |
| `invitations` | token, email, expires_at, used_at |
| `releases` | discogs_id, title, artist, year, label, cover_url, cached_at |
| `reviews` | id, user_id, release_id, body_html, status, published_at, created_at |
| `review_scores` | review_id, axis, score（複数軸） |
| `tags` | id, name, slug |
| `review_tags` | review_id, tag_id |

セッション: **KV のみ**（上記以外にセッションテーブルは置かない）。

## Roles & permissions

| 操作 | Writer | Admin |
|------|--------|-------|
| 自分のレビュー 作成・編集・削除 | ✓ | ✓ |
| 自分のレビュー 公開 / 下書き切り替え | ✓ | ✓ |
| 他者のレビュー 編集・削除 | ✗ | ✓ |
| ユーザー招待・権限変更 | ✗ | ✓ |
| タグ / ジャンルマスター管理 | ✗ | ✓ |

## Routes（概略）

### 公開

- `/` — トップ・レビュー一覧
- `/releases/:id` — リリース詳細・レビュー一覧
- `/reviews/:id` — レビュー詳細

### ライター（要ログイン）

- `/dashboard` — マイレビュー一覧
- `/reviews/new` — レビュー作成（Discogs ID 入力 → 執筆）
- `/reviews/:id/edit` — レビュー編集

### 管理者

- `/admin/reviews` — 全レビュー管理
- `/admin/users` — ユーザー・招待
- `/admin/tags` — タグ / ジャンルマスター

## Security

- **パスワード:** 強度の高いハッシュ（実装時は当時のベストプラクティス。例: Argon2id または bcrypt）を用い、平文は保存しない。
- **HTML 本文:** 公開表示前および保存時のいずれかで **許可タグのホワイトリストに基づくサニタイズ** を行い、XSS を防ぐ。TipTap 拡張の追加時は許可リストを見直す。
- **セッション:** KV 上のランダムセッション ID、適切な有効期限・失効。Cookie は `Secure` / `HttpOnly` / `SameSite` を原則付与。
- **招待トークン:** 十分なエントロピー、有効期限、`used_at` による一回限り利用。
- **管理者操作:** 管理者ルートはロール検証をサーバー側で必ず実施（クライアント表示のみに依存しない）。
- **Secrets:** Discogs User Token・セッション署名鍵等は Wrangler Secrets / 環境変数で管理しリポジトリに含めない。

## Error handling & resilience

- **Discogs API 障害・レート制限:** ユーザー向けに分かりやすいエラー表示。リトライはサーバー側で指数バックオフ等を検討（実装計画で詳細化）。キャッシュ済み `releases` があれば参照して読み取り系を継続できる設計を優先。
- **D1 / KV 障害:** 一貫したエラーページまたは Inertia エラーレスポンス。ログは Workers のログ機構に出力。
- **招待メール未送信:** メールがオプションまたは別チャネルの場合、管理者向けに「トークンは発行済みでリンクを手動共有」等のフォールバックを UI で明示できるとよい（任意）。

## Testing strategy

- **単体テスト（Vitest）:** バリデーション、スコア計算、Discogs 応答のマッピング等の純関数を優先。
- **Property-based（fast-check）:** パース・正規化など不変条件が明確な箇所に段階的に導入（ハーネス方針と整合）。
- **結合テスト:** Miniflare / Workers テスト環境の利用は実装計画で判断。最低限、クリティカルな認可パスは自動化を推奨。

## Deferred decisions（実装前に優先度順に確定）

| 項目 | メモ |
|------|------|
| 招待メール | **Resend**（無料枠 3,000 通 / 月など）を第一候補。メール必須か、リンク手動共有のみかで実装が変わる。 |
| カバー画像 | Discogs URL 直参照 vs **R2 キャッシュ**（安定性・規約・コストのトレードオフ）。 |
| 複数軸スコアの軸定義 | **v1 はコードまたはマスタテーブルで固定軸**とし、可変軸が必要になった時点で別設計。 |
| 本文サニタイズ実装 | 利用ライブラリ（例: isomorphic-dompurify 等）は実装時に選定し、許可タグ一覧を本リポジトリに文書化する。 |

## Risks & mitigations

| リスク | 緩和 |
|--------|------|
| Discogs レート制限 | キャッシュ・ID 直接入力方針・必要ならバックオフ |
| HTML 由来 XSS | サニタイズ必須・表示時のエスケープ方針の監査 |
| Workers / D1 の制約 | クエリとインデックス設計、N+1 回避、無料枠モニタリング |

## Approval

本書は 2026-05-03 時点の合意（技術選定ドキュメントおよびレビュー反映）に基づく。変更時は本ファイルを更新し、`docs/tech-stack.md` と整合させる。
