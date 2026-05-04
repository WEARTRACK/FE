import type { ClosetItem } from "@/features/closet/types/closet-item";
import type {
  ClosetCategoryStatistic,
  ClosetStatisticsSummary,
} from "@/features/closet/types/closet-statistics";

const MAX_RANKED_CATEGORIES = 4;
const OTHERS_RANK = 5;
const CATEGORY_LABEL_BY_KEY: Record<ClosetItem["category"], string> = {
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
  category: ClosetItem["category"];
  label: string;
  count: number;
};

export function buildClosetStatistics(items: ClosetItem[]): ClosetStatisticsSummary {
  const totalCount = items.length;

  if (totalCount === 0) {
    return { totalCount, rankedCategories: [] };
  }

  const categoryCountMap = new Map<ClosetItem["category"], CategoryCount>();

  items.forEach((item) => {
    const target = categoryCountMap.get(item.category);
    if (target) {
      target.count += 1;
      return;
    }

    categoryCountMap.set(item.category, {
      category: item.category,
      label: CATEGORY_LABEL_BY_KEY[item.category],
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
