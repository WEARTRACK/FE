import type { ClosetCategory } from "@/features/closet/types/closet-item";

export type ClosetCategoryStatistic = {
  category: ClosetCategory | "others";
  label: string;
  count: number;
  ratio: number;
  rank: number;
};

export type ClosetStatisticsSummary = {
  totalCount: number;
  rankedCategories: ClosetCategoryStatistic[];
};
