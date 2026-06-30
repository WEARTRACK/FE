import { useQuery } from "@tanstack/react-query";

import {
  fetchCurrentWeeklyReview,
  fetchWeeklyClosetUsageAnalysis,
  fetchWeeklyWornClothes,
} from "@/features/weekly-review/api/weekly-review-api";
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

export function useWeeklyClosetUsageAnalysis() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId
      ? weeklyReviewQueryKeys.weeklyClosetUsageAnalysis(memberId)
      : weeklyReviewQueryKeys.weeklyClosetUsage(0),
    queryFn: fetchWeeklyClosetUsageAnalysis,
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}

export function useWeeklyWornClothes() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId
      ? weeklyReviewQueryKeys.weeklyWornClothes(memberId)
      : weeklyReviewQueryKeys.weeklyClosetUsage(0),
    queryFn: fetchWeeklyWornClothes,
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}
