import { createMiddleware } from "hono/factory";
import type { SessionUser } from "../types";

export const requireLogin = createMiddleware<{
  Variables: { user: SessionUser | null };
}>(async (c, next) => {
  if (!c.get("user")) {
    return c.redirect("/login");
  }
  await next();
});

export const requireAdmin = createMiddleware<{
  Variables: { user: SessionUser | null };
}>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.redirect("/login");
  }
  if (user.role !== "admin") {
    return c.text("Forbidden", 403);
  }
  await next();
});
