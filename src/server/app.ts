import { inertia } from "@hono/inertia";
import { Hono } from "hono";
import type { Db } from "./db/client";
import { dbMiddleware } from "./middleware/db";
import { sessionMiddleware } from "./middleware/session";
import { rootView } from "./root-view";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import { publicRoutes } from "./routes/public.js";
import { reviewRoutes } from "./routes/reviews.js";
import type { Env, SessionRecord, SessionUser } from "./types";

export function createApp() {
  const app = new Hono<{
    Bindings: Env;
    Variables: {
      db: Db;
      user: SessionUser | null;
      session: SessionRecord | null;
    };
  }>();

  app.use("*", dbMiddleware);
  app.use("*", sessionMiddleware);
  app.use(inertia({ rootView, version: "1" }));

  app.route("/", authRoutes);
  app.route("/", reviewRoutes);
  app.route("/", adminRoutes);
  app.route("/", publicRoutes);

  return app;
}
