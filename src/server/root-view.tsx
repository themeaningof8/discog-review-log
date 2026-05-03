import type { RootView } from "@hono/inertia";
import { renderToString } from "react-dom/server";
import { Link, Script, ViteClient } from "vite-ssr-components/react";
import { renderPage } from "./ssr";

const Head = () => (
  <>
    <ViteClient />
    <Link rel="stylesheet" href="/src/client/app/styles.css" />
    <Script src="/src/client/app/index.tsx" />
  </>
);

export const rootView: RootView = async (page, _c) => {
  const { head, body } = await renderPage(page);
  const headHtml = renderToString(<Head />) + head.join("");
  return `<!DOCTYPE html><html><head>${headHtml}</head><body>${body}</body></html>`;
};
