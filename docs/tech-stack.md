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
| フロント           | Astro + SolidJS（フェーズ 3 導入済み）・Tailwind v4 はフェーズ 4 |


## Application runtime

**TBD** — to be filled when the product shape (CLI, API, worker, etc.) is decided. Bundler choice (if any) will be recorded here then.

## Operational defaults

Pinned versions, CI policy, Dependabot, and hook behavior: **[docs/harness-decisions.md](./harness-decisions.md)** (update when those change).

Summary: **Bun**（パッケージマネージャ + ランタイム）、**TypeScript strict**、Biome + knip + tests in CI。Lefthook on pre-commit。フェーズ 1 以降は `bun install` / `bun run validate`。

## Specs and plans

- Designs: `docs/superpowers/specs/`
- Implementation plans: `docs/superpowers/plans/`
- Harness decision log: `docs/harness-decisions.md`

