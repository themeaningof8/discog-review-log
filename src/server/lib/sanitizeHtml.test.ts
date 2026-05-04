import { describe, expect, it } from "vitest";
import { sanitizeReviewHtml } from "./sanitizeHtml.js";

describe("sanitizeReviewHtml", () => {
  it("drops script tags", () => {
    const out = sanitizeReviewHtml("<p>hi</p><script>alert(1)</script>");
    expect(out).not.toContain("script");
    expect(out).toContain("<p>");
  });
});
