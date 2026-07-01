import { describe, expect, it } from "vitest";

import { groupCategoriesByExpense, sortCategoriesByExpense } from "./reportCategory";

describe("sortCategoriesByExpense", () => {
  const categories = [
    { category: "T-SHIRT", expenseAmount: 0 },
    { category: "SHIRT", expenseAmount: 30_000 },
    { category: "KNIT", expenseAmount: 50_000 },
    { category: "HOODIE", expenseAmount: 0 },
    { category: "VEST", expenseAmount: 30_000 },
    { category: "CARDIGAN", expenseAmount: 0 },
  ];

  it("places spending categories first by amount and preserves ties and zero-value order", () => {
    expect(sortCategoriesByExpense(categories).map((item) => item.category)).toEqual([
      "KNIT",
      "SHIRT",
      "VEST",
      "T-SHIRT",
      "HOODIE",
      "CARDIGAN",
    ]);
  });

  it("preserves the original order when every category has zero spending", () => {
    const zeroCategories = categories.map((item) => ({ ...item, expenseAmount: 0 }));

    expect(sortCategoriesByExpense(zeroCategories)).toEqual(zeroCategories);
  });
});

describe("groupCategoriesByExpense", () => {
  it("combines category aliases and sums their expenses", () => {
    expect(
      groupCategoriesByExpense([
        { category: "T-SHIRT", expenseAmount: 35_900 },
        { category: "T_SHIRT", expenseAmount: 23_800 },
        { category: "t shirt", expenseAmount: 10_000 },
      ]),
    ).toEqual([
      {
        category: "T-SHIRT",
        expenseAmount: 69_700,
        sourceCategories: ["T-SHIRT", "T_SHIRT", "t shirt"],
      },
    ]);
  });
});
