import { describe, expect, it } from "vitest";

import { clampClosetUsageRate, getClosetUsageProfile, getClosetUsageType } from "./closet-usage";

describe("closet-usage", () => {
  it.each([
    [0, "neglected"],
    [20, "neglected"],
    [21, "potential"],
    [50, "potential"],
    [51, "active"],
    [80, "active"],
    [81, "master"],
    [100, "master"],
  ] as const)("maps %i usage rate to %s type", (rate, expectedType) => {
    expect(getClosetUsageType(rate)).toBe(expectedType);
    expect(getClosetUsageProfile(rate).type).toBe(expectedType);
  });

  it.each([
    [-10, 0],
    [0, 0],
    [20.4, 20],
    [20.5, 21],
    [100, 100],
    [110, 100],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])("clamps %s to %i", (rate, expectedRate) => {
    expect(clampClosetUsageRate(rate)).toBe(expectedRate);
  });
});
