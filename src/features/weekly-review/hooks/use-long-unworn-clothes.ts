import { useQuery } from "@tanstack/react-query";

import { fetchWeeklyLongUnwornClothes } from "@/features/weekly-review/api/weekly-review-api";
import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import type { WeeklyLongUnwornClothesResult } from "@/features/weekly-review/types/weekly-review";
import { useSessionStore } from "@/stores/useSessionStore";

export function useLongUnwornClothes() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery<WeeklyLongUnwornClothesResult, Error>({
    queryKey: memberId
      ? weeklyReviewQueryKeys.longUnwornClothes(memberId)
      : weeklyReviewQueryKeys.longUnwornClothes(0),
    queryFn: fetchWeeklyLongUnwornClothes,
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}
