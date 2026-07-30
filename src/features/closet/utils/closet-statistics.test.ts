import { describe, expect, it } from "vitest";

import type { ClosetItem } from "../types/closet-item";
import { buildClosetStatistics } from "./closet-statistics";

const BASE_ITEM: Omit<ClosetItem, "id" | "category" | "categoryLabel"> = {
  sectionId: "section-1",
  imageUri: "https://example.com/image.png",
  price: 10000,
  color: "black",
  colorLabel: "Black",
};

function createItem(
  id: number,
  category: ClosetItem["category"],
  categoryLabel: string,
): ClosetItem {
  return {
    id: `item-${id}`,
    category,
    categoryLabel,
    ...BASE_ITEM,
  };
}

function sumCategoryCounts(result: ReturnType<typeof buildClosetStatistics>) {
  return result.rankedCategories.reduce((sum, target) => sum + target.count, 0);
}

describe("buildClosetStatistics", () => {
  it("returns zero summary for empty input", () => {
    const result = buildClosetStatistics([]);

    expect(result.totalCount).toBe(0);
    expect(result.rankedCategories).toEqual([]);
  });

  it("sorts by count desc and by category key asc on ties", () => {
    const items = [
      createItem(1, "shirt", "Shirt"),
      createItem(2, "shirt", "Shirt"),
      createItem(3, "jacket", "Jacket"),
      createItem(4, "jacket", "Jacket"),
      createItem(5, "coat", "Coat"),
      createItem(6, "coat", "Coat"),
    ];

    const result = buildClosetStatistics(items);
    const categories = result.rankedCategories.map((target) => target.category);

    expect(categories).toEqual(["coat", "jacket", "shirt"]);
  });

  it("keeps top 4 categories and aggregates remaining into Others", () => {
    const items = [
      createItem(1, "shirt", "Shirt"),
      createItem(2, "shirt", "Shirt"),
      createItem(3, "jacket", "Jacket"),
      createItem(4, "jacket", "Jacket"),
      createItem(5, "coat", "Coat"),
      createItem(6, "coat", "Coat"),
      createItem(7, "dress", "Dress"),
      createItem(8, "knit", "Knit"),
    ];

    const result = buildClosetStatistics(items);
    const lastCategory = result.rankedCategories[result.rankedCategories.length - 1];

    expect(result.totalCount).toBe(8);
    expect(result.rankedCategories).toHaveLength(5);
    expect(lastCategory).toMatchObject({ category: "others", count: 1, label: "Others", rank: 5 });
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });

  it("returns ranks and ratios that can be shared by chart and list", () => {
    const items = [
      createItem(1, "shirt", "Shirt"),
      createItem(2, "shirt", "Shirt"),
      createItem(3, "coat", "Coat"),
    ];
    const result = buildClosetStatistics(items);

    expect(result.rankedCategories[0]).toMatchObject({ category: "shirt", count: 2, rank: 1 });
    expect(result.rankedCategories[1]).toMatchObject({ category: "coat", count: 1, rank: 2 });
    expect(result.rankedCategories[0]?.ratio).toBeCloseTo(2 / 3, 4);
    expect(result.rankedCategories[1]?.ratio).toBeCloseTo(1 / 3, 4);
    expect(result.rankedCategories.reduce((sum, target) => sum + target.ratio, 0)).toBeCloseTo(
      1,
      4,
    );
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });

  it("does not create Others when there are exactly four regular categories", () => {
    const items = [
      createItem(1, "shirt", "Shirt"),
      createItem(2, "jacket", "Jacket"),
      createItem(3, "coat", "Coat"),
      createItem(4, "dress", "Dress"),
    ];

    const result = buildClosetStatistics(items);
    const hasOthers = result.rankedCategories.some((target) => target.category === "others");

    expect(result.rankedCategories).toHaveLength(4);
    expect(hasOthers).toBe(false);
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });

  it("aggregates multiple tail categories into Others", () => {
    const items = [
      createItem(1, "shirt", "Shirt"),
      createItem(2, "shirt", "Shirt"),
      createItem(3, "jacket", "Jacket"),
      createItem(4, "jacket", "Jacket"),
      createItem(5, "coat", "Coat"),
      createItem(6, "coat", "Coat"),
      createItem(7, "dress", "Dress"),
      createItem(8, "knit", "Knit"),
      createItem(9, "pants", "Pants"),
    ];

    const result = buildClosetStatistics(items);
    const others = result.rankedCategories.find((target) => target.category === "others");

    expect(others?.count).toBe(2);
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });

  it("keeps Others at the bottom even when it has the highest count", () => {
    const items = [
      createItem(1, "others", "Others"),
      createItem(2, "others", "Others"),
      createItem(3, "others", "Others"),
      createItem(4, "others", "Others"),
      createItem(5, "cardigan", "Cardigan"),
      createItem(6, "cardigan", "Cardigan"),
      createItem(7, "padding", "Padding"),
      createItem(8, "hoodie", "Hoodie"),
    ];

    const result = buildClosetStatistics(items);
    const categories = result.rankedCategories.map((target) => target.category);
    const others = result.rankedCategories[result.rankedCategories.length - 1];

    expect(categories).toEqual(["cardigan", "hoodie", "padding", "others"]);
    expect(others).toMatchObject({ category: "others", count: 4, label: "Others" });
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });

  it("combines real others with regular categories outside the top 4", () => {
    const items = [
      createItem(1, "others", "Others"),
      createItem(2, "others", "Others"),
      createItem(3, "others", "Others"),
      createItem(4, "cardigan", "Cardigan"),
      createItem(5, "cardigan", "Cardigan"),
      createItem(6, "padding", "Padding"),
      createItem(7, "padding", "Padding"),
      createItem(8, "hoodie", "Hoodie"),
      createItem(9, "dress", "Dress"),
    ];

    const result = buildClosetStatistics(items);
    const categories = result.rankedCategories.map((target) => target.category);
    const others = result.rankedCategories[result.rankedCategories.length - 1];

    expect(categories).toEqual(["cardigan", "padding", "dress", "hoodie", "others"]);
    expect(others).toMatchObject({ category: "others", count: 3, label: "Others", rank: 5 });
    expect(sumCategoryCounts(result)).toBe(result.totalCount);
  });
});
