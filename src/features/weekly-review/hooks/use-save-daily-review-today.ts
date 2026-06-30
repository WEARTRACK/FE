import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveDailyReviewToday } from "@/features/weekly-review/api/weekly-review-api";
import { useSessionStore } from "@/stores/useSessionStore";

import { updateWeeklyReviewCachesAfterSave } from "./weekly-review-cache";

export function useSaveDailyReviewToday() {
  const queryClient = useQueryClient();
  const memberId = useSessionStore((state) => state.memberId);

  return useMutation({
    mutationFn: saveDailyReviewToday,
    onSuccess: (weeklyReviewResult) => {
      if (!memberId) {
        return;
      }

      updateWeeklyReviewCachesAfterSave(queryClient, memberId, weeklyReviewResult);
    },
  });
}
