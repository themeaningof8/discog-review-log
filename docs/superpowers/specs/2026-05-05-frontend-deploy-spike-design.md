# フェーズ 6: フロントデプロイ調査スパイク（設計メモ）

作成日: 2026-05-05  
対象: `apps/web`（Astro static build の `dist` 配信先）

## 1. 目的

フェーズ 6 の成果物として、静的ホスティング候補を **コスト最優先** で比較し、フェーズ 7 の一次決定を行う。

比較軸（ロードマップ準拠）:

- 無料枠
- カスタムドメイン
- ビルド制限
- 環境変数

## 2. 候補比較（2026-05-05 時点）

| 候補 | 無料枠 | カスタムドメイン | ビルド制限 | 環境変数 |
|---|---|---|---|---|
| Cloudflare Pages | Free あり。無料枠で運用可能。 | 1プロジェクトあたり最大 100 ドメイン（Pages limits）。 | Free: 月 500 builds、同時ビルド 1、ビルド時間上限 20 分。 | Pages 設定で利用可能。上限の明示値は今回取得できず（追加確認タスク化）。 |
| Netlify (Free) | Free あり。 | Free で custom domain + SSL 可。 | Free: 月 300 build minutes。 | UI/CLI/API 管理可。key 255 文字、value 5000 文字。コンテキスト別値も設定可。 |
| Vercel (Hobby) | Hobby (Free) あり。 | 1プロジェクトあたり 50 ドメイン。 | 月 6000 build execution minutes、1日 100 deploy。 | 管理機能あり。実運用上限は 64KB/deployment（サポート記事）、Edge はより厳しい制約あり。 |

## 3. 一次決定（フェーズ 7 へ）

**第一候補: Cloudflare Pages**

理由:

1. 無料枠内での静的配信が現実的（フェーズ 7 の要件に十分）。
2. カスタムドメイン上限が大きく、将来の検証余地が広い。
3. 将来フェーズで Cloudflare 周辺（Workers など）へ寄せる余地がある。

## 4. 懸念とフォローアップ

- Cloudflare Pages の環境変数「上限値（件数/サイズ）」を公式ドキュメントで明示確認できていない。  
  → フェーズ 7 着手前に公式ドキュメント再確認（またはダッシュボード上での設定検証）を実施。

## 5. フェーズ 6 完了判定

- [x] 候補 2〜3 の短い比較表を作成した。
- [x] 一次決定（Cloudflare Pages 第一候補）を記録した。
- [x] 「決めきれない場合の理由」ではなく、今回は一次決定を採用した。

## 6. 参照（公式ドキュメント）

- Cloudflare Pages limits: <https://developers.cloudflare.com/pages/platform/limits/>
- Cloudflare Pages custom domains: <https://developers.cloudflare.com/pages/configuration/custom-domains/>
- Netlify pricing: <https://www.netlify.com/pricing/>
- Netlify env vars overview: <https://docs.netlify.com/environment-variables/overview/>
- Vercel Hobby plan: <https://vercel.com/docs/accounts/plans/hobby>
- Vercel limits: <https://vercel.com/docs/v2/platform/limits>
