# Tech stack (discog-review-log)

Living notes for **tooling and runtime intent**. Update when decisions change.

## Current phase: harness → フルスタック移行中

ハーネスを維持しつつ、**Bun workspace + Elysia API + Astro フロント**を段階的に追加。
ロードマップ: `docs/superpowers/specs/2026-05-05-full-stack-incremental-roadmap-design.md`

| Area               | Choice                                      |
| ------------------ | ------------------------------------------- |
| Package manager    | **Bun**（フェーズ 1〜、旧: pnpm）           |
| Language           | TypeScript (`strict`)                       |
| Format / lint      | Biome                                       |
| Git hooks          | Lefthook                                    |
| Tests              | Vitest + **fast-check**（root）、**bun:test**（apps/api〜） |
| Unused code / deps | **knip**                                    |
| CI                 | GitHub Actions                              |
| API（予定）        | Elysia on Bun                               |
| フロント           | Astro + SolidJS + **Tailwind v4**（`@tailwindcss/vite`）・ルート `overrides.vite: ^7.3.2` で Vite 8 持ち上げを防ぐ（[withastro/astro#16542](https://github.com/withastro/astro/issues/16542)）・Biome `css.parser.tailwindDirectives` |
| ローカル dev 結線 | Astro（Vite）`server.proxy`: ブラウザは `/api/*` のみ使用 → `http://127.0.0.1:3000/*`（フェーズ 5・CORS 不要） |


## Application runtime

**TBD** — to be filled when the product shape (CLI, API, worker, etc.) is decided. Bundler choice (if any) will be recorded here then.

## Operational defaults

Pinned versions, CI policy, Dependabot, and hook behavior: **[docs/harness-decisions.md](./harness-decisions.md)** (update when those change).

Summary: **Bun**（パッケージマネージャ + ランタイム）、**TypeScript strict**、Biome + knip + tests in CI。Lefthook on pre-commit。フェーズ 1 以降は `bun install` / `bun run validate`。

## Specs and plans

- Designs: `docs/superpowers/specs/`
- Implementation plans: `docs/superpowers/plans/`
- Harness decision log: `docs/harness-decisions.md`

