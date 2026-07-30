export type ClosetCategoryStatistic = {
  category: string | "others";
  label: string;
  count: number;
  ratio: number;
  rank: number;
};

export type ClosetStatisticsSummary = {
  totalCount: number;
  rankedCategories: ClosetCategoryStatistic[];
};
