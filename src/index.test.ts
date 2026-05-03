import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { add } from "./index.js";

describe("add", () => {
  it("adds small integers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("matches addition for integers (property)", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => add(a, b) === a + b),
    );
  });
});
