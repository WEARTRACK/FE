import { useQuery } from "@tanstack/react-query";

import { fetchClosetList } from "@/features/closet/api/closet-list-api";
import { useSessionStore } from "@/stores/useSessionStore";

export const closetListQueryKey = ["closet", "list"] as const;

export function useClosetList() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: closetListQueryKey,
    queryFn: fetchClosetList,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });
}
