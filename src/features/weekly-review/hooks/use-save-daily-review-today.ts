import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveDailyReviewToday } from "@/features/weekly-review/api/weekly-review-api";
import type { WeeklyReviewResultApi } from "@/features/weekly-review/api/weekly-review-api-types";
import { useSessionStore } from "@/stores/useSessionStore";

import { updateWeeklyReviewCachesAfterSave } from "./weekly-review-cache";

export function useSaveDailyReviewToday() {
  const queryClient = useQueryClient();
  const memberId = useSessionStore((state) => state.memberId);

  return useMutation<WeeklyReviewResultApi, Error, number[]>({
    mutationFn: saveDailyReviewToday,
    onSuccess: (weeklyReviewResult, selectedClothesIds) => {
      if (!memberId) {
        return;
      }

      try {
        updateWeeklyReviewCachesAfterSave(
          queryClient,
          memberId,
          weeklyReviewResult,
          selectedClothesIds,
        );
      } catch {
        // 저장 성공 후 화면 이동이 캐시 보정 실패에 막히지 않도록 합니다.
      }
    },
  });
}
