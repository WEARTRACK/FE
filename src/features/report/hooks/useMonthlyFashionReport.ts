import { useQuery } from "@tanstack/react-query";

import { getMonthlyFashionReport } from "@/features/report/api/monthlyFashionReportApi";
import { useSessionStore } from "@/stores/useSessionStore";

export function useMonthlyFashionReport({
  yearMonth,
  isCurrentMonth,
  enabled,
}: {
  yearMonth: string;
  isCurrentMonth: boolean;
  enabled: boolean;
}) {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["monthly-fashion-report", yearMonth],
    queryFn: () => getMonthlyFashionReport({ yearMonth: isCurrentMonth ? undefined : yearMonth }),
    enabled: Boolean(accessToken && enabled && yearMonth),
  });
}
