import { ReviewEditor } from "@client/features/review-editor";
import { Form, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export const NEW_REVIEW_MAIN_CLASS = "mx-auto max-w-3xl px-4 py-10 font-sans";

export type NewReviewPageContentProps = {
  step: "discogs" | "compose";
  previewError: string | null;
  release: {
    id: number;
    discogsId: number;
    title: string;
    artist: string;
    year: number | null;
    label: string | null;
    coverUrl: string | null;
  } | null;
  releaseId: number | null;
  allTags: { id: string; name: string }[];
};

export function NewReviewPageContent(props: NewReviewPageContentProps) {
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const initialHtml = useMemo(() => "<p></p>", []);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">New review</h1>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          Dashboard
        </Link>
      </div>

      {props.step === "discogs" ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-neutral-400">
            Paste a Discogs release URL or numeric release id.
          </p>
          {props.previewError ? (
            <p className="rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
              {props.previewError}
            </p>
          ) : null}
          <Form
            action="/reviews/preview-release"
            method="post"
            className="space-y-3"
          >
            <textarea
              name="discogsInput"
              required
              rows={4}
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
              placeholder="https://www.discogs.com/release/249504-..."
            />
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
            >
              Preview release
            </button>
          </Form>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {props.release ? (
            <section className="rounded-lg border border-neutral-900 bg-neutral-900/40 p-4">
              <div className="flex gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                  {props.release.coverUrl ? (
                    <img
                      src={props.release.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">
                    {props.release.title}
                  </div>
                  <div className="text-neutral-400">{props.release.artist}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Discogs {props.release.discogsId}
                    {props.release.year ? ` · ${props.release.year}` : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <Form action="/reviews" method="post" className="space-y-6">
            <input
              type="hidden"
              name="releaseId"
              value={props.releaseId ?? ""}
            />
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
                      <input type="checkbox" name="tagIds" value={t.id} />
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
                  defaultValue={5}
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
                  defaultValue={5}
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
                  defaultValue={5}
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

            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
            >
              Save draft
            </button>
          </Form>
        </div>
      )}
    </>
  );
}
