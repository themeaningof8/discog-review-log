import { Form, Link } from "@inertiajs/react";

export const ADMIN_TAGS_MAIN_CLASS = "mx-auto max-w-3xl px-4 py-10 font-sans";

export type AdminTagsPageContentProps = {
  tags: { id: string; slug: string; name: string }[];
  error: string | null;
};

export function AdminTagsPageContent(props: AdminTagsPageContentProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
        <Link
          href="/admin"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Admin
        </Link>
      </div>

      {props.error ? (
        <p className="mt-6 rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
          {props.error}
        </p>
      ) : null}

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
    </>
  );
}
