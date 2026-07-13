import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuestCompleteIcon from "../../../../assets/quest-complete-icon.svg";
import { Button } from "@/components/common/Button";
import { useCurrentWeeklyReview } from "@/features/weekly-review/hooks/use-current-weekly-review";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import {
  formatWeeklyReviewDateRange,
  getWeeklyReviewWeekLabel,
} from "@/features/weekly-review/utils/weekly-review-date";
import { isWeeklyReviewNotFoundError } from "@/features/weekly-review/utils/weekly-review-error";
import { sortByWeeklyReviewCategory } from "@/features/weekly-review/utils/weekly-review-category";
import { clampClosetUsageRate } from "@/features/weekly-review/utils/closet-usage";
import { showToast } from "@/lib/ui/showToast";

import { WeeklyReviewWornCategorySection } from "./WeeklyReviewResultComponents";
import { WeeklyReviewRouteScaffold } from "./WeeklyReviewRouteScaffold";

export function WeeklyReviewResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const currentWeeklyReviewQuery = useCurrentWeeklyReview();
  const weeklyReview = currentWeeklyReviewQuery.data;
  const weekLabel = weeklyReview ? getWeeklyReviewWeekLabel(weeklyReview.weekStartDate).label : "";
  const dateRange = weeklyReview
    ? formatWeeklyReviewDateRange(weeklyReview.weekStartDate, weeklyReview.weekEndDate)
    : "";
  const sortedCategories = sortByWeeklyReviewCategory(weeklyReview?.categories ?? []);
  const contentWidth = windowWidth - 48;
  const hasWeeklyReview = Boolean(currentWeeklyReviewQuery.data);
  const usageRate = clampClosetUsageRate(weeklyReview?.weeklyClosetUsageRate ?? 0);
  const isWeeklyReviewNotFound = isWeeklyReviewNotFoundError(currentWeeklyReviewQuery.error);
  const longUnwornClothesCount = weeklyReview?.longUnwornClothesCount ?? 0;
  const hasLongUnwornClothes = longUnwornClothesCount > 0;
  const insightCardClassName = [
    "mt-[24px] rounded border-[0.5px]",
    hasLongUnwornClothes ? "border-red-4 bg-red-2" : "border-cool bg-white",
  ].join(" ");
  const insightCardPaddingClassName = hasLongUnwornClothes
    ? "px-[16px] py-[11px]"
    : "px-[32px] py-[18px]";

  const handlePressLongUnwornClothes = () => {
    if (!hasLongUnwornClothes) {
      return;
    }

    try {
      router.push(weeklyReviewRoutes.longUnwornClothes);
    } catch {
      showToast("장기 미착용 옷 화면으로 이동하지 못했어요.");
    }
  };

  const renderHeader = () => (
    <View className="pt-8">
      <View className="h-[85px] flex-row items-center rounded border border-blue-4 bg-blue-1 px-9">
        <View className="h-[52px] w-[48px] items-center justify-center overflow-hidden">
          <QuestCompleteIcon height={52} width={48} />
        </View>
        <View className="ml-9">
          <Text className="font-pretendard text-subhead text-text-subdued">{dateRange}</Text>
          <Text className="mt-1 font-pretendard text-heading text-text">이번 주 기록완료 !</Text>
        </View>
      </View>

      <Text className="mt-[32px] font-pretendard-semibold text-headline text-text">
        {weekLabel || "이번 주 요약"}
      </Text>

      <View className="mt-[24px] flex-row gap-[19px]">
        <View className="h-[85px] flex-1 items-center justify-center rounded border-[0.5px] border-cool bg-white">
          <Text className="font-pretendard-semibold text-headline text-text">
            {weeklyReview?.wornClothesCount ?? 0}벌
          </Text>
          <Text className="mt-[6px] font-pretendard text-subhead text-text-subdued">입은 옷</Text>
        </View>
        <View className="h-[85px] flex-1 items-center justify-center rounded border-[0.5px] border-cool bg-white">
          <Text className="font-pretendard-semibold text-headline text-text">{usageRate}%</Text>
          <Text className="mt-[6px] font-pretendard text-subhead text-text-subdued">
            옷장 활용률
          </Text>
        </View>
      </View>

      <Text className="mt-[24px] font-pretendard-semibold text-headline text-text">
        이번 주 인사이트
      </Text>

      <Pressable
        accessibilityLabel={
          hasLongUnwornClothes
            ? `이번 주 인사이트. 오랫동안 안 입은 옷이 ${longUnwornClothesCount}벌 있어요. 클릭해서 확인해 보세요.`
            : "이번 주 인사이트"
        }
        accessibilityRole={hasLongUnwornClothes ? "button" : "text"}
        className={insightCardClassName}
        disabled={!hasLongUnwornClothes}
        onPress={handlePressLongUnwornClothes}
        style={({ pressed }) => ({
          opacity: hasLongUnwornClothes && pressed ? 0.7 : 1,
        })}
      >
        <View className={insightCardPaddingClassName}>
          <Text className="font-pretendard text-heading text-text">이번 주 인사이트</Text>
          <Text
            className="mt-[8px] font-pretendard text-subhead text-text-subdued"
          >
            {weeklyReview?.weeklyInsight ?? ""}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  const renderEmptyState = () => {
    if (currentWeeklyReviewQuery.isLoading) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 font-pretendard text-subhead text-text-subdued">
            회고 결과를 불러오는 중입니다.
          </Text>
        </View>
      );
    }

    if (currentWeeklyReviewQuery.isError && !isWeeklyReviewNotFound) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <Text className="font-pretendard text-heading text-text-subdued">
            회고 결과를 불러오지 못했어요.
          </Text>
          <Button
            className="mt-4"
            label="다시 불러오기"
            onPress={() => void currentWeeklyReviewQuery.refetch()}
            variant="secondary"
          />
        </View>
      );
    }

    return (
      <View className="min-h-[360px] items-center justify-center">
        <Text className="text-center font-pretendard text-heading text-text-subdued">
          이번 주 회고 결과가 없어요.{"\n"}오늘 입은 옷을 먼저 기록해주세요.
        </Text>
        <Button
          className="mt-4"
          label="기록하러 가기"
          onPress={() => router.replace(weeklyReviewRoutes.selection)}
          variant="secondary"
        />
      </View>
    );
  };

  return (
    <WeeklyReviewRouteScaffold
      title="주간 회고 결과"
      onBackPress={() => router.replace(weeklyReviewRoutes.selection)}
    >
      <View className="flex-1">
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 150 }}
          data={hasWeeklyReview ? sortedCategories : []}
          keyExtractor={(category) => category.category}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={hasWeeklyReview ? renderHeader : null}
          renderItem={({ item }) => (
            <WeeklyReviewWornCategorySection category={item} contentWidth={contentWidth} />
          )}
        />

        <View
          className="absolute left-0 right-0"
          style={{ bottom: Math.max(insets.bottom, 20) + 6 }}
        >
          <Button
            className="h-[57px]"
            disabled={!hasWeeklyReview}
            fullWidth
            href={weeklyReviewRoutes.analysis}
            label="이번 주 옷장 리포트"
          />
        </View>
      </View>
    </WeeklyReviewRouteScaffold>
  );
}
