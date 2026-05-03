import { SiteNav } from "@client/widgets/site-nav";
import { Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import { formatCalendarDate, formatCalendarDateTime } from "@shared/formatDate";

export default function Release(
  props: AuthProps & {
    release: {
      id: number;
      discogsId: number;
      title: string;
      artist: string;
      year: number | null;
      label: string | null;
      coverUrl: string | null;
      cachedAt: number;
    };
    reviews: {
      id: string;
      authorName: string;
      publishedAt: number | null;
    }[];
  },
) {
  const r = props.release;
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-5xl px-4 py-10 font-sans">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="mx-auto w-64 shrink-0 overflow-hidden rounded-lg bg-neutral-900 md:mx-0">
            {r.coverUrl ? (
              <img src={r.coverUrl} alt="" className="w-full object-cover" />
            ) : (
              <div className="aspect-square w-full bg-neutral-900" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{r.title}</h1>
            <div className="mt-1 text-lg text-neutral-300">{r.artist}</div>
            <div className="mt-3 text-sm text-neutral-500">
              {r.year ? `${r.year}` : "Year unknown"}
              {r.label ? ` · ${r.label}` : null}
            </div>
            <div className="mt-2 text-xs text-neutral-600">
              Discogs release {r.discogsId} · cached{" "}
              {formatCalendarDateTime(r.cachedAt)}
            </div>
          </div>
        </div>
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <ul className="mt-4 divide-y divide-neutral-900">
            {props.reviews.length === 0 ? (
              <li className="py-4 text-neutral-500">
                No published reviews yet.
              </li>
            ) : (
              props.reviews.map((rev) => (
                <li key={rev.id} className="py-4">
                  <Link
                    href={`/reviews/${rev.id}`}
                    className="font-medium text-white hover:underline"
                  >
                    Review by {rev.authorName}
                  </Link>
                  {rev.publishedAt ? (
                    <div className="text-xs text-neutral-500">
                      {formatCalendarDate(rev.publishedAt)}
                    </div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
