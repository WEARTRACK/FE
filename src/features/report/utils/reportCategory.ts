const categoryLabels: Record<string, string> = {
  "T-SHIRT": "T-Shirt",
  SHIRT: "Shirt",
  KNIT: "Knit",
  HOODIE: "Hoodie",
  VEST: "Vest",
  CARDIGAN: "Cardigan",
  PANTS: "Pants",
  SHORTS: "Shorts",
  SKIRT: "Skirt",
  DRESS: "Dress",
  JACKET: "Jacket",
  COAT: "Coat",
  PADDING: "Padding",
};

export type GroupedExpenseCategory = {
  category: string;
  expenseAmount: number;
  sourceCategories: string[];
};

export function normalizeCategory(category: string) {
  return category
    .trim()
    .toUpperCase()
    .replaceAll("_", "-")
    .replace(/\s+/g, "-")
    .replace("HODDIE", "HOODIE");
}

export function formatCategoryLabel(category: string) {
  const normalizedCategory = normalizeCategory(category);

  return categoryLabels[normalizedCategory] ?? category;
}

export function groupCategoriesByExpense(
  categories: { category: string; expenseAmount: number }[],
): GroupedExpenseCategory[] {
  const groupedCategories = new Map<string, GroupedExpenseCategory>();

  categories.forEach((item) => {
    const normalizedCategory = normalizeCategory(item.category);
    const existingCategory = groupedCategories.get(normalizedCategory);

    if (existingCategory) {
      existingCategory.expenseAmount += item.expenseAmount;

      if (!existingCategory.sourceCategories.includes(item.category)) {
        existingCategory.sourceCategories.push(item.category);
      }

      return;
    }

    groupedCategories.set(normalizedCategory, {
      category: normalizedCategory,
      expenseAmount: item.expenseAmount,
      sourceCategories: [item.category],
    });
  });

  return [...groupedCategories.values()];
}

export function sortCategoriesByExpense<T extends { expenseAmount: number }>(categories: T[]) {
  return categories
    .map((category, originalIndex) => ({ category, originalIndex }))
    .sort((first, second) => {
      if (first.category.expenseAmount !== second.category.expenseAmount) {
        return second.category.expenseAmount - first.category.expenseAmount;
      }

      return first.originalIndex - second.originalIndex;
    })
    .map(({ category }) => category);
}
