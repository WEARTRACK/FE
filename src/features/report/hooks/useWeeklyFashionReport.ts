import { useQuery } from "@tanstack/react-query";

import {
  getWeeklyCategoryClothes,
  getWeeklyFashionReport,
} from "@/features/report/api/weeklyFashionReportApi";
import { useSessionStore } from "@/stores/useSessionStore";

export function useWeeklyFashionReport(weekStartDate: string) {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["weekly-fashion-report", weekStartDate],
    queryFn: () => getWeeklyFashionReport({ weekStartDate }),
    enabled: Boolean(accessToken && weekStartDate),
  });
}

export function useWeeklyCategoryClothes(weekStartDate: string, category: string) {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["weekly-fashion-report", weekStartDate, "category", category, "clothes"],
    queryFn: () => getWeeklyCategoryClothes({ weekStartDate, category }),
    enabled: Boolean(accessToken && weekStartDate && category),
  });
}
