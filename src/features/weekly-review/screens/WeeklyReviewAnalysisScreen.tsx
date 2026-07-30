import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { useWeeklyClosetUsageAnalysis } from "@/features/weekly-review/hooks/use-current-weekly-review";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import {
  clampClosetUsageRate,
  getClosetUsageProfileByTitle,
} from "@/features/weekly-review/utils/closet-usage";
import { isWeeklyReviewNotFoundError } from "@/features/weekly-review/utils/weekly-review-error";

import {
  WeeklyReviewUsageDistributionSection,
  WeeklyReviewUsageDonut,
  WeeklyReviewUsageGuideTooltip,
} from "./WeeklyReviewAnalysisComponents";
import { WeeklyReviewRouteScaffold } from "./WeeklyReviewRouteScaffold";

const TOOLTIP_BOX_HEIGHT = 101;
const TOOLTIP_SIDE_PADDING = 24;
const TOOLTIP_POINTER_WIDTH = 22;
const TOOLTIP_POINTER_HALF_WIDTH = TOOLTIP_POINTER_WIDTH / 2;

export function WeeklyReviewAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [isUsageGuideVisible, setIsUsageGuideVisible] = useState(false);
  const [guideTooltipTop, setGuideTooltipTop] = useState<number | null>(null);
  const [guideTooltipPointerLeft, setGuideTooltipPointerLeft] = useState<number | null>(null);
  const guideButtonRef = useRef<View>(null);
  const weeklyClosetUsageAnalysisQuery = useWeeklyClosetUsageAnalysis();
  const analysis = weeklyClosetUsageAnalysisQuery.data;
  const usageRate = clampClosetUsageRate(analysis?.weeklyClosetUsageRate ?? 0);
  const usageProfile = getClosetUsageProfileByTitle(analysis?.closetUsageType, usageRate);
  const isWeeklyReviewNotFound = isWeeklyReviewNotFoundError(weeklyClosetUsageAnalysisQuery.error);

  const closeUsageGuide = () => {
    setIsUsageGuideVisible(false);
    setGuideTooltipTop(null);
    setGuideTooltipPointerLeft(null);
  };

  const openUsageGuide = () => {
    guideButtonRef.current?.measureInWindow((x, y, width) => {
      const tooltipWidth = Math.max(screenWidth - TOOLTIP_SIDE_PADDING * 2, 0);
      const pointerLeft = Math.min(
        Math.max(x + width / 2 - TOOLTIP_SIDE_PADDING - TOOLTIP_POINTER_HALF_WIDTH, 0),
        Math.max(tooltipWidth - TOOLTIP_POINTER_WIDTH, 0),
      );

      setGuideTooltipTop(Math.max(y - TOOLTIP_BOX_HEIGHT, insets.top + 16));
      setGuideTooltipPointerLeft(pointerLeft);
      setIsUsageGuideVisible(true);
    });
  };

  const handleGuidePress = () => {
    if (isUsageGuideVisible) {
      closeUsageGuide();
      return;
    }

    openUsageGuide();
  };

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
      <View className="relative flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 20) + 24,
            paddingTop: 52,
          }}
          scrollEnabled={!isUsageGuideVisible}
          showsVerticalScrollIndicator={false}
        >
          <WeeklyReviewUsageDonut profile={usageProfile} usageRate={usageRate} />

          <WeeklyReviewUsageDistributionSection
            infoButtonRef={guideButtonRef}
            isGuideVisible={isUsageGuideVisible}
            onGuidePress={handleGuidePress}
            profile={usageProfile}
            unwornClothesCount={analysis.unwornClothesCount}
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <WeeklyReviewRouteScaffold title="옷장 분석">
      <View className="flex-1">{renderContent()}</View>

      <Modal
        animationType="none"
        onRequestClose={closeUsageGuide}
        statusBarTranslucent
        transparent
        visible={isUsageGuideVisible}
      >
        <View className="flex-1">
          <Pressable
            accessibilityLabel="활용도 분포 안내 닫기"
            className="absolute inset-0"
            onPress={closeUsageGuide}
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          />

          {guideTooltipTop !== null && guideTooltipPointerLeft !== null ? (
            <WeeklyReviewUsageGuideTooltip
              pointerLeft={guideTooltipPointerLeft}
              top={guideTooltipTop}
            />
          ) : null}
        </View>
      </Modal>
    </WeeklyReviewRouteScaffold>
  );
}
