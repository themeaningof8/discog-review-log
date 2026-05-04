import { Link } from "@inertiajs/react";

export const ADMIN_HOME_MAIN_CLASS = "mx-auto max-w-3xl px-4 py-10 font-sans";

export function AdminHomePageContent() {
  return (
    <>
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
          <Link href="/admin/tags" className="hover:text-white hover:underline">
            Tags
          </Link>
        </li>
      </ul>
    </>
  );
}
