import { Form, Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";

export function SiteNav(props: AuthProps) {
  const { user } = props.auth;
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 font-sans">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-100"
        >
          discog-review-log
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-neutral-300">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/reviews/new" className="hover:text-white">
                New review
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin" className="hover:text-white">
                  Admin
                </Link>
              ) : null}
              <Form action="/logout" method="post" className="inline">
                <button
                  type="submit"
                  className="rounded-md bg-neutral-800 px-3 py-1 text-neutral-100 hover:bg-neutral-700"
                >
                  Log out
                </button>
              </Form>
            </>
          ) : (
            <Link href="/login" className="hover:text-white">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
