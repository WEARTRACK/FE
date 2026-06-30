import { describe, expect, it } from "vitest";

import {
  parseWeeklyReviewCategory,
  sortByWeeklyReviewCategory,
  toWeeklyReviewCategory,
} from "./weekly-review-category";

describe("weekly-review-category", () => {
  it("parses known category aliases", () => {
    expect(parseWeeklyReviewCategory("T-Shirt")).toBe("tshirt");
    expect(parseWeeklyReviewCategory(" hoddie ")).toBe("hoodie");
    expect(parseWeeklyReviewCategory("unknown")).toBeNull();
  });

  it("falls back to tshirt for unknown categories", () => {
    expect(toWeeklyReviewCategory("unknown")).toBe("tshirt");
  });

  it("sorts categories by weekly review display order and keeps unknown categories last", () => {
    const items = [
      { category: "coat", id: 1 },
      { category: "unknown", id: 2 },
      { category: "T-Shirt", id: 3 },
      { category: "pants", id: 4 },
      { category: "shirt", id: 5 },
      { category: " hoddie ", id: 6 },
    ];

    expect(sortByWeeklyReviewCategory(items).map((item) => item.id)).toEqual([3, 5, 6, 4, 1, 2]);
  });
});
