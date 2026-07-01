import { useQuery } from "@tanstack/react-query";

import { fetchDailyReviewToday } from "@/features/weekly-review/api/weekly-review-api";
import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import { useSessionStore } from "@/stores/useSessionStore";

export function useDailyReviewToday() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId
      ? weeklyReviewQueryKeys.dailyReviewToday(memberId)
      : weeklyReviewQueryKeys.dailyReviews(0),
    queryFn: fetchDailyReviewToday,
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}
