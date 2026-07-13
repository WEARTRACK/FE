import { useMemo } from "react";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import {
  ClosetItemBrowserScreen,
  type ClosetBrowserItem,
} from "@/features/closet/components/ClosetItemBrowserScreen";
import {
  mapServerCategoryToClosetCategory,
  mapServerColorToClosetColor,
} from "@/features/closet/api/closet-api-mappers";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import { useLongUnwornClothes } from "@/features/weekly-review/hooks/use-long-unworn-clothes";
import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import { queryClient } from "@/lib/queryClient";
import { useSessionStore } from "@/stores/useSessionStore";
import { WeeklyReviewRouteScaffold } from "@/features/weekly-review/screens/WeeklyReviewRouteScaffold";

function toDisplayLabel(value: string) {
  if (!value) {
    return "";
  }

  if (value === "tshirt") {
    return "T-shirt";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toBrowserItem(item: {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: string;
}): ClosetBrowserItem {
  const color = mapServerColorToClosetColor(item.color);
  const category = mapServerCategoryToClosetCategory(item.category);

  return {
    id: String(item.clothesId),
    clothesId: item.clothesId,
    imageUri: item.imageUrl,
    color,
    colorLabel: toDisplayLabel(color),
    category,
    categoryLabel: toDisplayLabel(category),
    price: 0,
    sectionId: null,
    sectionName: null,
  };
}

export function WeeklyReviewLongUnwornClothesScreen() {
  const router = useRouter();
  const repository = useMemo(() => getClosetRepository(), []);
  const memberId = useSessionStore((state) => state.memberId);
  const { data, isLoading, error, refetch } = useLongUnwornClothes();
  const { template } = useClosetTemplate(repository);
  const shouldRedirectToResult = data?.longUnwornClothesCount === 0;
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(weeklyReviewRoutes.result);
  };

  const browserItems = useMemo(() => (data?.clothes ?? []).map(toBrowserItem), [data?.clothes]);

  const sectionOptions = useMemo(
    () =>
      template.sections.map((section) => ({
        id: section.id,
        name: section.sectionName ?? section.id,
      })),
    [template.sections],
  );

  const handleMutationSuccess = async () => {
    if (memberId == null) {
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: weeklyReviewQueryKeys.longUnwornClothes(memberId),
      }),
      queryClient.invalidateQueries({
        queryKey: weeklyReviewQueryKeys.currentWeeklyReview(memberId),
      }),
      queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
    ]);
  };

  if (shouldRedirectToResult) {
    return <Redirect href={weeklyReviewRoutes.result} />;
  }

  if (isLoading && !data) {
    return (
      <WeeklyReviewRouteScaffold title="장기 미착용 옷" onBackPress={handleBackPress}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 font-pretendard text-body text-text-subdued">
            장기 미착용 옷을 불러오는 중입니다.
          </Text>
        </View>
      </WeeklyReviewRouteScaffold>
    );
  }

  return (
    <ClosetItemBrowserScreen
      title="장기 미착용 옷"
      backButtonAccessibilityLabel="주간 회고 결과로 돌아가기"
      onBackPress={handleBackPress}
      items={browserItems}
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      emptyTitle="장기 미착용 옷이 없어요."
      emptyDescription="이번 달 기준으로 오래 입지 않은 옷이 없어요."
      sectionOptions={sectionOptions}
      onLoadDetail={repository.getClothesDetail}
      onUpdateItem={repository.updateClothes}
      onDeleteItem={async (clothesId) => {
        await repository.deleteClothes(clothesId);
      }}
      onMutationSuccess={handleMutationSuccess}
    />
  );
}
