import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";

import ReceiptLogo from "../../../../assets/WEARTRACK-logo.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { useCurrentWeeklyReview } from "@/features/weekly-review/hooks/use-current-weekly-review";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import {
  clampClosetUsageRate,
  getClosetUsageProfile,
} from "@/features/weekly-review/utils/closet-usage";
import { isWeeklyReviewNotFoundError } from "@/features/weekly-review/utils/weekly-review-error";
import {
  createWeeklyReceiptReport,
  formatReceiptPrice,
  weeklyReceiptThemeByToken,
} from "@/features/weekly-review/utils/weekly-review-receipt";

import {
  WeeklyReceiptBarcode,
  WeeklyReceiptCarousel,
  WeeklyReceiptDivider,
  WeeklyReceiptProfileTitle,
  WeeklyReceiptTotal,
  WeeklyReceiptUsageRate,
  WeeklyReceiptWornTitle,
} from "./WeeklyReviewReceiptComponents";

export function WeeklyReviewReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const currentWeeklyReviewQuery = useCurrentWeeklyReview();
  const weeklyReview = currentWeeklyReviewQuery.data;
  const usageRate = clampClosetUsageRate(weeklyReview?.weeklyClosetUsageRate ?? 0);
  const usageProfile = getClosetUsageProfile(usageRate);
  const receiptReport = createWeeklyReceiptReport({
    profile: usageProfile,
    usageRate,
    weeklyReview,
  });
  const receiptTheme = weeklyReceiptThemeByToken[usageProfile.colorToken];
  const isWeeklyReviewNotFound = isWeeklyReviewNotFoundError(currentWeeklyReviewQuery.error);

  const handlePressBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(weeklyReviewRoutes.analysis);
  };

  const renderContent = () => {
    if (currentWeeklyReviewQuery.isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.white} />
          <Text className="mt-3 font-pretendard text-subhead text-white">
            영수증 리포트를 불러오는 중입니다.
          </Text>
        </View>
      );
    }

    if (currentWeeklyReviewQuery.isError && !isWeeklyReviewNotFound) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-pretendard text-heading text-white">
            영수증 리포트를 불러오지 못했어요.
          </Text>
          <Button
            className="mt-4 border-white bg-bg-dark"
            label="다시 불러오기"
            onPress={() => void currentWeeklyReviewQuery.refetch()}
            textClassName="font-pretendard-semibold text-button-md text-white"
            variant="secondary"
          />
        </View>
      );
    }

    if (!weeklyReview) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-pretendard text-heading text-white">
            이번 주 영수증 리포트가 없어요.{"\n"}오늘 입은 옷을 먼저 기록해주세요.
          </Text>
          <Button
            className="mt-4 border-white bg-bg-dark"
            label="기록하러 가기"
            onPress={() => router.replace(weeklyReviewRoutes.selection)}
            textClassName="font-pretendard-semibold text-button-md text-white"
            variant="secondary"
          />
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 20),
        }}
      >
        <View className="items-center">
          <ReceiptLogo height={21} width={163} />
          <Text
            className="mt-1 font-pretendard"
            style={{
              color: receiptTheme.soft,
              fontSize: 16,
              letterSpacing: -0.6,
              lineHeight: 24,
            }}
          >
            RECEIPT
          </Text>
        </View>

        <WeeklyReceiptDivider className="mt-[22px]" color={colors.white} />

        <View className="mt-[20px] flex-row items-center justify-between px-6">
          <WeeklyReceiptProfileTitle text={usageProfile.title} theme={receiptTheme} />
          <WeeklyReceiptUsageRate text={`${receiptReport.usageRate}%`} theme={receiptTheme} />
        </View>

        <View className="px-6">
          <WeeklyReceiptDivider className="mt-[20px]" color={colors.white} />
          <View className="mt-[16px] items-center">
            <WeeklyReceiptWornTitle theme={receiptTheme} />
          </View>
        </View>

        {receiptReport.wornItems.length > 0 ? (
          <View className="mt-[19px]">
            <WeeklyReceiptCarousel
              items={receiptReport.wornItems}
              screenWidth={screenWidth}
              theme={receiptTheme}
            />
          </View>
        ) : (
          <View className="mt-[19px] h-[296px] items-center justify-center px-6">
            <Text
              className="text-center font-pretendard text-heading"
              style={{ color: receiptTheme.soft }}
            >
              이번주 입은 옷이 없어요.
            </Text>
          </View>
        )}

        <View className="mt-[31px]">
          <WeeklyReceiptBarcode color={receiptTheme.barcode} />
        </View>

        <View className="px-6">
          <WeeklyReceiptDivider className="mt-9" color={colors.white} />
        </View>

        <View
          className="items-center"
          style={{
            marginTop: 24,
          }}
        >
          <WeeklyReceiptTotal
            color={receiptTheme.accent}
            itemCount={receiptReport.wornItems.length}
            priceLabel={formatReceiptPrice(receiptReport.totalPrice)}
            softColor={receiptTheme.soft}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-bg-dark">
      <StatusBar style="light" />

      <View className="px-6" style={{ paddingTop: insets.top + 24 }}>
        <Pressable
          accessibilityLabel="이전 화면으로 돌아가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={handlePressBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
        >
          <Svg fill="none" height={24} viewBox="0 0 24 24" width={24}>
            <Path
              d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
              fill={colors.white}
            />
          </Svg>
        </Pressable>
      </View>

      {renderContent()}
    </View>
  );
}
