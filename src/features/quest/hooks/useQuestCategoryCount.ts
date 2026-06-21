import { useQuery } from "@tanstack/react-query";

import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { useSessionStore } from "@/stores/useSessionStore";

export function useQuestCategoryCount(categories: readonly string[]) {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["quest-category-count", categories],
    queryFn: async () => {
      const categorySet = new Set(categories);
      const items = await getClosetRepository().getAllItems();

      return items.reduce(
        (count, item) => (categorySet.has(item.category) ? count + 1 : count),
        0,
      );
    },
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
    refetchOnMount: true,
  });
}
