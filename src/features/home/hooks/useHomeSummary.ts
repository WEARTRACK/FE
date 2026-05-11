import { useQuery } from "@tanstack/react-query";

import { getHomeSummary } from "@/features/home/api/getHomeSummary";
import { useSessionStore } from "@/stores/useSessionStore";

export function useHomeSummary() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["home-summary"],
    queryFn: getHomeSummary,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
  });
}
