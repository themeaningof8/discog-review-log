import { SiteNav } from "@client/widgets/site-nav";
import { Form, Link } from "@inertiajs/react";
import type { AuthProps } from "@shared/auth";
import { useState } from "react";

export default function AdminUsers(
  props: AuthProps & {
    users: {
      id: string;
      email: string;
      name: string;
      role: "writer" | "admin";
    }[];
  },
) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={props.auth} />
      <main className="mx-auto max-w-4xl px-4 py-10 font-sans">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <Link
            href="/admin"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        <section className="mt-10 rounded-lg border border-neutral-900 bg-neutral-900/30 p-6">
          <h2 className="text-lg font-semibold">Create invitation</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Generates a single-use invite link (no email sending in v1).
          </p>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              setInviteUrl(null);
              const fd = new FormData();
              fd.set("email", inviteEmail);
              const res = await fetch("/admin/invitations", {
                method: "POST",
                body: fd,
                credentials: "same-origin",
                headers: {
                  Accept: "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                },
              });
              if (!res.ok) {
                let message = `HTTP ${res.status}`;
                try {
                  const body = (await res.json()) as { error?: string };
                  if (body.error) message = body.error;
                } catch {
                  /* ignore non-JSON body */
                }
                setInviteUrl(`Error: ${message}`);
                return;
              }
              const data = (await res.json()) as { inviteUrl: string };
              setInviteUrl(data.inviteUrl);
            }}
          >
            <label className="block flex-1 text-sm text-neutral-300">
              Email
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                required
                className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
            >
              Create invite
            </button>
          </form>
          {inviteUrl ? (
            <p className="mt-4 break-all rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200">
              {inviteUrl}
            </p>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-900 text-left text-neutral-500">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-900">
                  <td className="py-3 pr-4 text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-neutral-400">{u.email}</td>
                  <td className="py-3 pr-4 uppercase text-neutral-500">
                    {u.role}
                  </td>
                  <td className="py-3">
                    <Form
                      action={`/admin/users/${u.id}/role`}
                      method="post"
                      className="inline"
                    >
                      <input
                        type="hidden"
                        name="role"
                        value={u.role === "admin" ? "writer" : "admin"}
                      />
                      <button
                        type="submit"
                        className="text-sm text-neutral-300 hover:text-white"
                      >
                        Make {u.role === "admin" ? "writer" : "admin"}
                      </button>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
