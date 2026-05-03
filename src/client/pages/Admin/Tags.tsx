import { SiteNav } from "@client/widgets/site-nav";
import { Form, Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";

export default function AdminTags(
  props: AuthProps & {
    tags: { id: string; slug: string; name: string }[];
  },
) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-3xl px-4 py-10 font-sans">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <Link
            href="/admin"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        <Form
          action="/admin/tags"
          method="post"
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          <label className="text-sm text-neutral-300">
            Name
            <input
              name="name"
              required
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
            />
          </label>
          <label className="text-sm text-neutral-300">
            Slug
            <input
              name="slug"
              required
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
            >
              Add tag
            </button>
          </div>
        </Form>

        <ul className="mt-10 divide-y divide-neutral-900">
          {props.tags.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <div className="font-medium text-white">{t.name}</div>
                <div className="text-xs text-neutral-500">{t.slug}</div>
              </div>
              <Form action={`/admin/tags/${t.id}/delete`} method="post">
                <button
                  type="submit"
                  className="text-sm text-red-300 hover:text-red-200"
                >
                  Delete
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
