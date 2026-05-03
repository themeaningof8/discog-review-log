import { describe, expect, it } from "vitest";
import { parseDiscogsReleaseId } from "./discogsReleaseId.js";

describe("parseDiscogsReleaseId", () => {
  it("parses plain id", () => {
    expect(parseDiscogsReleaseId("249504")).toBe(249_504);
  });
  it("parses release URL", () => {
    expect(
      parseDiscogsReleaseId(
        "https://www.discogs.com/release/249504-Abbey-Road",
      ),
    ).toBe(249_504);
  });
  it("returns null for junk", () => {
    expect(parseDiscogsReleaseId("nope")).toBeNull();
  });
});
