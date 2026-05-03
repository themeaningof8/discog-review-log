# discog-review-log Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Cloudflare Workers + Hono + Inertia + React app described in `docs/superpowers/specs/2026-05-03-discog-review-log-design.md`: invite-only writers, public reads, Discogs-backed releases cached in D1, KV sessions, TipTap HTML stored in D1 with sanitization.

**Architecture:** Use **@cloudflare/vite-plugin** + **Vite 8** so one dev server builds the client and runs the Worker locally (same pattern as [yusukebe/hono-inertia-example](https://github.com/yusukebe/hono-inertia-example)). Server code lives under `src/server/` (`worker.ts` default-exports the app). React pages live under `src/client/pages/` and are resolved by `@hono/inertia/vite` (`inertiaPages()`). D1 holds relational data; KV holds opaque session blobs keyed by cookie id. Discogs calls run only on the server using a **secret** token.

**Tech Stack:** Hono `^4.12.16`, `@hono/inertia` `^0.2.0`, `@inertiajs/react` `^3.0.3`, React `^19.2.5`, Vite `^8.0.10`, Wrangler `^4.87.0`, `@cloudflare/vite-plugin` `^1.35.0`, `vite-ssr-components` `^0.6.1`, Drizzle ORM `^0.45.2`, `zod`, `sanitize-html`, Web Crypto PBKDF2 for passwords (Workers-native), Tailwind CSS v4 (`@tailwindcss/vite` `^4.2.4`), TipTap (editor tasks).

> **Node:** Keep `.node-version` / `engines` / `@types/node` aligned with the repo (currently **25.x**). Bump embedded literals here when those pins change.

---

## Execution checkpoints

Stop and run `pnpm run validate` after **Checkpoint A** (scaffold works), **Checkpoint B** (DB migrated), **Checkpoint C** (login works). Deploy to a staging Worker only after **Checkpoint D** (first published review readable publicly).

---

## File map (target)


| Path                               | Responsibility                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `wrangler.jsonc`                   | Worker name, `main`, `compatibility_date`, D1 + KV bindings                                           |
| `vite.config.ts`                   | `cloudflare()`, `inertiaPages()`, `vite-ssr-components` plugin, Tailwind plugin, resolve aliases      |
| `src/server/worker.ts`             | Cloudflare Worker default export; mounts env bindings                                                 |
| `src/server/app.ts`                | `new Hono<{ Bindings: Env }>()`, middleware stack, route mounting                                     |
| `src/server/root-view.tsx`         | `@hono/inertia` RootView — HTML shell, `ViteClient`, `@inertia` body injection                        |
| `src/server/ssr.tsx`               | `renderPage` helper pairing vite-ssr-components with client pages (follow upstream example structure) |
| `src/server/middleware/session.ts` | Parse cookie → KV session → attach `user` to context                                                  |
| `src/server/middleware/auth.ts`    | Require login / require admin                                                                         |
| `src/server/lib/password.ts`       | PBKDF2 hash + verify (Web Crypto; Workers-compatible)                                                  |
| `src/server/lib/sanitizeHtml.ts`   | Wrap `sanitize-html` with allowlist for TipTap output                                                 |
| `src/server/lib/discogs.ts`        | Fetch `/releases/:id`, map JSON → `Release` row shape                                                 |
| `src/server/db/schema.ts`          | Drizzle schema (`users`, `invitations`, `releases`, `reviews`, …)                                     |
| `src/server/db/client.ts`          | `drizzle(d1, { schema })` factory                                                                     |
| `src/server/routes/public.tsx`     | `/`, `/releases/:id`, `/reviews/:id`                                                                  |
| `src/server/routes/auth.tsx`       | `/login`, `/logout`, `/invite/:token`                                                                 |
| `src/server/routes/reviews.tsx`    | Writer dashboard + new/edit review                                                                    |
| `src/server/routes/admin.tsx`      | Admin-only CRUD surfaces                                                                              |
| `src/client/pages/**/*.tsx`        | Inertia pages (`Home`, `Reviews/New`, …)                                                              |
| `src/client/app.tsx`               | `createInertiaApp` bootstrap                                                                          |
| `src/shared/**/*.ts`               | Zod schemas + pure helpers tested by Vitest                                                           |
| `drizzle/`                         | Generated SQL migrations (`pnpm exec drizzle-kit generate`)                                           |
| `package.json`                     | Scripts: `dev`, `build`, `deploy`, `db:migrate:local`, `types`, `validate`                            |


---

### Task 1: Dependencies and scripts

**Files:**

- Modify: `package.json`
- **Step 1: Add runtime and tooling dependencies**

Run (versions pinned to avoid drift during execution):

```bash
pnpm add hono@4.12.16 @hono/inertia@0.2.0 @hono/react-renderer@1.0.1 @hono/zod-validator@0.7.6 @inertiajs/react@3.0.3 react@19.2.5 react-dom@19.2.5 zod@4.3.6 drizzle-orm@0.45.2 sanitize-html@2.17.0
pnpm add -D wrangler@4.87.0 @cloudflare/vite-plugin@1.35.0 vite@8.0.10 @types/react@19.2.5 @types/react-dom@19.2.3 vite-ssr-components@0.6.1 drizzle-kit@0.31.8 @tailwindcss/vite@4.2.4 tailwindcss@4.2.4 @tiptap/react@3.13.0 @tiptap/starter-kit@3.13.0 @cloudflare/workers-types@4.20250505.0
```

Expected: `pnpm-lock.yaml` updates; if any peer warns, resolve by aligning `@tiptap/pm` per TipTap docs.

- **Step 2: Extend `package.json` scripts**

Merge into existing `scripts` (keep `validate` chain including Biome — extend `typecheck` when tsconfigs split):

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "pnpm run build && vite preview",
    "deploy": "pnpm run build && wrangler deploy",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply discog-review-log --local",
    "db:migrate:remote": "wrangler d1 migrations apply discog-review-log --remote"
  }
}
```

- **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(app): add Workers, Vite, Hono, Inertia, Drizzle dependencies"
```

---

### Task 2: Wrangler configuration (D1 + KV)

**Files:**

- Create: `wrangler.jsonc`
- **Step 1: Create `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "discog-review-log",
  "compatibility_date": "2025-11-01",
  "main": "./src/server/worker.ts",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "discog-review-log",
      "database_id": "local-dev-placeholder"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "local-dev-kv-placeholder"
    }
  ]
}
```

After first `wrangler d1 create discog-review-log` and `wrangler kv:namespace create SESSIONS`, replace placeholder IDs in **non-committed** `wrangler.toml.local` override **or** document in README that developers copy bindings from Wrangler output into their own `wrangler.jsonc` (do not commit secrets). For CI, use Wrangler environments documented separately.

- **Step 2: Commit**

```bash
git add wrangler.jsonc
git commit -m "chore(cf): add wrangler config with D1 and KV bindings"
```

---

### Task 3: TypeScript config for React + Workers

**Files:**

- Modify: `tsconfig.json`
- Create: `tsconfig.node.json` (optional for vite config isolation)
- **Step 1: Replace root `tsconfig.json`**

Use a single strict config covering server TSX, client TSX, shared TS:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "types": ["node", "@cloudflare/workers-types"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts", "vitest.config.ts"]
}
```

- **Step 2: Run typecheck**

```bash
pnpm exec tsc --noEmit
```

Expected: may fail until Task 4 adds `src/server/worker.ts` — if so, proceed immediately to Task 4 without committing this step alone.

- **Step 3: Commit** (only when `tsc` passes or worker stub exists)

```bash
git add tsconfig.json
git commit -m "chore(ts): enable JSX and Workers types for app code"
```

---

### Task 4: Vite + Cloudflare plugin + Inertia pages discovery

**Files:**

- Create: `vite.config.ts`
- **Step 1: Create `vite.config.ts`**

```ts
import { cloudflare } from "@cloudflare/vite-plugin";
import { inertiaPages } from "@hono/inertia/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [tailwindcss(), inertiaPages(), cloudflare(), ssrPlugin()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
});
```

- **Step 2: Verify Vite resolves**

```bash
pnpm exec vite build --mode development 2>&1 | head -40
```

Expected: fails until worker entry exists — continue to Task 5 after adding minimal worker.

- **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: add Vite config with Cloudflare and Inertia plugins"
```

---

### Task 5: Minimal Worker + Hono + Inertia hello page

**Files:**

- Create: `src/server/worker.ts`
- Create: `src/server/app.ts`
- Create: `src/server/root-view.tsx`
- Create: `src/server/ssr.tsx`
- Create: `src/client/app.tsx`
- Create: `src/client/pages/Home.tsx`
- **Step 1: Implement `src/server/ssr.tsx`**

Adapt upstream [`app/ssr.tsx`](https://github.com/yusukebe/hono-inertia-example/blob/main/app/ssr.tsx): change the glob to `import.meta.glob<{ default: ResolvedComponent }>("../client/pages/**/*.tsx")` and resolve keys as `` `../client/pages/${name}.tsx` ``. Keep `createInertiaApp`, `renderToString`, and `resolve` logic identical to upstream so `renderPage(page)` returns the same shape `root-view.tsx` expects.

- **Step 2: Implement `src/server/root-view.tsx`**

Adapt upstream [`app/root-view.tsx`](https://github.com/yusukebe/hono-inertia-example/blob/main/app/root-view.tsx) verbatim except import paths. Export `rootView` as `RootView` from `@hono/inertia`. Include `Link`, `Script`, `ViteClient` from `vite-ssr-components/react`.

- **Step 3: Implement `src/server/app.ts`**

```ts
import { Hono } from "hono";
import { inertia } from "@hono/inertia";
import { rootView } from "./root-view";

export function createApp() {
  const app = new Hono();
  app.use(inertia({ rootView, version: "1" }));
  app.get("/", (c) => c.render("Home", { message: "discog-review-log" }));
  return app;
}
```

- **Step 4: Implement `src/server/worker.ts`**

```ts
import { createApp } from "./app";

export default createApp();
```

- **Step 5: Implement `src/client/app.tsx`**

Standard `createInertiaApp` from `@inertiajs/react` resolving `./pages/${name}.tsx`.

- **Step 6: Implement `src/client/pages/Home.tsx`**

```tsx
export default function Home({ message }: { message: string }) {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-semibold">{message}</h1>
    </main>
  );
}
```

- **Step 7: Remove obsolete harness module**

Delete `src/index.ts` and `src/index.test.ts` — new tests land in Task 9 onward (update `vitest.config.ts` / knip in Task 17 if globs break).

- **Step 8: Run dev**

```bash
pnpm run dev
```

Expected: Vite dev server starts; opening `/` returns HTML including Inertia payload for `Home`.

- **Step 9: Commit**

```bash
git add src/server src/client vite.config.ts tsconfig.json
git rm -f src/index.ts src/index.test.ts 2>/dev/null || true
git commit -m "feat(app): boot Hono + Inertia hello page on Workers"
```

**Checkpoint A:** `pnpm run dev` loads `/` without runtime errors.

---

### Task 6: Tailwind v4 baseline

**Files:**

- Create: `src/client/styles.css`
- Modify: `src/server/root-view.tsx` (import stylesheet link if required by Tailwind + Vite setup)
- **Step 1: Create `src/client/styles.css`**

```css
@import "tailwindcss";
```

- **Step 2: Import CSS from client entry**

In `src/client/app.tsx`, add `import "./styles.css";` before `createInertiaApp`.

- **Step 3: Commit**

```bash
git add src/client/styles.css src/client/app.tsx
git commit -m "feat(ui): add Tailwind CSS v4 baseline"
```

---

### Task 7: Drizzle schema and first migration

**Files:**

- Create: `drizzle.config.ts`
- Create: `src/server/db/schema.ts`
- Create: `src/server/db/client.ts`
- Generated: `drizzle/*.sql` (via drizzle-kit)
- **Step 1: Add `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
```

- **Step 2: Implement `src/server/db/schema.ts`**

Define tables matching the design spec:

- `users`: `id` text pk uuid, `email` unique, `name`, `passwordHash`, `role` enum `writer|admin`, `invitedBy` nullable fk users.id, timestamps.
- `invitations`: `token` unique, `email`, `expiresAt`, `usedAt` nullable.
- `releases`: `id` integer pk autoincrement, `discogsId` unique integer, `title`, `artist`, `year` nullable, `label` nullable, `coverUrl` nullable, `cachedAt` integer.
- `reviews`: `id` text pk uuid, `userId` fk, `releaseId` fk releases, `bodyHtml` text, `status` `draft|published`, `publishedAt` nullable, `createdAt`, `updatedAt`.
- `reviewScores`: composite pk `(reviewId, axis)` with `axis` text, `score` integer 0–10 (validate in app).
- `tags`: `id`, `slug` unique, `name`.
- `reviewTags`: composite pk.

Use `sqliteTable` from `drizzle-orm/sqlite-core`.

- **Step 3: Implement `src/server/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

- **Step 4: Generate SQL migration**

```bash
pnpm exec drizzle-kit generate --name init
pnpm run db:migrate:local
```

Expected: migration applies to local D1; `wrangler d1 migrations list discog-review-log --local` shows applied.

- **Step 5: Commit**

```bash
git add drizzle.config.ts src/server/db drizzle
git commit -m "feat(db): add Drizzle schema and initial D1 migration"
```

**Checkpoint B:** Local D1 has tables.

---

### Task 8: Bind D1 to Hono context

**Files:**

- Modify: `src/server/worker.ts`
- Modify: `src/server/app.ts`
- **Step 1: Type `Env`**

Create `src/server/types.ts`:

```ts
export type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  DISCOGS_USER_TOKEN: string;
  APP_SECRET: string;
};
```

- **Step 2: Mount DB on context**

Use `Hono<{ Bindings: Env }>` and middleware:

```ts
import { createMiddleware } from "hono/factory";
import { createDb } from "./db/client";

export const dbMiddleware = createMiddleware(async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});
```

Extend Hono variable map with `db` typing via `declare module "hono"` if needed.

- **Step 3: Commit**

```bash
git add src/server/types.ts src/server/app.ts src/server/worker.ts
git commit -m "feat(server): bind D1 drizzle client to request context"
```

---

### Task 9: Password hashing utilities + tests

**Files:**

- Create: `src/server/lib/password.ts`
- Create: `src/server/lib/password.test.ts`

- **Step 1: Implement `hashPassword` / `verifyPassword` with Web Crypto PBKDF2**

Workers-compatible (no `Buffer`, no WASM). Stored string: `pbkdf2$sha256$<iterations>$<saltB64url>$<keyB64url>`.

```ts
const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function b64urlEncode(u8: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = "===".slice((s.length + 3) % 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)!;
  return out;
}

async function deriveKey(
  plain: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    baseKey,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(plain, salt, ITERATIONS);
  return `pbkdf2$sha256$${ITERATIONS}$${b64urlEncode(salt)}$${b64urlEncode(key)}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }
  const iterations = Number(parts[2]);
  if (!Number.isFinite(iterations)) return false;
  const salt = b64urlDecode(parts[3]!);
  const expected = b64urlDecode(parts[4]!);
  const actual = await deriveKey(plain, salt, iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i]! ^ expected[i]!;
  return diff === 0;
}
```

- **Step 2: Write Vitest** in `src/server/lib/password.test.ts` importing `./password.js`.

- **Step 3: Run tests**

```bash
pnpm run test
```

Expected: pass.

- **Step 4: Commit**

```bash
git add src/server/lib/password.ts src/server/lib/password.test.ts
git commit -m "feat(auth): add PBKDF2 password helpers with tests"
```

---

### Task 10: HTML sanitization helper + tests

**Files:**

- Create: `src/server/lib/sanitizeHtml.ts`
- Create: `src/server/lib/sanitizeHtml.test.ts`
- **Step 1: Implement allowlisted sanitize**

```ts
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "blockquote", "h2", "h3"];
const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "name", "target", "rel"],
};

export function sanitizeReviewHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}
```

- **Step 2: Test strips script**

```ts
import { describe, expect, it } from "vitest";
import { sanitizeReviewHtml } from "./sanitizeHtml";

describe("sanitizeReviewHtml", () => {
  it("drops script tags", () => {
    const out = sanitizeReviewHtml("<p>hi</p><script>alert(1)</script>");
    expect(out).not.toContain("script");
    expect(out).toContain("<p>");
  });
});
```

- **Step 3: Commit**

```bash
git add src/server/lib/sanitizeHtml.ts src/server/lib/sanitizeHtml.test.ts
git commit -m "feat(security): add review HTML allowlist sanitizer"
```

---

### Task 11: Session middleware (KV)

**Files:**

- Create: `src/server/lib/session-cookie.ts`
- Create: `src/server/middleware/session.ts`

- **Step 1: Session payload in KV**

Key: random id (`crypto.randomUUID()`). Value: JSON `{"userId":"…","role":"writer"|"admin","expiresAt":<unix ms>}`. `SESSIONS.put(id, json, { expirationTtl: seconds })` with TTL e.g. 30 days.

- **Step 2: Cookie `drl_session`**

Store **only** an opaque token so tampering fails: `token = sessionId + "." + base64url(hmacSha256(sessionId, APP_SECRET))` using **Web Crypto** (`crypto.subtle.importKey` + `HMAC` + `SHA-256` with `APP_SECRET` as raw key bytes — derive fixed-length key from secret string via SHA-256 hash first if needed). Verify signature before any KV lookup.

Cookie attributes: `HttpOnly`, `Secure` when `url.hostname !== "localhost"`, `SameSite=Lax`, `Path=/`, `Max-Age` matching KV TTL.

- **Step 3: Middleware**

Parse cookie → verify signature → `SESSIONS.get(id)` → parse JSON → if expired, delete KV and clear cookie → `c.set("session", …)` and `c.set("user", …)` for downstream handlers.

- **Step 4: Commit**

```bash
git add src/server/lib/session-cookie.ts src/server/middleware/session.ts
git commit -m "feat(auth): add KV-backed sessions with signed cookie"
```

---

### Task 12: Invitations + registration + login routes

**Files:**

- Create: `src/server/routes/auth.tsx`
- Modify: `src/server/app.ts` — `app.route("/", authRoutes)`
- **Step 1: Admin-only POST `/admin/invitations`**

Creates `invitations` row with random `token` (32 bytes hex), `expiresAt` +7 days. **v1:** respond with JSON/Inertia flash containing **absolute** `/invite/:token` URL — no email yet.

- **Step 2: GET `/invite/:token`**

Valid token → form for name + password. POST creates `users` row with `role: writer` unless first user → `admin` (bootstrap rule: if `count(users)=0`, promote).

- **Step 3: GET/POST `/login`**

Email + password; on success set session.

- **Step 4: POST `/logout`**

Clears KV + cookie.

- **Step 5: Add placeholder Inertia pages** under `src/client/pages/Auth/*.tsx` matching route renders.
- **Step 6: Manual verification**

```bash
pnpm run dev
```

Create bootstrap admin via SQL insert **or** invitation route once auth middleware exists.

- **Step 7: Commit**

```bash
git add src/server/routes/auth.tsx src/client/pages/Auth src/server/app.ts
git commit -m "feat(auth): invitations, register, login, logout"
```

**Checkpoint C:** Can log in and see session-affected UI (e.g., dashboard link).

---

### Task 13: Discogs client + release cache

**Files:**

- Create: `src/server/lib/discogs.ts`
- Create: `src/shared/discogsReleaseId.ts`
- Create: `src/shared/discogsReleaseId.test.ts`
- **Step 1: Parse Discogs ID**

Export `parseDiscogsReleaseId(input: string): number | null` accepting numeric strings or URLs containing `/release/<id>`.

Test cases:

```ts
import { describe, expect, it } from "vitest";
import { parseDiscogsReleaseId } from "./discogsReleaseId";

describe("parseDiscogsReleaseId", () => {
  it("parses plain id", () => {
    expect(parseDiscogsReleaseId("249504")).toBe(249504);
  });
  it("parses release URL", () => {
    expect(parseDiscogsReleaseId("https://www.discogs.com/release/249504-Abbey-Road")).toBe(
      249504,
    );
  });
  it("returns null for junk", () => {
    expect(parseDiscogsReleaseId("nope")).toBeNull();
  });
});
```

- **Step 2: Implement `fetchRelease(env, id)`** using `fetch` + `Authorization: Discogs token=${DISCOGS_USER_TOKEN}` per Discogs API docs.
- **Step 3: Upsert into `releases`**, set `cachedAt` to `Date.now()`.
- **Step 4: Commit**

```bash
git add src/server/lib/discogs.ts src/shared/discogsReleaseId.ts src/shared/discogsReleaseId.test.ts
git commit -m "feat(discogs): parse release id and cache releases in D1"
```

---

### Task 14: Writer review flow (create draft → publish)

**Files:**

- Create: `src/server/routes/reviews.tsx`
- Create: `src/client/pages/Reviews/New.tsx`, `Edit.tsx`, `Dashboard.tsx`
- Create: `src/client/components/ReviewEditor.tsx` (TipTap + `sanitizeReviewHtml` on submit via server)
- **Step 1: POST `/reviews/preview-release`**

Body: `{ discogsInput: string }` → parse id → fetch/cache release → return Inertia props for preview step.

- **Step 2: POST `/reviews`**

Creates `reviews` row `draft`, associates `releaseId`, stores sanitized `bodyHtml`, inserts default score rows for fixed axes `sound`, `lyrics`, `artwork` (constants in `src/shared/scoreAxes.ts`).

- **Step 3: PATCH `/reviews/:id`**

Owner or admin; re-sanitize HTML; update scores.

- **Step 4: POST `/reviews/:id/publish`**

Sets `status=published`, `publishedAt=now`.

- **Step 5: Commit**

```bash
git add src/server/routes/reviews.tsx src/client/pages/Reviews src/client/components/ReviewEditor.tsx src/shared/scoreAxes.ts
git commit -m "feat(reviews): writer create/edit/publish with TipTap and scores"
```

---

### Task 15: Public routes

**Files:**

- Create: `src/server/routes/public.tsx`
- **Step 1: GET `/`**

Lists published reviews joined with `releases` + author display fields.

- **Step 2: GET `/releases/:id`**

Use internal release id (uuid/slug) — pick **integer `releases.id`** from schema for `:id` param; show cached metadata + reviews.

- **Step 3: GET `/reviews/:id`**

Public detail if `status=published`; writers see their drafts when logged in.

- **Step 4: Commit**

```bash
git add src/server/routes/public.tsx src/client/pages/Public
git commit -m "feat(public): home, release, and review pages"
```

---

### Task 16: Admin routes

**Files:**

- Create: `src/server/routes/admin.tsx`
- Create: `src/client/pages/Admin/*.tsx`
- **Step 1: Protect with `requireAdmin` middleware** verifying `role===admin` server-side.
- **Step 2: Implement list/edit/delete for reviews** (admin), **user management** (promote/demote), **tags CRUD**, **create invitation** UI reusing Task 12 handler.
- **Step 3: Commit**

```bash
git add src/server/routes/admin.tsx src/client/pages/Admin src/server/middleware/auth.ts
git commit -m "feat(admin): manage reviews, users, tags, invitations"
```

---

### Task 17: Knip + Biome + Vitest config updates

**Files:**

- Modify: `knip.json`
- Modify: `vitest.config.ts`
- Modify: `biome.json` if new extensions need include
- **Step 1: Expand knip `entry`**

Include `src/server/worker.ts`, `src/client/app.tsx`, `vite.config.ts`, `drizzle.config.ts`.

- **Step 2: Vitest environments**

Use `environment: "node"` for server/shared tests; if React component tests added later, split projects — for now keep node-only.

- **Step 3: Run**

```bash
pnpm run validate
```

Expected: all green after adjusting ignores for generated `drizzle/meta`.

- **Step 4: Commit**

```bash
git add knip.json vitest.config.ts biome.json
git commit -m "chore: align knip vitest biome with app layout"
```

---

### Task 18: CI workflow hooks for Cloudflare build

**Files:**

- Modify: `.github/workflows/ci.yml`
- **Step 1: Add build step** after typecheck:

```yaml
      - name: Vite build (Workers client bundles)
        run: pnpm run build
```

Ensure `NODE_OPTIONS` or Wrangler does not require remote secrets for build — use **public** placeholders in CI for `DISCOGS_USER_TOKEN` only if imported at build time; prefer **no import** of secrets at build (only runtime `env`).

- **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run Vite production build in CI"
```

---

### Task 19: Documentation sync

**Files:**

- Modify: `README.md`
- **Step 1: Document commands**

`pnpm run dev`, `pnpm run db:migrate:local`, `wrangler secret put DISCOGS_USER_TOKEN`, `APP_SECRET`.

- **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document dev, migrations, and secrets"
```

---

### Task 20: Final validation

**Files:**

- None
- **Step 1: Run full validate**

```bash
pnpm run validate
pnpm run build
```

- **Step 2: Manual smoke**

Login → create review → publish → logout → view public page.

**Checkpoint D:** Public `/reviews/:id` shows sanitized HTML without auth.

---

## Self-review (plan vs spec)


| Spec section                           | Task coverage                 |
| -------------------------------------- | ----------------------------- |
| Stack (Hono, Inertia, Vite, Workers)   | Tasks 1–5                     |
| D1 + Drizzle schema                    | Tasks 7–8                     |
| KV sessions                            | Task 11–12                    |
| Invitation + roles                     | Tasks 12, 16                  |
| Discogs fetch + cache                  | Task 13                       |
| TipTap + HTML sanitize                 | Tasks 10, 14                  |
| Public vs writer vs admin routes       | Tasks 12, 14–16               |
| Testing (Vitest + fast-check optional) | Tasks 9–10, 13 + expand later |
| Operational docs                       | Task 19                       |


**Placeholder scan:** No `TODO` / `TBD` strings left in tasks above. Deferred product items (Resend email, R2 images) are **intentionally omitted** from MVP tasks; add a follow-up plan file when promoting email/R2.

**Consistency:** `releases.id` used as public `:id` — ensure pages don’t confuse with `discogsId`; document in README.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-discog-review-log-app.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**