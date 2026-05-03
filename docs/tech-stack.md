# Tech stack (discog-review-log)

Living notes for **tooling and runtime intent**. Update when decisions change.

## Quality baseline (all phases)

| Area               | Choice                                   |
| ------------------ | ---------------------------------------- |
| Package manager    | pnpm                                     |
| Language           | TypeScript (`strict`)                    |
| Format / lint      | Biome                                    |
| Git hooks          | Lefthook                                 |
| Tests              | Vitest + **fast-check** (property-based) |
| Unused code / deps | **knip**                                 |
| CI                 | GitHub Actions                           |

Harness-first の経緯とディレクトリターゲットは **`docs/superpowers/specs/2026-05-03-harness-and-tooling-design.md`** を参照。

## Application runtime（確定）

Web アプリ本体の設計は **`docs/superpowers/specs/2026-05-03-discog-review-log-design.md`** がソースオブトゥルース。

| Area            | Choice |
| --------------- | ------ |
| Runtime / host  | Cloudflare Workers |
| DB              | Cloudflare D1（Drizzle ORM） |
| Sessions        | Cloudflare KV |
| HTTP / Inertia  | Hono + `@hono/inertia` |
| Frontend        | React + Inertia + Vite |
| Styling         | Tailwind CSS v4 |
| Rich text       | TipTap |
| External API    | Discogs API（サーバー側 User Token） |
| Static assets   | Cloudflare Pages（方針に沿って配信） |

**FSD / Steiger** は引き続き未採用（`docs/harness-decisions.md`）。必要なら別 spec で検討する。

## Operational defaults

Pinned versions, CI policy, Dependabot, and hook behavior: **[docs/harness-decisions.md](./harness-decisions.md)** (update when those change).

Summary: **Node 25.x** (pin via `.node-version`; not an LTS release line), **pnpm via Corepack + `packageManager` + `corepack prepare`**, default branch **main**, Biome + knip + tests in CI. Lefthook on pre-commit; **`prepare` installs hooks only when not in CI and `.git` exists**.

## Specs and plans

- Designs: `docs/superpowers/specs/`
- Implementation plans: `docs/superpowers/plans/`
- Harness decision log: `docs/harness-decisions.md`

