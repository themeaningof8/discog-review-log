import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Env, SessionRecord } from "../types.js";
import { signSessionCookie, verifySessionCookie } from "./session-cookie.js";

const SESSION_TTL_SEC = 60 * 60 * 24 * 30;

export async function createSession<E extends { Bindings: Env }>(
  c: Context<E>,
  user: { id: string; role: "writer" | "admin" },
): Promise<void> {
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_SEC * 1000;
  const record: SessionRecord = {
    userId: user.id,
    role: user.role,
    expiresAt,
  };
  await c.env.SESSIONS.put(sessionId, JSON.stringify(record), {
    expirationTtl: SESSION_TTL_SEC,
  });
  const secret = c.env.APP_SECRET;
  if (!secret) throw new Error("APP_SECRET is not configured");
  const token = await signSessionCookie(sessionId, secret);
  const host = new URL(c.req.url).hostname;
  const secure = host !== "localhost" && host !== "127.0.0.1";
  setCookie(c, "drl_session", token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: SESSION_TTL_SEC,
    secure,
  });
}

export async function destroySession<E extends { Bindings: Env }>(
  c: Context<E>,
): Promise<void> {
  const secret = c.env.APP_SECRET;
  const raw = getCookie(c, "drl_session");
  if (secret && raw) {
    const id = await verifySessionCookie(raw, secret);
    if (id) await c.env.SESSIONS.delete(id);
  }
  deleteCookie(c, "drl_session", { path: "/" });
}
