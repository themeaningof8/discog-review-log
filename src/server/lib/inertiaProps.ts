import type { SessionUser } from "../types.js";

export function withAuth<T extends Record<string, unknown>>(
  c: {
    get(key: "user"): SessionUser | null;
  },
  props: T,
): T & { auth: { user: SessionUser | null } } {
  return { ...props, auth: { user: c.get("user") ?? null } };
}
