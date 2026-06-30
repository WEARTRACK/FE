import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Button } from "@/components/common/Button";
import type { DailyReviewCategoryApi } from "@/features/weekly-review/api/weekly-review-api-types";
import { useDailyReviewToday } from "@/features/weekly-review/hooks/use-daily-review-today";
import { useSaveDailyReviewToday } from "@/features/weekly-review/hooks/use-save-daily-review-today";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import { formatWeeklyReviewDateRange } from "@/features/weekly-review/utils/weekly-review-date";
import { sortByWeeklyReviewCategory } from "@/features/weekly-review/utils/weekly-review-category";
import { showToast } from "@/lib/ui/showToast";

import { WeeklyReviewCategorySection } from "./WeeklyReviewSelectionComponents";
import { WeeklyReviewRouteScaffold } from "./WeeklyReviewRouteScaffold";

function BottomActionFade() {
  return (
    <Svg className="absolute -top-16 left-0 right-0 h-16" pointerEvents="none">
      <Defs>
        <LinearGradient id="weekly-review-selection-fade" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#F7F9FC" stopOpacity="0" />
          <Stop offset="1" stopColor="#F7F9FC" stopOpacity="0.96" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#weekly-review-selection-fade)" height="100%" width="100%" x="0" y="0" />
    </Svg>
  );
}

export function WeeklyReviewSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const dailyReviewTodayQuery = useDailyReviewToday();
  const saveDailyReviewTodayMutation = useSaveDailyReviewToday();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hasShownNoClothesToast, setHasShownNoClothesToast] = useState(false);

  const contentWidth = windowWidth - 48;
  const sortedCategories = useMemo(
    () => sortByWeeklyReviewCategory(dailyReviewTodayQuery.data?.categories ?? []),
    [dailyReviewTodayQuery.data?.categories],
  );
  const totalClothesCount = sortedCategories.reduce(
    (count, category) => count + category.clothes.length,
    0,
  );
  const isNoRegisteredClothes =
    Boolean(dailyReviewTodayQuery.data?.noRegisteredClothes) || totalClothesCount === 0;
  const dateRange = dailyReviewTodayQuery.data
    ? formatWeeklyReviewDateRange(
        dailyReviewTodayQuery.data.weekStartDate,
        dailyReviewTodayQuery.data.weekEndDate,
      )
    : "";

  useEffect(() => {
    const initialSelectedIds =
      dailyReviewTodayQuery.data?.categories.flatMap((category) =>
        category.clothes.filter((clothes) => clothes.selected).map((clothes) => clothes.clothesId),
      ) ?? [];

    setSelectedIds(new Set(initialSelectedIds));
  }, [dailyReviewTodayQuery.data]);

  useEffect(() => {
    if (
      dailyReviewTodayQuery.data &&
      !dailyReviewTodayQuery.isLoading &&
      !dailyReviewTodayQuery.isError &&
      isNoRegisteredClothes &&
      !hasShownNoClothesToast
    ) {
      showToast("등록된 옷이 없습니다. 먼저 옷을 등록해주세요");
      setHasShownNoClothesToast(true);
    }
  }, [
    dailyReviewTodayQuery.data,
    dailyReviewTodayQuery.isError,
    dailyReviewTodayQuery.isLoading,
    hasShownNoClothesToast,
    isNoRegisteredClothes,
  ]);

  const handleToggleClothes = useCallback((clothesId: number) => {
    setSelectedIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      if (nextSelectedIds.has(clothesId)) {
        nextSelectedIds.delete(clothesId);
      } else {
        nextSelectedIds.add(clothesId);
      }

      return nextSelectedIds;
    });
  }, []);

  const handleSave = () => {
    if (isNoRegisteredClothes) {
      showToast("등록된 옷이 없습니다. 먼저 옷을 등록해주세요");
      return;
    }

    if (selectedIds.size === 0) {
      showToast("이번 주 착용한 옷이 없으신가요?");
    }

    saveDailyReviewTodayMutation.mutate([...selectedIds], {
      onSuccess: () => {
        router.replace(weeklyReviewRoutes.result);
      },
    });
  };

  const renderHeader = () => (
    <View>
      <Text className="font-pretendard text-heading text-text-subdued">{dateRange}</Text>
      <Text className="mt-[13px] font-pretendard-semibold text-headline text-text">
        오늘 입은 옷을 선택하세요.
      </Text>
      <Text className="mt-[12px] font-pretendard text-heading text-text-subdued">
        여러 벌을 선택할 수 있어요.
      </Text>
    </View>
  );

  const renderEmptyState = () => {
    if (dailyReviewTodayQuery.isLoading) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 font-pretendard text-subhead text-text-subdued">
            옷 목록을 불러오는 중입니다.
          </Text>
        </View>
      );
    }

    if (dailyReviewTodayQuery.isError) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <Text className="font-pretendard text-heading text-text-subdued">
            옷 목록을 불러오지 못했어요.
          </Text>
          <Button
            className="mt-4"
            label="다시 불러오기"
            onPress={() => void dailyReviewTodayQuery.refetch()}
            variant="secondary"
          />
        </View>
      );
    }

    if (isNoRegisteredClothes) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <Text className="text-center font-pretendard text-heading text-text-subdued">
            등록된 옷이 없습니다.{"\n"}먼저 옷을 등록해주세요.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderCategory = ({ item }: { item: DailyReviewCategoryApi }) => (
    <WeeklyReviewCategorySection
      category={item}
      contentWidth={contentWidth}
      onToggle={handleToggleClothes}
      selectedIds={selectedIds}
    />
  );

  return (
    <WeeklyReviewRouteScaffold title="주간 회고">
      <View className="flex-1">
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 24 }}
          data={
            dailyReviewTodayQuery.isLoading ||
            dailyReviewTodayQuery.isError ||
            isNoRegisteredClothes
              ? []
              : sortedCategories
          }
          keyExtractor={(category) => category.category}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderHeader}
          renderItem={renderCategory}
        />

        <View
          className="absolute bottom-0 left-0 right-0 bg-bg-light/95 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 20) + 6 }}
        >
          <BottomActionFade />
          <Button
            disabled={
              dailyReviewTodayQuery.isLoading ||
              dailyReviewTodayQuery.isError ||
              saveDailyReviewTodayMutation.isPending ||
              isNoRegisteredClothes
            }
            fullWidth
            label={saveDailyReviewTodayMutation.isPending ? "저장 중" : "저장하기"}
            onPress={handleSave}
          />
        </View>
      </View>
    </WeeklyReviewRouteScaffold>
  );
}
