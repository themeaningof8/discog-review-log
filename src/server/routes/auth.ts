import { zValidator } from "@hono/zod-validator";
import { normalizeEmail } from "@shared/email";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import * as z from "zod";
import type { Db } from "../db/client";
import { invitations, users } from "../db/schema.js";
import { withAuth } from "../lib/inertiaProps.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { createSession, destroySession } from "../lib/session.js";
import { requireAdmin } from "../middleware/auth.js";
import type { Env, SessionUser } from "../types";

const hexToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

type Variables = {
  db: Db;
  user: SessionUser | null;
};

function denyBootstrapUnlessAllowed<E extends { Bindings: Env }>(
  c: Context<E>,
): Response | undefined {
  const secret = c.env.SETUP_SECRET;
  const host = new URL(c.req.url).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const headerSecret =
    c.req.header("X-Setup-Secret") ?? c.req.header("x-setup-secret");
  if (secret) {
    if (headerSecret !== secret) {
      return c.text("Forbidden", 403);
    }
    return undefined;
  }
  if (!isLocal) {
    return c.text(
      "Forbidden: set SETUP_SECRET to bootstrap outside localhost",
      403,
    );
  }
  return undefined;
}

export const authRoutes = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

authRoutes.get("/login", (c) =>
  c.render("Auth/Login", withAuth(c, { errors: null as string | null })),
);

const loginSchema = z.object({
  email: z.string().trim().pipe(z.email()).transform(normalizeEmail),
  password: z.string().min(1),
});

authRoutes.post(
  "/login",
  zValidator("form", loginSchema, (result, c) => {
    if (!result.success) {
      return c.render(
        "Auth/Login",
        withAuth(c, { errors: "Invalid email or password" }),
      );
    }
  }),
  async (c) => {
    if (!c.env.APP_SECRET) {
      return c.render(
        "Auth/Login",
        withAuth(c, {
          errors: "Server is misconfigured (missing APP_SECRET).",
        }),
      );
    }
    const { email, password } = c.req.valid("form");
    const db = c.get("db");
    const [u] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!u || !(await verifyPassword(password, u.passwordHash))) {
      return c.render(
        "Auth/Login",
        withAuth(c, { errors: "Invalid email or password" }),
      );
    }
    await createSession(c, { id: u.id, role: u.role });
    return c.redirect("/dashboard");
  },
);

authRoutes.post("/logout", async (c) => {
  await destroySession(c);
  return c.redirect("/");
});

authRoutes.get("/invite/:token", async (c) => {
  const token = c.req.param("token");
  const db = c.get("db");
  const [inv] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);
  if (!inv || inv.usedAt) {
    return c.render(
      "Auth/Invite",
      withAuth(c, {
        ok: false as const,
        message: "Invalid or already used invitation.",
      }),
    );
  }
  if (inv.expiresAt.getTime() <= Date.now()) {
    return c.render(
      "Auth/Invite",
      withAuth(c, {
        ok: false as const,
        message: "Invitation expired.",
      }),
    );
  }
  return c.render(
    "Auth/Invite",
    withAuth(c, {
      ok: true as const,
      token,
      email: inv.email,
      errors: null as string | null,
    }),
  );
});

const registerSchema = z
  .object({
    token: z.string().min(1),
    name: z.string().min(1),
    email: z.string().trim().pipe(z.email()).transform(normalizeEmail),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

authRoutes.post(
  "/invite/:token",
  zValidator("form", registerSchema, async (result, c) => {
    if (result.success) return;
    const token = c.req.param("token");
    if (!token) {
      return c.text("Not found", 404);
    }
    const db = c.get("db");
    const [inv] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);
    if (!inv || inv.usedAt || inv.expiresAt.getTime() <= Date.now()) {
      return c.render(
        "Auth/Invite",
        withAuth(c, {
          ok: false as const,
          message: "Invalid invitation.",
        }),
      );
    }
    const msg = result.error.issues.map((i) => i.message).join(" ");
    return c.render(
      "Auth/Invite",
      withAuth(c, {
        ok: true as const,
        token,
        email: inv.email,
        errors: msg,
      }),
    );
  }),
  async (c) => {
    const paramToken = c.req.param("token");
    const data = c.req.valid("form");
    if (data.token !== paramToken) {
      return c.redirect(`/invite/${paramToken}`);
    }
    const db = c.get("db");
    const [inv] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, paramToken))
      .limit(1);
    if (!inv || inv.usedAt || inv.expiresAt.getTime() <= Date.now()) {
      return c.render(
        "Auth/Invite",
        withAuth(c, {
          ok: false as const,
          message: "Invalid invitation.",
        }),
      );
    }
    if (normalizeEmail(inv.email) !== data.email) {
      return c.render(
        "Auth/Invite",
        withAuth(c, {
          ok: true as const,
          token: paramToken,
          email: inv.email,
          errors: "Email must match the invitation.",
        }),
      );
    }
    if (!c.env.APP_SECRET) {
      return c.render(
        "Auth/Invite",
        withAuth(c, {
          ok: true as const,
          token: paramToken,
          email: inv.email,
          errors: "Server is misconfigured (missing APP_SECRET).",
        }),
      );
    }
    const [{ n: existingUsers }] = await db.select({ n: count() }).from(users);
    const role = existingUsers === 0 ? "admin" : "writer";
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(data.password);
    try {
      await db.insert(users).values({
        id,
        email: data.email,
        name: data.name,
        passwordHash,
        role,
        invitedBy: inv.invitedBy ?? null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE") || msg.includes("unique")) {
        return c.render(
          "Auth/Invite",
          withAuth(c, {
            ok: true as const,
            token: paramToken,
            email: inv.email,
            errors: "An account with this email already exists.",
          }),
        );
      }
      throw e;
    }
    await db
      .update(invitations)
      .set({ usedAt: new Date() })
      .where(eq(invitations.id, inv.id));
    await createSession(c, { id, role });
    return c.redirect("/dashboard");
  },
);

const inviteEmailSchema = z.object({
  email: z.string().trim().pipe(z.email()).transform(normalizeEmail),
});

authRoutes.post(
  "/setup/first-invitation",
  zValidator("form", inviteEmailSchema),
  async (c) => {
    const denied = denyBootstrapUnlessAllowed(c);
    if (denied) return denied;
    const db = c.get("db");
    const [{ n: userCount }] = await db.select({ n: count() }).from(users);
    if (userCount > 0) {
      return c.text("Forbidden", 403);
    }
    const now = new Date();
    const [{ n: activeInvites }] = await db
      .select({ n: count() })
      .from(invitations)
      .where(and(isNull(invitations.usedAt), gt(invitations.expiresAt, now)));
    if (activeInvites > 0) {
      return c.text("Forbidden", 403);
    }
    const { email } = c.req.valid("form");
    const id = crypto.randomUUID();
    const token = hexToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(invitations).values({
      id,
      token,
      email,
      expiresAt,
      usedAt: null,
    });
    const url = new URL(c.req.url);
    const base = `${url.protocol}//${url.host}`;
    return c.json({
      inviteUrl: `${base}/invite/${token}`,
    });
  },
);

authRoutes.post(
  "/admin/invitations",
  requireAdmin,
  zValidator("form", inviteEmailSchema),
  async (c) => {
    if (c.req.header("X-Requested-With") !== "XMLHttpRequest") {
      return c.text("Forbidden", 403);
    }
    const db = c.get("db");
    const currentUser = c.get("user");
    const { email } = c.req.valid("form");
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) {
      return c.json(
        { error: "An account with this email already exists." },
        409,
      );
    }
    const pending = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          isNull(invitations.usedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (pending.length > 0) {
      return c.json(
        { error: "An active invitation for this email already exists." },
        409,
      );
    }
    const id = crypto.randomUUID();
    const token = hexToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(invitations).values({
      id,
      token,
      email,
      expiresAt,
      usedAt: null,
      invitedBy: currentUser?.id ?? null,
    });
    const url = new URL(c.req.url);
    const base = `${url.protocol}//${url.host}`;
    return c.json({
      inviteUrl: `${base}/invite/${token}`,
    });
  },
);
