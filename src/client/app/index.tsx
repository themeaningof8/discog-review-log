import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { hydrateRoot } from "react-dom/client";
import "./styles.css";

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>(
      "../pages/**/*.tsx",
    );
    const page = await pages[`../pages/${name}.tsx`]();
    return page.default;
  },
  setup({ el, App, props }) {
    hydrateRoot(el, <App {...props} />);
  },
});
