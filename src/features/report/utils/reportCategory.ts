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

export function formatCategoryLabel(category: string) {
  const normalizedCategory = category.trim().toUpperCase().replaceAll("_", "-");

  return categoryLabels[normalizedCategory] ?? category;
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
