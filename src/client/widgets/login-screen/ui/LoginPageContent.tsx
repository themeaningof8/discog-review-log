import { Form, Link } from "@inertiajs/react";

export const LOGIN_MAIN_CLASS = "mx-auto max-w-md px-4 py-16 font-sans";

export type LoginPageContentProps = { errors: string | null };

export function LoginPageContent(props: LoginPageContentProps) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      {props.errors ? (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
          {props.errors}
        </p>
      ) : null}
      <Form action="/login" method="post" className="mt-8 space-y-4">
        <label className="block text-sm text-neutral-300">
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          />
        </label>
        <label className="block text-sm text-neutral-300">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Continue
        </button>
      </Form>
      <p className="mt-6 text-sm text-neutral-500">
        Need access? Ask an admin for an invitation link.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/" className="text-neutral-400 hover:text-white">
          ← Back home
        </Link>
      </p>
    </>
  );
}
