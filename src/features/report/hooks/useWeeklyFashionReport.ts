import { useQuery } from "@tanstack/react-query";

import {
  getCurrentWeeklyCategoryClothes,
  getWeeklyCategoryClothes,
  getWeeklyFashionReport,
  type WeeklyCategoryClothes,
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

export function useWeeklyCategoryClothes(
  weekStartDate: string,
  categories: string[],
  isCurrentWeek = false,
) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const uniqueCategories = [
    ...new Set(
      categories.map((category) =>
        category.trim().toUpperCase().replaceAll(" ", "-").replace("HODDIE", "HOODIE"),
      ),
    ),
  ];

  return useQuery({
    queryKey: [
      "weekly-fashion-report",
      isCurrentWeek ? "current" : weekStartDate,
      "categories",
      uniqueCategories,
      "clothes",
    ],
    queryFn: async (): Promise<WeeklyCategoryClothes> => {
      const results = await Promise.all(
        uniqueCategories.map((category) =>
          isCurrentWeek
            ? getCurrentWeeklyCategoryClothes({ category })
            : getWeeklyCategoryClothes({ weekStartDate, category }),
        ),
      );
      const firstResult = results[0];
      const clothesById = new Map(
        results.flatMap((result) => result.clothes).map((item) => [item.clothesId, item]),
      );

      return {
        weekStartDate: firstResult.weekStartDate,
        weekEndDate: firstResult.weekEndDate,
        category: firstResult.category,
        clothes: [...clothesById.values()],
      };
    },
    enabled: Boolean(
      accessToken && (isCurrentWeek || weekStartDate) && uniqueCategories.length > 0,
    ),
  });
}
