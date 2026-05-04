import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { releases } from "../db/schema.js";
import type { Env } from "../types.js";

const USER_AGENT = "discog-review-log/1.0 (Cloudflare Worker)";

type DiscogsReleaseJson = {
  title: string;
  artists?: { name: string }[];
  year?: number;
  released?: string;
  labels?: { name: string }[];
  images?: { type: string; uri: string; resource_url: string }[];
};

function firstArtistName(data: DiscogsReleaseJson): string {
  if (!data.artists?.length) return "Unknown";
  return data.artists.map((a) => a.name).join(", ");
}

function firstLabelName(data: DiscogsReleaseJson): string | null {
  const name = data.labels?.[0]?.name;
  return name ?? null;
}

function pickCoverUrl(data: DiscogsReleaseJson): string | null {
  const primary =
    data.images?.find((i) => i.type === "primary") ?? data.images?.[0];
  return primary?.uri ?? primary?.resource_url ?? null;
}

function parseYear(data: DiscogsReleaseJson): number | null {
  if (typeof data.year === "number") return data.year;
  if (data.released) {
    const y = Number(data.released.slice(0, 4));
    return Number.isFinite(y) ? y : null;
  }
  return null;
}

export async function fetchAndUpsertRelease(
  env: Env,
  db: Db,
  discogsId: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = env.DISCOGS_USER_TOKEN;
  if (!token) {
    return {
      ok: false,
      message: "DISCOGS_USER_TOKEN is not configured",
    };
  }
  const url = `https://api.discogs.com/releases/${discogsId}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        "User-Agent": USER_AGENT,
      },
    });
  } catch {
    return { ok: false, message: "Network error talking to Discogs" };
  }
  if (res.status === 429) {
    return {
      ok: false,
      message: "Discogs rate limited — try again shortly.",
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      message: `Discogs returned ${res.status}`,
    };
  }
  let data: DiscogsReleaseJson;
  try {
    data = (await res.json()) as DiscogsReleaseJson;
  } catch {
    return { ok: false, message: "Invalid JSON from Discogs" };
  }

  const now = Date.now();
  const cachedAt = new Date(now);
  const row = {
    discogsId,
    title: data.title || "Untitled",
    artist: firstArtistName(data),
    year: parseYear(data),
    label: firstLabelName(data),
    coverUrl: pickCoverUrl(data),
    cachedAt,
  };

  await db
    .insert(releases)
    .values(row)
    .onConflictDoUpdate({
      target: releases.discogsId,
      set: {
        title: row.title,
        artist: row.artist,
        year: row.year,
        label: row.label,
        coverUrl: row.coverUrl,
        cachedAt,
      },
    });

  return { ok: true };
}

export async function getReleaseByDiscogsId(db: Db, discogsId: number) {
  const [row] = await db
    .select()
    .from(releases)
    .where(eq(releases.discogsId, discogsId))
    .limit(1);
  return row ?? null;
}

export async function getReleaseById(db: Db, id: number) {
  const [row] = await db
    .select()
    .from(releases)
    .where(eq(releases.id, id))
    .limit(1);
  return row ?? null;
}
