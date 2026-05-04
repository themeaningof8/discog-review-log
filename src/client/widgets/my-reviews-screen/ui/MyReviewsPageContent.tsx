import { Link } from "@inertiajs/react";

export const MY_REVIEWS_MAIN_CLASS = "mx-auto max-w-3xl px-4 py-10 font-sans";

export type MyReviewsPageContentProps = {
  items: {
    id: string;
    status: string;
    title: string;
    publishedAt: number | null;
  }[];
};

export function MyReviewsPageContent(props: MyReviewsPageContentProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">My reviews</h1>
        <Link
          href="/reviews/new"
          className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          New review
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-neutral-900">
        {props.items.length === 0 ? (
          <li className="py-6 text-neutral-500">No drafts or reviews yet.</li>
        ) : (
          props.items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <div className="font-medium text-white">{it.title}</div>
                <div className="text-xs text-neutral-500 uppercase">
                  {it.status}
                </div>
              </div>
              <Link
                href={`/reviews/${it.id}/edit`}
                className="text-sm text-neutral-300 hover:text-white"
              >
                Edit
              </Link>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
