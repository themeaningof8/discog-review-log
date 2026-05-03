import { SiteNav } from "@client/widgets/site-nav";
import { Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import { formatCalendarDateTime } from "@shared/formatDate";

export default function AdminReviews(
  props: AuthProps & {
    items: {
      id: string;
      status: string;
      title: string;
      authorEmail: string;
      publishedAt: number | null;
    }[];
  },
) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-5xl px-4 py-10 font-sans">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">All reviews</h1>
          <Link
            href="/admin"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-900 text-left text-neutral-500">
              <th className="py-2 pr-4 font-medium">Title</th>
              <th className="py-2 pr-4 font-medium">Author</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((it) => (
              <tr key={it.id} className="border-b border-neutral-900">
                <td className="py-3 pr-4">
                  <Link
                    href={`/reviews/${it.id}`}
                    className="text-white hover:underline"
                  >
                    {it.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-neutral-400">{it.authorEmail}</td>
                <td className="py-3 pr-4 uppercase text-neutral-500">
                  {it.status}
                </td>
                <td className="py-3 text-neutral-500">
                  {it.publishedAt
                    ? formatCalendarDateTime(it.publishedAt)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
