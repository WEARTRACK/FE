import type {
  ClosetCategoryStatistic,
  ClosetStatisticsSummary,
} from "@/features/closet/types/closet-statistics";
import type { ClosetItem } from "@/features/closet/types/closet-item";

const MAX_RANKED_CATEGORIES = 4;
const OTHERS_RANK = 5;
const CATEGORY_LABEL_BY_KEY: Record<string, string> = {
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

type CategoryCount = {
  category: string;
  label: string;
  count: number;
};

function normalizeCategoryKey(value: string) {
  return value.trim().toLowerCase();
}

function toDisplayLabel(value: string) {
  if (value === "tshirt") {
    return "T-Shirt";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildClosetStatistics(items: ClosetItem[]): ClosetStatisticsSummary {
  const totalCount = items.length;

  if (totalCount === 0) {
    return { totalCount, rankedCategories: [] };
  }

  const categoryCountMap = new Map<string, CategoryCount>();

  items.forEach((item) => {
    const normalizedCategory = normalizeCategoryKey(item.category);
    const target = categoryCountMap.get(normalizedCategory);
    if (target) {
      target.count += 1;
      return;
    }

    categoryCountMap.set(normalizedCategory, {
      category: normalizedCategory,
      label: CATEGORY_LABEL_BY_KEY[normalizedCategory] ?? toDisplayLabel(normalizedCategory),
      count: 1,
    });
  });

  const sortedCounts = Array.from(categoryCountMap.values()).sort((left, right) => {
    if (left.count !== right.count) {
      return right.count - left.count;
    }

    // Tie-breaker is based on internal category key, not label.
    return left.category.localeCompare(right.category);
  });

  const rankedTopCategories = sortedCounts
    .slice(0, MAX_RANKED_CATEGORIES)
    .map<ClosetCategoryStatistic>((target, index) => ({
      category: target.category,
      label: target.label,
      count: target.count,
      ratio: target.count / totalCount,
      rank: index + 1,
    }));

  const othersCount = sortedCounts
    .slice(MAX_RANKED_CATEGORIES)
    .reduce((sum, target) => sum + target.count, 0);

  const rankedCategories =
    othersCount > 0
      ? [
          ...rankedTopCategories,
          {
            category: "others",
            label: "Others",
            count: othersCount,
            ratio: othersCount / totalCount,
            rank: OTHERS_RANK,
          } satisfies ClosetCategoryStatistic,
        ]
      : rankedTopCategories;

  return { totalCount, rankedCategories };
}
