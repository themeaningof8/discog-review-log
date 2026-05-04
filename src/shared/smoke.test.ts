import fc from "fast-check";
import { describe, it } from "vitest";

describe("smoke", () => {
  it("fast-check wiring", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a),
    );
  });
});
