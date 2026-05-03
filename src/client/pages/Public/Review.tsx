import { SiteNav } from "@client/widgets/site-nav";
import { Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import DOMPurify from "dompurify";

export default function Review(
  props: AuthProps & {
    review: {
      id: string;
      bodyHtml: string;
      status: string;
      publishedAt: number | null;
      authorName: string;
    };
    release: {
      id: number;
      title: string;
      artist: string;
      coverUrl: string | null;
    };
    scores: { axis: string; score: number }[];
  },
) {
  const { review, release } = props;
  const safeHtml =
    typeof globalThis.window === "undefined"
      ? props.review.bodyHtml
      : DOMPurify.sanitize(props.review.bodyHtml);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-3xl px-4 py-10 font-sans">
        <Link
          href={`/releases/${release.id}`}
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← {release.title}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {release.title}
        </h1>
        <div className="text-neutral-400">{release.artist}</div>
        <div className="mt-2 text-sm text-neutral-500">
          by {review.authorName}
          {review.publishedAt
            ? ` · ${new Date(review.publishedAt).toLocaleDateString()}`
            : null}{" "}
          · <span className="uppercase">{review.status}</span>
        </div>
        {props.scores.length > 0 ? (
          <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
            {props.scores.map((s) => (
              <div key={s.axis} className="rounded-md bg-neutral-900 px-3 py-2">
                <dt className="text-neutral-500 capitalize">{s.axis}</dt>
                <dd className="text-lg font-semibold text-white">{s.score}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <article
          className="prose prose-invert mt-8 max-w-none prose-p:leading-relaxed prose-headings:tracking-tight"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </main>
    </div>
  );
}
