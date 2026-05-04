import { eq } from "drizzle-orm";
import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Db } from "../db/client";
import { users } from "../db/schema.js";
import { verifySessionCookie } from "../lib/session-cookie.js";
import type { Env, SessionRecord, SessionUser } from "../types";

export const sessionMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: {
    db: Db;
    user: SessionUser | null;
    session: SessionRecord | null;
  };
}>(async (c, next) => {
  c.set("session", null);
  c.set("user", null);

  const secret = c.env.APP_SECRET;
  if (!secret) {
    return c.text("APP_SECRET is not configured", 500);
  }

  const raw = getCookie(c, "drl_session");
  if (!raw) {
    await next();
    return;
  }

  const sessionId = await verifySessionCookie(raw, secret);
  if (!sessionId) {
    await next();
    return;
  }

  const rawKv = await c.env.SESSIONS.get(sessionId);
  if (!rawKv) {
    await next();
    return;
  }

  let payload: SessionRecord;
  try {
    payload = JSON.parse(rawKv) as SessionRecord;
  } catch {
    await next();
    return;
  }

  if (payload.expiresAt <= Date.now()) {
    await c.env.SESSIONS.delete(sessionId);
    deleteCookie(c, "drl_session", { path: "/" });
    await next();
    return;
  }

  c.set("session", payload);

  const db = c.get("db");
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!row) {
    await c.env.SESSIONS.delete(sessionId);
    deleteCookie(c, "drl_session", { path: "/" });
    await next();
    return;
  }

  c.set("user", {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  });

  await next();
});
