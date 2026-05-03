import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (process.env.CI === "true" || process.env.CI === "1") {
  process.exit(0);
}

if (!existsSync(".git")) {
  process.exit(0);
}

execFileSync("pnpm", ["exec", "lefthook", "install"], { stdio: "inherit" });
