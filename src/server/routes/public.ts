import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Db } from "../db/client";
import { releases, reviews, users } from "../db/schema.js";
import { getReleaseById } from "../lib/discogs.js";
import { withAuth } from "../lib/inertiaProps.js";
import type { Env, SessionUser } from "../types";

type Variables = {
  db: Db;
  user: SessionUser | null;
};

export const publicRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

publicRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select({
      reviewId: reviews.id,
      title: releases.title,
      artist: releases.artist,
      coverUrl: releases.coverUrl,
      publishedAt: reviews.publishedAt,
      authorName: users.name,
    })
    .from(reviews)
    .innerJoin(releases, eq(reviews.releaseId, releases.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.status, "published"))
    .orderBy(desc(reviews.publishedAt));
  return c.render(
    "Home",
    withAuth(c, {
      items: rows.map((r) => ({
        reviewId: r.reviewId,
        title: r.title,
        artist: r.artist,
        coverUrl: r.coverUrl,
        publishedAt: r.publishedAt?.getTime() ?? null,
        authorName: r.authorName,
      })),
    }),
  );
});

publicRoutes.get("/releases/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.text("Not found", 404);
  }
  const db = c.get("db");
  const rel = await getReleaseById(db, id);
  if (!rel) {
    return c.text("Not found", 404);
  }
  const relReviews = await db
    .select({
      reviewId: reviews.id,
      publishedAt: reviews.publishedAt,
      userName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.releaseId, rel.id), eq(reviews.status, "published")));
  return c.render(
    "Public/Release",
    withAuth(c, {
      release: {
        id: rel.id,
        discogsId: rel.discogsId,
        title: rel.title,
        artist: rel.artist,
        year: rel.year,
        label: rel.label,
        coverUrl: rel.coverUrl,
        cachedAt: rel.cachedAt.getTime(),
      },
      reviews: relReviews.map((r) => ({
        id: r.reviewId,
        authorName: r.userName,
        publishedAt: r.publishedAt?.getTime() ?? null,
      })),
    }),
  );
});
