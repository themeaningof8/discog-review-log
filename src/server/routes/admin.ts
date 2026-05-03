import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import type { Db } from "../db/client";
import { releases, reviews, tags, users } from "../db/schema.js";
import { withAuth } from "../lib/inertiaProps.js";
import { requireAdmin } from "../middleware/auth.js";
import type { Env, SessionUser } from "../types";

type Variables = {
  db: Db;
  user: SessionUser | null;
};

export const adminRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

adminRoutes.use("*", requireAdmin);

adminRoutes.get("/admin", (c) => c.render("Admin/Index", withAuth(c, {})));

adminRoutes.get("/admin/reviews", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select({
      id: reviews.id,
      status: reviews.status,
      title: releases.title,
      authorEmail: users.email,
      publishedAt: reviews.publishedAt,
    })
    .from(reviews)
    .innerJoin(releases, eq(reviews.releaseId, releases.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.updatedAt));
  return c.render(
    "Admin/Reviews",
    withAuth(c, {
      items: rows.map((r) => ({
        id: r.id,
        status: r.status,
        title: r.title,
        authorEmail: r.authorEmail,
        publishedAt: r.publishedAt?.getTime() ?? null,
      })),
    }),
  );
});

adminRoutes.get("/admin/users", async (c) => {
  const db = c.get("db");
  const usersRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .orderBy(users.email);
  return c.render(
    "Admin/Users",
    withAuth(c, {
      users: usersRows,
    }),
  );
});

const roleSchema = z.object({
  role: z.enum(["writer", "admin"]),
});

adminRoutes.post(
  "/admin/users/:id/role",
  zValidator("form", roleSchema),
  async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");
    const { role } = c.req.valid("form");
    await db.update(users).set({ role }).where(eq(users.id, id));
    return c.redirect("/admin/users");
  },
);

adminRoutes.get("/admin/tags", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(tags).orderBy(tags.name);
  return c.render(
    "Admin/Tags",
    withAuth(c, {
      tags: rows.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
      })),
    }),
  );
});

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

adminRoutes.post("/admin/tags", zValidator("form", tagSchema), async (c) => {
  const db = c.get("db");
  const data = c.req.valid("form");
  await db.insert(tags).values({
    id: crypto.randomUUID(),
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
  });
  return c.redirect("/admin/tags");
});

adminRoutes.post("/admin/tags/:id/delete", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  await db.delete(tags).where(eq(tags.id, id));
  return c.redirect("/admin/tags");
});
