import { useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/components/common/Button";
import { useWeeklyClosetUsageAnalysis } from "@/features/weekly-review/hooks/use-current-weekly-review";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import {
  clampClosetUsageRate,
  getClosetUsageProfileByTitle,
} from "@/features/weekly-review/utils/closet-usage";
import { isWeeklyReviewNotFoundError } from "@/features/weekly-review/utils/weekly-review-error";

import {
  WeeklyReviewUsageDonut,
  WeeklyReviewUsageProfileCard,
} from "./WeeklyReviewAnalysisComponents";
import { WeeklyReviewRouteScaffold } from "./WeeklyReviewRouteScaffold";

export function WeeklyReviewAnalysisScreen() {
  const router = useRouter();
  const weeklyClosetUsageAnalysisQuery = useWeeklyClosetUsageAnalysis();
  const analysis = weeklyClosetUsageAnalysisQuery.data;
  const usageRate = clampClosetUsageRate(analysis?.weeklyClosetUsageRate ?? 0);
  const usageProfile = getClosetUsageProfileByTitle(analysis?.closetUsageType, usageRate);
  const isWeeklyReviewNotFound = isWeeklyReviewNotFoundError(weeklyClosetUsageAnalysisQuery.error);

  const renderContent = () => {
    if (weeklyClosetUsageAnalysisQuery.isLoading) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 font-pretendard text-subhead text-text-subdued">
            옷장 분석을 불러오는 중입니다.
          </Text>
        </View>
      );
    }

    if (weeklyClosetUsageAnalysisQuery.isError && !isWeeklyReviewNotFound) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <Text className="font-pretendard text-heading text-text-subdued">
            옷장 분석을 불러오지 못했어요.
          </Text>
          <Button
            className="mt-4"
            label="다시 불러오기"
            onPress={() => void weeklyClosetUsageAnalysisQuery.refetch()}
            variant="secondary"
          />
        </View>
      );
    }

    if (!analysis) {
      return (
        <View className="min-h-[360px] items-center justify-center">
          <Text className="text-center font-pretendard text-heading text-text-subdued">
            이번 주 옷장 분석이 없어요.{"\n"}오늘 입은 옷을 먼저 기록해주세요.
          </Text>
          <Button
            className="mt-4"
            label="기록하러 가기"
            onPress={() => router.replace(weeklyReviewRoutes.selection)}
            variant="secondary"
          />
        </View>
      );
    }

    return (
      <View className="pt-[52px]">
        <WeeklyReviewUsageDonut profile={usageProfile} usageRate={usageRate} />

        <Text
          className="mt-6 font-pretendard-semibold text-headline text-bg-dark"
          style={{ lineHeight: 28 }}
        >
          활용도 분포
        </Text>

        <WeeklyReviewUsageProfileCard
          className="mt-[15px]"
          profile={usageProfile}
          unwornClothesCount={analysis.unwornClothesCount}
        />
      </View>
    );
  };

  return (
    <WeeklyReviewRouteScaffold title="옷장 분석">
      <View className="flex-1">{renderContent()}</View>
    </WeeklyReviewRouteScaffold>
  );
}
