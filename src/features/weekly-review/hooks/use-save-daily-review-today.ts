import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveDailyReview } from "@/features/weekly-review/api/weekly-review-api";
import type {
  SaveDailyReviewTodayParams,
  WeeklyReviewResultApi,
} from "@/features/weekly-review/api/weekly-review-api-types";
import { useSessionStore } from "@/stores/useSessionStore";

import { updateWeeklyReviewCachesAfterSave } from "./weekly-review-cache";

export function useSaveDailyReviewToday() {
  const queryClient = useQueryClient();
  const memberId = useSessionStore((state) => state.memberId);

  return useMutation<WeeklyReviewResultApi, Error, SaveDailyReviewTodayParams>({
    mutationFn: saveDailyReview,
    onSuccess: (weeklyReviewResult, { clothesIds }) => {
      if (!memberId) {
        return;
      }

      try {
        updateWeeklyReviewCachesAfterSave(queryClient, memberId, weeklyReviewResult, clothesIds);
      } catch {
        // 저장 성공 후 화면 이동이 캐시 보정 실패에 막히지 않도록 합니다.
      }
    },
  });
}
