import { describe, expect, it } from "vitest";

import { isValidClosetId, parseClosetId } from "./closet-id";

describe("closet-id", () => {
  it("validates positive integer closetId", () => {
    expect(isValidClosetId(1)).toBe(true);
    expect(isValidClosetId(7)).toBe(true);
    expect(isValidClosetId(0)).toBe(false);
    expect(isValidClosetId(-1)).toBe(false);
    expect(isValidClosetId(1.1)).toBe(false);
  });

  it("parses closetId from route param", () => {
    expect(parseClosetId("3")).toBe(3);
    expect(parseClosetId("0")).toBeNull();
    expect(parseClosetId("abc")).toBeNull();
  });
});
