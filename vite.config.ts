import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { inertiaPages } from "@hono/inertia/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [
    tailwindcss(),
    inertiaPages({
      pagesDir: "src/client/pages",
      outFile: "src/client/pages.gen.ts",
      serverModule: "../server/worker",
    }),
    cloudflare(),
    ssrPlugin(),
  ],
  resolve: {
    // Barrel paths must resolve to index files explicitly — Rolldown / Vite 8 can otherwise
    // treat `@client/.../slice-name` as an empty namespace and drop re-exports.
    alias: [
      {
        find: "@client/widgets/site-nav",
        replacement: fileURLToPath(
          new URL("./src/client/widgets/site-nav/index.ts", import.meta.url),
        ),
      },
      {
        find: "@client/features/review-editor",
        replacement: fileURLToPath(
          new URL(
            "./src/client/features/review-editor/index.ts",
            import.meta.url,
          ),
        ),
      },
      {
        find: "@shared",
        replacement: fileURLToPath(new URL("./src/shared", import.meta.url)),
      },
      {
        find: "@client",
        replacement: fileURLToPath(new URL("./src/client", import.meta.url)),
      },
      {
        find: "@server",
        replacement: fileURLToPath(new URL("./src/server", import.meta.url)),
      },
    ],
  },
});
