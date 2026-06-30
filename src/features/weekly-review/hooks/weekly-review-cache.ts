import type { QueryClient } from "@tanstack/react-query";

import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import type {
  DailyReviewTodayResultApi,
  WeeklyReviewResultApi,
} from "@/features/weekly-review/api/weekly-review-api-types";

function updateDailyReviewSelection(
  dailyReviewToday: DailyReviewTodayResultApi | undefined,
  selectedClothesIds: number[],
): DailyReviewTodayResultApi | undefined {
  if (!dailyReviewToday) {
    return dailyReviewToday;
  }

  const selectedClothesIdSet = new Set(selectedClothesIds);

  return {
    ...dailyReviewToday,
    completed: true,
    categories: dailyReviewToday.categories.map((category) => {
      const clothes = category.clothes.map((item) => ({
        ...item,
        selected: selectedClothesIdSet.has(item.clothesId),
      }));

      return {
        ...category,
        selectedCount: clothes.filter((item) => item.selected).length,
        clothes,
      };
    }),
  };
}

export function updateWeeklyReviewCachesAfterSave(
  queryClient: QueryClient,
  memberId: number,
  weeklyReviewResult: WeeklyReviewResultApi,
  selectedClothesIds: number[],
) {
  queryClient.setQueryData(
    weeklyReviewQueryKeys.currentWeeklyReview(memberId),
    weeklyReviewResult,
  );
  queryClient.setQueryData(
    weeklyReviewQueryKeys.weeklyReviewByStartDate(memberId, weeklyReviewResult.weekStartDate),
    weeklyReviewResult,
  );
  queryClient.setQueryData<DailyReviewTodayResultApi | undefined>(
    weeklyReviewQueryKeys.dailyReviewToday(memberId),
    (currentDailyReviewToday) =>
      updateDailyReviewSelection(currentDailyReviewToday, selectedClothesIds),
  );
  void queryClient.invalidateQueries({
    queryKey: weeklyReviewQueryKeys.weeklyClosetUsage(memberId),
  });
}
