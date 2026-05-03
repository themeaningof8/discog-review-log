import { SiteNav } from "@client/widgets/site-nav";
import { Form, Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";

export default function Invite(
  props:
    | (AuthProps & {
        ok: false;
        message: string;
      })
    | (AuthProps & {
        ok: true;
        token: string;
        email: string;
        errors: string | null;
      }),
) {
  if (!props.ok) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <SiteNav auth={props.auth} />
        <main className="mx-auto max-w-lg px-4 py-16 font-sans">
          <h1 className="text-2xl font-semibold tracking-tight">Invitation</h1>
          <p className="mt-4 text-neutral-400">{props.message}</p>
          <p className="mt-8">
            <Link href="/" className="text-neutral-400 hover:text-white">
              ← Back home
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-md px-4 py-16 font-sans">
        <h1 className="text-2xl font-semibold tracking-tight">
          Accept invitation
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Create your writer account for{" "}
          <span className="text-neutral-200">{props.email}</span>.
        </p>
        {props.errors ? (
          <p className="mt-4 rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
            {props.errors}
          </p>
        ) : null}
        <Form
          action={`/invite/${props.token}`}
          method="post"
          className="mt-8 space-y-4"
        >
          <input type="hidden" name="token" value={props.token} />
          <input type="hidden" name="email" value={props.email} />
          <label className="block text-sm text-neutral-300">
            Email
            <input
              type="email"
              readOnly
              value={props.email}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Display name
            <input
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Confirm password
            <input
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
          >
            Create account
          </button>
        </Form>
      </main>
    </div>
  );
}
