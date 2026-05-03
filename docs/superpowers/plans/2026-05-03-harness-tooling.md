# Harness Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a working TypeScript harness with pnpm, Biome, Lefthook, Vitest, fast-check, knip, and GitHub Actions CI matching `docs/superpowers/specs/2026-05-03-harness-and-tooling-design.md` and `docs/harness-decisions.md` (no Vite).

> **Note:** Keep the Node major in this plan aligned with **`.node-version`** (currently **25**). When bumping Node, update embedded values here together with `package.json` → `engines`, `@types/node`, and **`mise.toml`** (if present).

**Architecture:** Single Node package under repository root. Source in `src/` with one exported helper for tests. Vitest runs co-located `*.test.ts`. Biome owns format/lint; `tsc --noEmit` is type truth. Knip validates unused files/deps. Lefthook runs Biome on staged files only.

**Tech Stack:** Node 25.x, pnpm 10.33.2 (pinned via `packageManager`), TypeScript 6.0.3, @biomejs/biome 2.4.14, lefthook 2.1.6, vitest 4.1.5, fast-check 4.7.0, knip 6.11.0, @types/node 25.x

---

## File map

| Path | Responsibility |
|------|------------------|
| `package.json` | Scripts (`check`, `typecheck`, `test`, `knip`, `prepare`), `engines`, `packageManager`, dependencies |
| `.node-version` | Pin Node 25 for local + `setup-node` |
| `mise.toml` | (Optional) Local tool versions; keep `node` in sync with `.node-version` / `engines` |
| `tsconfig.json` | `strict`, include `src` and `vitest.config.ts` |
| `vitest.config.ts` | Vitest `node` environment, `src/**/*.test.ts` |
| `biome.json` | Biome formatter/linter project config |
| `lefthook.yml` | `pre-commit` Biome on staged files |
| `knip.json` | Entry/project globs for analysis |
| `src/index.ts` | Minimal exported API (`add`) |
| `src/index.test.ts` | Example assertion + one fast-check property |
| `.github/workflows/ci.yml` | CI job order per spec |
| `.github/dependabot.yml` | Weekly npm updates |
| `.gitignore` | `node_modules`, coverage, OS junk |
| `README.md` | Setup and verification commands |

---

### Task 1: Repository hygiene and Node pin

**Files:**
- Create: `.gitignore`
- Create: `.node-version`

- [ ] **Step 1: Add `.gitignore`**

Create `.gitignore`:

```
node_modules/
coverage/
dist/
.DS_Store
*.log
.env
.env.*
```

- [ ] **Step 2: Add `.node-version`**

Create `.node-version` with exactly (pin patch so CI/mise match `@types/node`; currently):

```
25.6.0
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore .node-version
git commit -m "chore: add gitignore and Node 25 pin"
```

---

### Task 2: `package.json` with pinned pnpm and scripts

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create `package.json`**

Create `package.json`:

```json
{
  "name": "discog-review-log",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.33.2",
  "engines": {
    "node": ">=25 <26"
  },
  "scripts": {
    "prepare": "lefthook install",
    "check": "biome check .",
    "check:ci": "biome ci .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "knip": "knip",
    "validate": "pnpm run check:ci && pnpm run typecheck && pnpm run test && pnpm run knip"
  }
}
```

- [ ] **Step 2: Enable Corepack and install devDependencies**

Run:

```bash
corepack enable
corepack prepare pnpm@10.33.2 --activate
pnpm add -D typescript@6.0.3 @types/node@25 @biomejs/biome@2.4.14 lefthook@2.1.6 vitest@4.1.5 fast-check@4.7.0 knip@6.11.0
```

Expected: `pnpm-lock.yaml` created, `package.json` updated with `devDependencies`.

- [ ] **Step 3: Commit lockfile and manifest**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: init package.json and pnpm lockfile"
```

---

### Task 3: TypeScript config

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Add `tsconfig.json`**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "vitest.config.ts"]
}
```

- [ ] **Step 2: Verify typecheck passes on empty tree**

Run:

```bash
mkdir -p src
```

Create minimal `src/index.ts` temporarily with `export {};` OR proceed to Task 4 immediately — if you added `export {}` only for this step, run:

```bash
pnpm exec tsc --noEmit
```

Expected: exits `0`. If `src/index.ts` missing, create `src/index.ts` with:

```ts
export {};
```

then rerun `pnpm exec tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json src/index.ts
git commit -m "chore: add TypeScript config"
```

---

### Task 4: Source module (`add`)

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Replace `src/index.ts` content**

Replace contents of `src/index.ts` with:

```ts
export function add(a: number, b: number): number {
  return a + b;
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: exit code `0`.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add minimal add() for harness tests"
```

---

### Task 5: Vitest config

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Extend `tsconfig.json` include**

Ensure `tsconfig.json` `"include"` array contains both `"src/**/*.ts"` and `"vitest.config.ts"` (already true from Task 3). No change needed if unchanged.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add Vitest config"
```

---

### Task 6: Tests (example + fast-check smoke)

**Files:**
- Create: `src/index.test.ts`

- [ ] **Step 1: Write `src/index.test.ts`**

Create `src/index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { add } from "./index.js";

describe("add", () => {
  it("adds small integers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("matches addition for integers (property)", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => add(a, b) === a + b),
    );
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
pnpm run test
```

Expected: Vitest reports `2` tests passed.

- [ ] **Step 3: Commit**

```bash
git add src/index.test.ts
git commit -m "test: add example and fast-check smoke tests"
```

---

### Task 7: Biome

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Initialize Biome config**

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.14/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

- [ ] **Step 2: Format and lint**

Run:

```bash
pnpm exec biome check --write .
pnpm run check:ci
```

Expected: exit code `0`. If Biome reformats files, review diff then continue.

- [ ] **Step 3: Commit**

```bash
git add biome.json .
git commit -m "chore: add Biome configuration"
```

---

### Task 8: Lefthook

**Files:**
- Create: `lefthook.yml`

- [ ] **Step 1: Create `lefthook.yml`**

Create `lefthook.yml`:

```yaml
pre-commit:
  commands:
    biome:
      glob: "*.{js,ts,cjs,mjs,jsx,tsx,json,jsonc,yml,yaml,md}"
      run: pnpm exec biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
```

- [ ] **Step 2: Install hooks**

Run:

```bash
pnpm exec lefthook install
```

Expected: Lefthook reports hooks installed (path under `.git/hooks`).

- [ ] **Step 3: Commit**

```bash
git add lefthook.yml
git commit -m "chore: add Lefthook pre-commit Biome"
```

---

### Task 9: Knip

**Files:**
- Create: `knip.json`

- [ ] **Step 1: Create `knip.json`**

Create `knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts", "vitest.config.ts"]
}
```

- [ ] **Step 2: Run knip**

Run:

```bash
pnpm run knip
```

Expected: exit code `0`. If knip reports unused `fast-check` or devDependencies, adjust — with the tests above, `fast-check` and Vitest deps should be used. If knip complains about config files, add them under `project` array.

- [ ] **Step 3: Commit**

```bash
git add knip.json
git commit -m "chore: add knip configuration"
```

---

### Task 10: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: pnpm

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Biome (CI)
        run: pnpm run check:ci

      - name: Typecheck
        run: pnpm run typecheck

      - name: Test
        run: pnpm run test

      - name: Knip
        run: pnpm run knip
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
```

---

### Task 11: Dependabot

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Create Dependabot config**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
```

- [ ] **Step 2: Commit**

```bash
git add .github/dependabot.yml
git commit -m "chore: add weekly Dependabot for npm"
```

---

### Task 12: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

Create `README.md`:

```markdown
# discog-review-log

## Prerequisites

- Node **25** (see `.node-version`)
- [Corepack](https://nodejs.org/api/corepack.html) enabled (`corepack enable`)
- **pnpm** via Corepack (version pinned in `package.json` → `packageManager`)

## Setup

```bash
corepack enable
pnpm install
```

Git hooks (Lefthook) install on `pnpm install` via the `prepare` script.

## Checks

```bash
pnpm run validate
```

Runs Biome (`ci` mode), TypeScript `noEmit`, Vitest, and knip — same gates as CI.

Individual scripts: `pnpm run check`, `pnpm run check:ci`, `pnpm run typecheck`, `pnpm run test`, `pnpm run knip`.

## Documentation

- Stack overview: `docs/tech-stack.md`
- Harness decisions (pins and policy): `docs/harness-decisions.md`
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup and validate commands"
```

---

### Task 13: Final local validation

**Files:**
- None (verification only)

- [ ] **Step 1: Run full validate**

Run:

```bash
pnpm run validate
```

Expected: all steps succeed with exit code `0`.

- [ ] **Step 2: Optional — sync docs pins**

If any installed version differs from this plan (for example `@types/node` minor), update **`docs/harness-decisions.md`** only if you change policy; devDependency minors need not be mirrored unless your team tracks them there.

- [ ] **Step 3: Commit any remaining Biome formatting**

```bash
pnpm exec biome check --write .
git status
```

If clean, no commit. If changes, `git add` and `git commit -m "chore: apply Biome format"`.

---

## Self-review (plan vs spec)

| Spec item | Covered by |
|-----------|------------|
| pnpm + `packageManager` / frozen lockfile | Task 2, Task 10 |
| TypeScript strict + `tsc --noEmit` | Task 3, CI |
| Biome | Task 7, Task 8, CI |
| Lefthook (no Husky) | Task 8 |
| Vitest + fast-check | Task 5–6 |
| knip in CI | Task 9, CI |
| CI order: biome → typecheck → test → knip | Task 10 |
| Minimal `src` + smoke tests | Task 4–6 |
| No Vite | Absent from plan |
| Dependabot weekly | Task 11 |
| README setup | Task 12 |

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-harness-tooling.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
