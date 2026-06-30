import {
  WEEKLY_REVIEW_CATEGORIES,
  type WeeklyReviewCategory,
  type WeeklyReviewCategoryLabel,
} from "@/features/weekly-review/types/weekly-review";

const CATEGORY_LABELS: Record<WeeklyReviewCategory, WeeklyReviewCategoryLabel> = {
  tshirt: "T-Shirt",
  shirt: "Shirt",
  knit: "Knit",
  hoodie: "Hoodie",
  vest: "Vest",
  cardigan: "Cardigan",
  pants: "Pants",
  shorts: "Shorts",
  skirt: "Skirt",
  dress: "Dress",
  jacket: "Jacket",
  coat: "Coat",
  padding: "Padding",
};

const CATEGORY_ALIASES: Record<string, WeeklyReviewCategory> = {
  tshirt: "tshirt",
  t_shirt: "tshirt",
  "t-shirt": "tshirt",
  tee: "tshirt",
  shirt: "shirt",
  knit: "knit",
  knite: "knit",
  hoodie: "hoodie",
  hoddie: "hoodie",
  vest: "vest",
  cardigan: "cardigan",
  pants: "pants",
  shorts: "shorts",
  skirt: "skirt",
  dress: "dress",
  jacket: "jacket",
  coat: "coat",
  padding: "padding",
};

const CATEGORY_ORDER = new Map<WeeklyReviewCategory, number>(
  WEEKLY_REVIEW_CATEGORIES.map((category, index) => [category, index]),
);

function normalizeCategoryValue(value: string) {
  return value.trim().toLowerCase();
}

export function parseWeeklyReviewCategory(rawCategory: string): WeeklyReviewCategory | null {
  const normalized = normalizeCategoryValue(rawCategory);
  return CATEGORY_ALIASES[normalized] ?? null;
}

export function toWeeklyReviewCategory(rawCategory: string): WeeklyReviewCategory {
  return parseWeeklyReviewCategory(rawCategory) ?? "tshirt";
}

export function getWeeklyReviewCategoryLabel(
  category: WeeklyReviewCategory,
): WeeklyReviewCategoryLabel {
  return CATEGORY_LABELS[category];
}

export function getWeeklyReviewCategoryOrder(category: WeeklyReviewCategory) {
  return CATEGORY_ORDER.get(category) ?? WEEKLY_REVIEW_CATEGORIES.length;
}

export function sortByWeeklyReviewCategory<T extends { category: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftCategory = parseWeeklyReviewCategory(left.category);
    const rightCategory = parseWeeklyReviewCategory(right.category);
    const leftOrder = leftCategory
      ? getWeeklyReviewCategoryOrder(leftCategory)
      : WEEKLY_REVIEW_CATEGORIES.length;
    const rightOrder = rightCategory
      ? getWeeklyReviewCategoryOrder(rightCategory)
      : WEEKLY_REVIEW_CATEGORIES.length;

    return leftOrder - rightOrder;
  });
}
