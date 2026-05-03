import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["**/pages.gen.ts"],
  },
  // Inertia pages are grouped by route folder without FSD segments (ui/model/lib).
  {
    files: ["./src/client/pages/**"],
    rules: {
      "fsd/no-segmentless-slices": "off",
    },
  },
  // Widgets/features are intentionally consumed only from pages; Steiger often misses
  // barrel/index resolution for cross-layer imports.
  {
    files: ["./src/client/features/**", "./src/client/widgets/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
