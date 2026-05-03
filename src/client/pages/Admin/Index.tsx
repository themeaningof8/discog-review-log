import { SiteNav } from "@client/widgets/site-nav";
import { Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";

export default function AdminIndex(props: AuthProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-3xl px-4 py-10 font-sans">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <ul className="mt-8 space-y-3 text-neutral-200">
          <li>
            <Link
              href="/admin/reviews"
              className="hover:text-white hover:underline"
            >
              All reviews
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className="hover:text-white hover:underline"
            >
              Users & invitations
            </Link>
          </li>
          <li>
            <Link
              href="/admin/tags"
              className="hover:text-white hover:underline"
            >
              Tags
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
