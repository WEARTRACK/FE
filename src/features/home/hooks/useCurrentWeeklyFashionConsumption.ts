import { useQuery } from "@tanstack/react-query";

import {
  getCurrentWeeklyFashionConsumption,
  type CurrentWeeklyFashionConsumptionQuery,
} from "@/features/home/api/getCurrentWeeklyFashionConsumption";
import { useSessionStore } from "@/stores/useSessionStore";

export function useCurrentWeeklyFashionConsumption(
  query: CurrentWeeklyFashionConsumptionQuery = {},
) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const page = query.page ?? 0;
  const size = query.size ?? 10;

  return useQuery({
    queryKey: ["current-weekly-fashion-consumption", page, size],
    queryFn: () => getCurrentWeeklyFashionConsumption({ page, size }),
    enabled: Boolean(accessToken),
    refetchOnMount: "always",
  });
}
