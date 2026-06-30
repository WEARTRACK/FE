import { useQuery } from "@tanstack/react-query";

import { fetchCurrentWeeklyReview } from "@/features/weekly-review/api/weekly-review-api";
import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import { useSessionStore } from "@/stores/useSessionStore";

export function useCurrentWeeklyReview() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId
      ? weeklyReviewQueryKeys.currentWeeklyReview(memberId)
      : weeklyReviewQueryKeys.weeklyReviews(0),
    queryFn: fetchCurrentWeeklyReview,
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}
