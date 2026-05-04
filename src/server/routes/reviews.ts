import { zValidator } from "@hono/zod-validator";
import { parseDiscogsReleaseId } from "@shared/discogsReleaseId";
import { DEFAULT_SCORE, SCORE_AXES, type ScoreAxis } from "@shared/scoreAxes";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import type { Db } from "../db/client";
import {
  releases,
  reviewScores,
  reviews,
  reviewTags,
  tags,
  users,
} from "../db/schema.js";
import {
  fetchAndUpsertRelease,
  getReleaseByDiscogsId,
} from "../lib/discogs.js";
import { withAuth } from "../lib/inertiaProps.js";
import { sanitizeReviewHtml } from "../lib/sanitizeHtml.js";
import { requireLogin } from "../middleware/auth.js";
import type { Env, SessionUser } from "../types";

type Variables = {
  db: Db;
  user: SessionUser | null;
};

const scoreField = z
  .string()
  .trim()
  .superRefine((s, ctx) => {
    if (s.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Each score is required",
      });
      return;
    }
    const n = Number(s);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 10) {
      ctx.addIssue({
        code: "custom",
        message: "Scores must be integers from 0 to 10",
      });
    }
  })
  .transform((s) => Number(s));

const formTagIds = z.preprocess((raw) => {
  if (raw === undefined || raw === "") return [];
  return Array.isArray(raw) ? raw : [raw];
}, z.array(z.string()));

const reviewCreateSchema = z.object({
  releaseId: z.coerce.number().int().positive(),
  bodyHtml: z.string(),
  score_sound: scoreField,
  score_lyrics: scoreField,
  score_artwork: scoreField,
  tagIds: formTagIds,
});

const reviewUpdateSchema = z.object({
  bodyHtml: z.string(),
  score_sound: scoreField,
  score_lyrics: scoreField,
  score_artwork: scoreField,
  tagIds: formTagIds,
});

async function replaceReviewTags(db: Db, reviewId: string, tagIds: string[]) {
  await db.delete(reviewTags).where(eq(reviewTags.reviewId, reviewId));
  if (tagIds.length === 0) return;
  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.id, tagIds));
  const allowed = new Set(existing.map((e) => e.id));
  const validTagIds = tagIds.filter((tid) => allowed.has(tid));
  if (validTagIds.length === 0) return;
  await db
    .insert(reviewTags)
    .values(validTagIds.map((tagId) => ({ reviewId, tagId })));
}

const previewSchema = z.object({
  discogsInput: z.string().min(1),
});

export const reviewRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

reviewRoutes.get("/dashboard", requireLogin, async (c) => {
  const me = c.get("user");
  if (!me) {
    return c.redirect("/login");
  }
  const db = c.get("db");
  const mine = await db
    .select({
      id: reviews.id,
      status: reviews.status,
      title: releases.title,
      publishedAt: reviews.publishedAt,
    })
    .from(reviews)
    .innerJoin(releases, eq(reviews.releaseId, releases.id))
    .where(eq(reviews.userId, me.id));
  return c.render(
    "Reviews/Dashboard",
    withAuth(c, {
      items: mine.map((m) => ({
        id: m.id,
        status: m.status,
        title: m.title,
        publishedAt: m.publishedAt?.getTime() ?? null,
      })),
    }),
  );
});

reviewRoutes.get("/reviews/new", requireLogin, async (c) => {
  const db = c.get("db");
  const allTags = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .orderBy(asc(tags.name));
  return c.render(
    "Reviews/New",
    withAuth(c, {
      step: "discogs" as const,
      previewError: null as string | null,
      release: null,
      releaseId: null,
      allTags,
    }),
  );
});

reviewRoutes.post(
  "/reviews/preview-release",
  requireLogin,
  zValidator("form", previewSchema),
  async (c) => {
    const db = c.get("db");
    const allTags = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .orderBy(asc(tags.name));
    const { discogsInput } = c.req.valid("form");
    const id = parseDiscogsReleaseId(discogsInput);
    if (!id) {
      return c.render(
        "Reviews/New",
        withAuth(c, {
          step: "discogs" as const,
          previewError: "Could not parse a Discogs release id from that input.",
          release: null,
          releaseId: null,
          allTags,
        }),
      );
    }
    const res = await fetchAndUpsertRelease(c.env, db, id);
    const rel = await getReleaseByDiscogsId(db, id);
    if (!res.ok && !rel) {
      return c.render(
        "Reviews/New",
        withAuth(c, {
          step: "discogs" as const,
          previewError: res.message,
          release: null,
          releaseId: null,
          allTags,
        }),
      );
    }
    if (!rel) {
      return c.render(
        "Reviews/New",
        withAuth(c, {
          step: "discogs" as const,
          previewError: "Release was fetched but not found in the database.",
          release: null,
          releaseId: null,
          allTags,
        }),
      );
    }
    return c.render(
      "Reviews/New",
      withAuth(c, {
        step: "compose" as const,
        previewError: null,
        release: {
          id: rel.id,
          discogsId: rel.discogsId,
          title: rel.title,
          artist: rel.artist,
          year: rel.year,
          label: rel.label,
          coverUrl: rel.coverUrl,
        },
        releaseId: rel.id,
        allTags,
      }),
    );
  },
);

reviewRoutes.post(
  "/reviews",
  requireLogin,
  zValidator("form", reviewCreateSchema),
  async (c) => {
    const me = c.get("user");
    if (!me) {
      return c.redirect("/login");
    }
    const data = c.req.valid("form");
    const bodyHtml = sanitizeReviewHtml(data.bodyHtml);
    const reviewId = crypto.randomUUID();
    const now = new Date();
    const db = c.get("db");
    const [rel] = await db
      .select()
      .from(releases)
      .where(eq(releases.id, data.releaseId))
      .limit(1);
    if (!rel) {
      return c.text("Bad request", 400);
    }
    await db.insert(reviews).values({
      id: reviewId,
      userId: me.id,
      releaseId: data.releaseId,
      bodyHtml,
      status: "draft",
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    const scoreMap: Record<ScoreAxis, number> = {
      sound: data.score_sound,
      lyrics: data.score_lyrics,
      artwork: data.score_artwork,
    };
    await db
      .insert(reviewScores)
      .values(
        SCORE_AXES.map((axis) => ({ reviewId, axis, score: scoreMap[axis] })),
      );
    await replaceReviewTags(db, reviewId, data.tagIds);
    return c.redirect(`/reviews/${reviewId}/edit`);
  },
);

reviewRoutes.get("/reviews/:id/edit", requireLogin, async (c) => {
  const me = c.get("user");
  if (!me) {
    return c.redirect("/login");
  }
  const id = c.req.param("id");
  const db = c.get("db");
  const [row] = await db
    .select({ review: reviews, release: releases })
    .from(reviews)
    .innerJoin(releases, eq(reviews.releaseId, releases.id))
    .where(eq(reviews.id, id))
    .limit(1);
  if (!row) {
    return c.text("Not found", 404);
  }
  if (row.review.userId !== me.id && me.role !== "admin") {
    return c.text("Forbidden", 403);
  }
  const scores = await db
    .select()
    .from(reviewScores)
    .where(eq(reviewScores.reviewId, id));
  const scoreMap = Object.fromEntries(
    scores.map((s) => [s.axis, s.score]),
  ) as Record<ScoreAxis, number>;
  const allTags = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .orderBy(asc(tags.name));
  const selectedRows = await db
    .select({ tagId: reviewTags.tagId })
    .from(reviewTags)
    .where(eq(reviewTags.reviewId, id));
  const selectedTagIds = selectedRows.map((r) => r.tagId);
  return c.render(
    "Reviews/Edit",
    withAuth(c, {
      review: {
        id: row.review.id,
        bodyHtml: row.review.bodyHtml,
        status: row.review.status,
      },
      release: {
        id: row.release.id,
        title: row.release.title,
        artist: row.release.artist,
        coverUrl: row.release.coverUrl,
      },
      scores: {
        sound: scoreMap.sound ?? DEFAULT_SCORE,
        lyrics: scoreMap.lyrics ?? DEFAULT_SCORE,
        artwork: scoreMap.artwork ?? DEFAULT_SCORE,
      },
      allTags,
      selectedTagIds,
    }),
  );
});

reviewRoutes.post(
  "/reviews/:id/update",
  requireLogin,
  zValidator("form", reviewUpdateSchema),
  async (c) => {
    const me = c.get("user");
    if (!me) {
      return c.redirect("/login");
    }
    const id = c.req.param("id");
    const data = c.req.valid("form");
    const db = c.get("db");
    const [row] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    if (!row) {
      return c.text("Not found", 404);
    }
    if (row.userId !== me.id && me.role !== "admin") {
      return c.text("Forbidden", 403);
    }
    const bodyHtml = sanitizeReviewHtml(data.bodyHtml);
    const now = new Date();
    await db
      .update(reviews)
      .set({ bodyHtml, updatedAt: now })
      .where(eq(reviews.id, id));
    const scoreMap: Record<ScoreAxis, number> = {
      sound: data.score_sound,
      lyrics: data.score_lyrics,
      artwork: data.score_artwork,
    };
    await db
      .insert(reviewScores)
      .values(
        SCORE_AXES.map((axis) => ({
          reviewId: id,
          axis,
          score: scoreMap[axis],
        })),
      )
      .onConflictDoUpdate({
        target: [reviewScores.reviewId, reviewScores.axis],
        set: { score: sql`excluded.score` },
      });
    await replaceReviewTags(db, id, data.tagIds);
    return c.redirect(`/reviews/${id}/edit`);
  },
);

reviewRoutes.post("/reviews/:id/publish", requireLogin, async (c) => {
  const me = c.get("user");
  if (!me) {
    return c.redirect("/login");
  }
  const id = c.req.param("id");
  const db = c.get("db");
  const [row] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  if (!row) {
    return c.text("Not found", 404);
  }
  if (row.userId !== me.id && me.role !== "admin") {
    return c.text("Forbidden", 403);
  }
  const now = new Date();
  await db
    .update(reviews)
    .set({
      status: "published",
      publishedAt: now,
      updatedAt: now,
    })
    .where(eq(reviews.id, id));
  return c.redirect(`/reviews/${id}`);
});

reviewRoutes.get("/reviews/:id", async (c) => {
  const id = c.req.param("id");
  if (id === "new") {
    return c.notFound();
  }
  const db = c.get("db");
  const [row] = await db
    .select({
      review: reviews,
      release: releases,
      authorName: users.name,
    })
    .from(reviews)
    .innerJoin(releases, eq(reviews.releaseId, releases.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.id, id))
    .limit(1);
  if (!row) {
    return c.text("Not found", 404);
  }
  const me = c.get("user");
  const canView =
    row.review.status === "published" ||
    (me !== null && (me.id === row.review.userId || me.role === "admin"));
  if (!canView) {
    return c.text("Not found", 404);
  }
  const scoreRows = await db
    .select({ axis: reviewScores.axis, score: reviewScores.score })
    .from(reviewScores)
    .where(eq(reviewScores.reviewId, id));
  return c.render(
    "Public/Review",
    withAuth(c, {
      review: {
        id: row.review.id,
        bodyHtml: row.review.bodyHtml,
        status: row.review.status,
        publishedAt: row.review.publishedAt?.getTime() ?? null,
        authorName: row.authorName,
      },
      release: {
        id: row.release.id,
        title: row.release.title,
        artist: row.release.artist,
        coverUrl: row.release.coverUrl,
      },
      scores: scoreRows,
    }),
  );
});
