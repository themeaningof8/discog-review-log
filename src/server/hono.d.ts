import type { Db } from "./db/client";
import type { SessionRecord, SessionUser } from "./types";

declare module "hono" {
  interface ContextVariableMap {
    db: Db;
    user: SessionUser | null;
    session: SessionRecord | null;
  }
}
