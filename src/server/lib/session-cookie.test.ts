import { describe, expect, it } from "vitest";
import { signSessionCookie, verifySessionCookie } from "./session-cookie.js";

describe("session-cookie", () => {
  const secret = "test-secret-at-least-this-long";

  it("round-trips session id", async () => {
    const sessionId = crypto.randomUUID();
    const raw = await signSessionCookie(sessionId, secret);
    const out = await verifySessionCookie(raw, secret);
    expect(out).toBe(sessionId);
  });

  it("rejects tampered signature", async () => {
    const sessionId = crypto.randomUUID();
    const raw = await signSessionCookie(sessionId, secret);
    const tampered = raw.replace(/^[^.]+/, crypto.randomUUID());
    expect(await verifySessionCookie(tampered, secret)).toBeNull();
  });

  it("rejects malformed cookie strings", async () => {
    expect(await verifySessionCookie("no-dot", secret)).toBeNull();
    expect(await verifySessionCookie(".onlysig", secret)).toBeNull();
    expect(await verifySessionCookie("", secret)).toBeNull();
  });

  it("rejects wrong secret", async () => {
    const sessionId = crypto.randomUUID();
    const raw = await signSessionCookie(sessionId, secret);
    expect(
      await verifySessionCookie(raw, "different-secret-value-here"),
    ).toBeNull();
  });
});
