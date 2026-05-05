# フェーズ 8: API デプロイ調査スパイク（Bun 実行環境）

作成日: 2026-05-05  
対象: `apps/api`（Elysia on Bun）

## 1. 目的

フェーズ 8 の成果物として、**Bun を維持した API デプロイ候補**をコスト優先で比較し、一次候補を決定する。

ロードマップ要件:

- アプローチ A（静的 CDN + 別ホスト API）を第一候補として評価
- 単一 VPS 同居を第二候補として評価
- Workers ネイティブのみで Bun を捨てる案は代替・警告付きで記載

## 2. 比較観点

- 月額コスト（最優先）
- Bun での実装/運用難易度
- 運用負荷（監視・デプロイ・障害切り分け）
- 将来フェーズ（DB/認証）への拡張余地

## 3. 候補比較（2026-05-05 時点）

| 候補 | 方式 | コスト観点 | Bun 実行の前提 | リスク/注意 |
|---|---|---|---|---|
| **A-1: Cloudflare Pages + Render Web Service** | 静的 CDN + 別ホスト API | Render は Free/Hobby があり、最小コストで開始しやすい。 | Render は Bun 利用を案内（build: `bun install`, start: `bun ...`）。 | Free 枠はスリープ等の制限あり。将来の常時稼働要件で有料化判断が必要。 |
| A-2: Cloudflare Pages + Railway | 静的 CDN + 別ホスト API | Railway Free は小規模クレジット、継続運用は Hobby($5/月)前提になりやすい。 | Bun は対応可能だが、現状は Dockerfile 運用が前提（Railpack の Bun 自動検出未対応）。 | 小規模でも課金へ寄りやすく、Dockerfile 管理の運用コストが増える。 |
| **B-1: 単一 VPS（例: Hetzner Cost-Optimized）** | 1台で同居（静的 + API） | 低価格の月額固定で予算読みやすい。 | Bun + systemd + 逆プロキシ（Caddy/Nginx）を自前運用。 | OS パッチ、TLS、監視、バックアップを自前で持つ必要があり運用負荷が高い。 |

## 4. 一次決定

### 第一候補（採用）: **アプローチ A-1（Cloudflare Pages + Render Web Service）**

理由:

1. フロント（Pages）と API を分離しつつ、初期コストを低く抑えやすい。
2. Bun を保ったまま運用開始できる（フェーズ 8 の主目的に一致）。
3. 単一 VPS より運用の初期負荷が低い（TLS/インフラ保守の一部をマネージドに寄せられる）。

### 第二候補: **B-1（単一 VPS 同居）**

理由:

- 月額固定でコスト予測はしやすいが、現フェーズでは学習対象が増えすぎる（インフラ運用タスクが重い）。
- フェーズ 9 の「まず `/health` を公開」に対しては、A-1 の方が到達が速い。

## 5. 代替案（警告付き）

### Workers ネイティブへ寄せて Bun を捨てる案（代替）

結論: **代替としては存在するが、現時点では採用しない。**

警告:

- 既存の Elysia/Bun 前提の実装・テスト戦略を変更する必要がある。
- Cloudflare Workers の Node.js 互換は「互換レイヤ」であり、Bun ランタイムそのものではない。
- ロードマップの「Bun 第一」方針から逸脱し、学習スコープが広がりやすい。

## 6. フェーズ 9 への入口（最小）

フェーズ 9 で実施する最小作業（A-1 前提）:

1. Render に `apps/api` をデプロイし、公開 URL を取得する。
2. `GET /health` が 200 かつ `{"status":"ok"}` を返すことを確認する。
3. 最低限の監視導線（Render ログ確認手順）を README または運用メモに残す。

## 7. 完了判定（フェーズ 8）

- [x] 候補比較表を作成した（コスト優先）
- [x] アプローチ A を第一候補として一次決定した
- [x] 単一 VPS 同居を第二候補として評価した
- [x] Workers ネイティブ案を代替・警告付きで記載した

## 8. 参照

- Bun on Render: <https://bun.sh/docs/guides/deployment/render>
- Render pricing: <https://docs.render.com/pricing>
- Railway Bun guide: <https://docs.railway.com/guides/bun>
- Railway pricing: <https://docs.railway.com/reference/pricing>
- Hetzner Cost-Optimized: <https://www.hetzner.com/cloud/cost-optimized>
- Cloudflare Workers Node.js compatibility: <https://developers.cloudflare.com/workers/runtime-apis/nodejs/>
