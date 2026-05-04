import { ReviewEditor } from "@client/features/review-editor";
import { SiteNav } from "@client/widgets/site-nav";
import { Form, Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import { useMemo, useState } from "react";

export default function Edit(
  props: AuthProps & {
    review: { id: string; bodyHtml: string; status: string };
    release: {
      id: number;
      title: string;
      artist: string;
      coverUrl: string | null;
    };
    scores: { sound: number; lyrics: number; artwork: number };
    allTags: { id: string; name: string }[];
    selectedTagIds: string[];
  },
) {
  const [bodyHtml, setBodyHtml] = useState(props.review.bodyHtml);
  const initialHtml = useMemo(
    () => props.review.bodyHtml,
    [props.review.bodyHtml],
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-3xl px-4 py-10 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-neutral-500">
              {props.review.status}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {props.release.title}
            </h1>
            <div className="text-neutral-400">{props.release.artist}</div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[140px_1fr]">
          <div className="overflow-hidden rounded-lg bg-neutral-900">
            {props.release.coverUrl ? (
              <img
                src={props.release.coverUrl}
                alt=""
                className="w-full object-cover"
              />
            ) : (
              <div className="aspect-square w-full bg-neutral-900" />
            )}
          </div>

          <div className="space-y-6">
            <Form
              action={`/reviews/${props.review.id}/update`}
              method="post"
              className="space-y-6"
            >
              <input type="hidden" name="bodyHtml" value={bodyHtml} />

              {props.allTags.length > 0 ? (
                <fieldset className="space-y-2">
                  <legend className="text-sm text-neutral-300">Tags</legend>
                  <div className="flex flex-wrap gap-3">
                    {props.allTags.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 text-sm text-neutral-300"
                      >
                        <input
                          type="checkbox"
                          name="tagIds"
                          value={t.id}
                          defaultChecked={props.selectedTagIds.includes(t.id)}
                        />
                        {t.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm text-neutral-300">
                  Sound (0–10)
                  <input
                    name="score_sound"
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={props.scores.sound}
                    className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  />
                </label>
                <label className="text-sm text-neutral-300">
                  Lyrics (0–10)
                  <input
                    name="score_lyrics"
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={props.scores.lyrics}
                    className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  />
                </label>
                <label className="text-sm text-neutral-300">
                  Artwork (0–10)
                  <input
                    name="score_artwork"
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={props.scores.artwork}
                    className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  />
                </label>
              </div>

              <div>
                <div className="text-sm text-neutral-300">Review</div>
                <div className="mt-2">
                  <ReviewEditor
                    initialHtml={initialHtml}
                    onChange={setBodyHtml}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
                >
                  Save changes
                </button>
                <Link
                  href={`/reviews/${props.review.id}`}
                  className="rounded-md border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  View
                </Link>
              </div>
            </Form>

            {props.review.status !== "published" ? (
              <Form
                action={`/reviews/${props.review.id}/publish`}
                method="post"
              >
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Publish
                </button>
              </Form>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
