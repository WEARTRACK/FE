import type { QueryClient } from "@tanstack/react-query";

import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import type { WeeklyReviewResultApi } from "@/features/weekly-review/api/weekly-review-api-types";

export function updateWeeklyReviewCachesAfterSave(
  queryClient: QueryClient,
  memberId: number,
  weeklyReviewResult: WeeklyReviewResultApi,
) {
  queryClient.setQueryData(
    weeklyReviewQueryKeys.currentWeeklyReview(memberId),
    weeklyReviewResult,
  );
  queryClient.setQueryData(
    weeklyReviewQueryKeys.weeklyReviewByStartDate(memberId, weeklyReviewResult.weekStartDate),
    weeklyReviewResult,
  );

  void queryClient.invalidateQueries({
    queryKey: weeklyReviewQueryKeys.dailyReviewToday(memberId),
  });
}
