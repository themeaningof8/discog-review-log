/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "shared-not-importing-client-or-server",
      severity: "error",
      comment: "src/shared は client/server に依存しない",
      from: { path: "^src/shared" },
      to: { path: "^src/(client|server)" },
    },
    {
      name: "server-not-importing-client",
      severity: "error",
      comment: "src/server は src/client に依存しない",
      from: { path: "^src/server" },
      to: { path: "^src/client" },
    },
    {
      name: "widgets-not-importing-pages",
      severity: "error",
      comment: "widgets は pages に依存しない（上位レイヤー参照禁止）",
      from: { path: "^src/client/widgets" },
      to: { path: "^src/client/pages" },
    },
    {
      name: "features-not-importing-widgets-or-pages",
      severity: "error",
      comment: "features は widgets/pages に依存しない（上位レイヤー参照禁止）",
      from: { path: "^src/client/features" },
      to: { path: "^src/client/(widgets|pages)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["module", "main", "types", "typings"],
    },
  },
};
