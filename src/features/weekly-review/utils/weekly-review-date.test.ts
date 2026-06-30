import { describe, expect, it } from "vitest";

import { formatWeeklyReviewDateRange } from "./weekly-review-date";

describe("weekly-review-date", () => {
  it("formats same-month date ranges without repeating the month", () => {
    expect(formatWeeklyReviewDateRange("2026-06-22", "2026-06-28")).toBe("6/22-28");
  });

  it("formats cross-month date ranges with the end month", () => {
    expect(formatWeeklyReviewDateRange("2026-06-29", "2026-07-05")).toBe("6/29-7/5");
  });

  it("returns an empty string for invalid date input", () => {
    expect(formatWeeklyReviewDateRange("2026-06-29", "invalid-date")).toBe("");
  });
});
