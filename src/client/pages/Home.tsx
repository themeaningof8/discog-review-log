import { SiteNav } from "@client/widgets/site-nav";
import { Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import { formatCalendarDate } from "@shared/formatDate";

type Item = {
  reviewId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  publishedAt: number | null;
  authorName: string;
};

export default function Home(props: AuthProps & { items: Item[] }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-5xl px-4 py-10 font-sans">
        <h1 className="text-3xl font-semibold tracking-tight">
          Published reviews
        </h1>
        <p className="mt-2 text-neutral-400">
          Discogs-backed release notes and listening impressions.
        </p>
        <ul className="mt-8 divide-y divide-neutral-900">
          {props.items.length === 0 ? (
            <li className="py-6 text-neutral-500">No published reviews yet.</li>
          ) : (
            props.items.map((item) => (
              <li key={item.reviewId} className="flex gap-4 py-6">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/reviews/${item.reviewId}`}
                    className="text-lg font-medium text-white hover:underline"
                  >
                    {item.title}
                  </Link>
                  <div className="text-sm text-neutral-400">{item.artist}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    by {item.authorName}
                    {item.publishedAt
                      ? ` · ${formatCalendarDate(item.publishedAt)}`
                      : null}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
