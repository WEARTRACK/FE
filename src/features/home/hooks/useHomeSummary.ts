import { useQuery } from "@tanstack/react-query";

import { getHomeSummary, type HomeSummaryQuery } from "@/features/home/api/getHomeSummary";
import { useSessionStore } from "@/stores/useSessionStore";

export function useHomeSummary(query: HomeSummaryQuery = {}) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const page = query.page ?? 0;
  const size = query.size ?? 10;

  return useQuery({
    queryKey: ["home-summary", page, size],
    queryFn: () => getHomeSummary({ page, size }),
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
    refetchOnMount: true,
  });
}
