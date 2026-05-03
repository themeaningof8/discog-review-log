import { createMiddleware } from "hono/factory";
import type { Db } from "../db/client";
import { createDb } from "../db/client";
import type { Env, SessionRecord, SessionUser } from "../types";

export const dbMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: {
    db: Db;
    user: SessionUser | null;
    session: SessionRecord | null;
  };
}>(async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});
