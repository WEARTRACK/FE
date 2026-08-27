import { Href, Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, LayoutChangeEvent, Pressable, Text, useWindowDimensions, View } from "react-native";

import CategoryIcon from "../../../../assets/category.svg";
import ClosetIcon from "../../../../assets/closet-icon.svg";
import ClothesIconImage from "../../../../assets/clothes-icon.png";
import ColorIcon from "../../../../assets/color.svg";
import DotsIcon from "../../../../assets/dots.svg";
import HangerIconImage from "../../../../assets/hanger-icon.png";
import { colors } from "@/constants/colors";
import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { ClosetRegistrationGuideModal } from "@/features/clothes-registration/components/ClosetRegistrationGuideModal";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { showAlert } from "@/lib/ui/showAlert";
import { showToast } from "@/lib/ui/showToast";
import { useHomeSummary } from "@/features/home/hooks/useHomeSummary";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";

type ClosetSummary = {
  totalClothes: number;
  closetCount: number;
  storageCount: number;
};

type WeeklyFashionStats = {
  totalSpending: number;
  closetUsageRate: number;
};

const defaultClosetSummary: ClosetSummary = {
  totalClothes: 0,
  closetCount: 0,
  storageCount: 0,
};

const defaultWeeklyFashionStats: WeeklyFashionStats = {
  totalSpending: 0,
  closetUsageRate: 0,
};

const maxClosetCount = 3;
const fixedTextScaleProps = {
  allowFontScaling: false,
} as const;

type HomeLayoutMetrics = {
  rootPaddingBottom: number;
  rootPaddingTop: number;
  rowGap: number;
  sectionContentGap: number;
  summaryHeight: number;
  summaryPaddingHorizontal: number;
  summaryPaddingVertical: number;
  closetIconWidth: number;
  closetIconHeight: number;
  quickActionHeight: number;
  quickLabelMarginTop: number;
  hangerIconWidth: number;
  hangerIconHeight: number;
  clothesIconWidth: number;
  clothesIconHeight: number;
  statCardHeight: number;
  statCardPaddingHorizontal: number;
  searchCardHeight: number;
};

function getHomeLayoutMetrics(contentAreaHeight: number): HomeLayoutMetrics {
  if (contentAreaHeight < 540) {
    return {
      rootPaddingBottom: 6,
      rootPaddingTop: 6,
      rowGap: 12,
      sectionContentGap: 4,
      summaryHeight: 112,
      summaryPaddingHorizontal: 18,
      summaryPaddingVertical: 17,
      closetIconWidth: 52,
      closetIconHeight: 72,
      quickActionHeight: 88,
      quickLabelMarginTop: 7,
      hangerIconWidth: 60,
      hangerIconHeight: 38,
      clothesIconWidth: 48,
      clothesIconHeight: 44,
      statCardHeight: 82,
      statCardPaddingHorizontal: 14,
      searchCardHeight: 68,
    };
  }

  if (contentAreaHeight < 620) {
    return {
      rootPaddingBottom: 10,
      rootPaddingTop: 8,
      rowGap: 14,
      sectionContentGap: 6,
      summaryHeight: 124,
      summaryPaddingHorizontal: 18,
      summaryPaddingVertical: 20,
      closetIconWidth: 56,
      closetIconHeight: 77,
      quickActionHeight: 100,
      quickLabelMarginTop: 9,
      hangerIconWidth: 66,
      hangerIconHeight: 41,
      clothesIconWidth: 53,
      clothesIconHeight: 49,
      statCardHeight: 94,
      statCardPaddingHorizontal: 16,
      searchCardHeight: 72,
    };
  }

  if (contentAreaHeight < 690) {
    return {
      rootPaddingBottom: 18,
      rootPaddingTop: 12,
      rowGap: 18,
      sectionContentGap: 10,
      summaryHeight: 140,
      summaryPaddingHorizontal: 21,
      summaryPaddingVertical: 24,
      closetIconWidth: 60,
      closetIconHeight: 83,
      quickActionHeight: 112,
      quickLabelMarginTop: 10,
      hangerIconWidth: 70,
      hangerIconHeight: 44,
      clothesIconWidth: 57,
      clothesIconHeight: 52,
      statCardHeight: 108,
      statCardPaddingHorizontal: 20,
      searchCardHeight: 76,
    };
  }

  return {
    rootPaddingBottom: 24,
    rootPaddingTop: 16,
    rowGap: 18,
    sectionContentGap: 12,
    summaryHeight: 148,
    summaryPaddingHorizontal: 21,
    summaryPaddingVertical: 27,
    closetIconWidth: 64,
    closetIconHeight: 88,
    quickActionHeight: 122,
    quickLabelMarginTop: 12,
    hangerIconWidth: 75,
    hangerIconHeight: 47,
    clothesIconWidth: 60,
    clothesIconHeight: 55,
    statCardHeight: 118,
    statCardPaddingHorizontal: 22,
    searchCardHeight: 81,
  };
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function SummaryCard({ layout, summary }: { layout: HomeLayoutMetrics; summary: ClosetSummary }) {
  return (
    <View
      className="flex-row justify-between rounded-xl border border-primary bg-white"
      style={{
        height: layout.summaryHeight,
        paddingHorizontal: layout.summaryPaddingHorizontal,
        paddingVertical: layout.summaryPaddingVertical,
      }}
    >
      <View className="justify-between">
        <Text
          {...fixedTextScaleProps}
          className="font-pretendard text-[15px] leading-[20px] text-text-subdued"
          numberOfLines={1}
        >
          내 옷장은...
        </Text>
        <Text
          {...fixedTextScaleProps}
          className="font-pretendard-semibold text-[20px] leading-[30px] text-text"
          numberOfLines={1}
        >
          총 {summary.totalClothes}벌
        </Text>
        <Text
          {...fixedTextScaleProps}
          adjustsFontSizeToFit
          className="font-pretendard text-[14px] leading-[16px] text-text-subdued"
          minimumFontScale={0.8}
          numberOfLines={1}
        >
          {summary.closetCount} 옷장{"       "}
          {summary.storageCount} 보관 칸
        </Text>
      </View>

      <View className="justify-center">
        <ClosetIcon width={layout.closetIconWidth} height={layout.closetIconHeight} />
      </View>
    </View>
  );
}

function QuickActionButton({
  href,
  onPress,
  icon,
  layout,
  emphasis,
}: {
  href?: Href;
  onPress?: () => void;
  icon: React.ReactNode;
  layout: HomeLayoutMetrics;
  emphasis: string;
}) {
  const button = (
    <Pressable
      className="flex-1 items-center justify-center rounded-lg bg-bg-dark"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      {icon}
      <View className="flex-row items-center" style={{ marginTop: layout.quickLabelMarginTop }}>
        <Text
          {...fixedTextScaleProps}
          className="font-pretendard-semibold text-[14px] leading-[20px] text-white"
          numberOfLines={1}
        >
          {emphasis}
        </Text>
        <Text
          {...fixedTextScaleProps}
          className="font-pretendard text-[14px] leading-[20px] text-white"
          numberOfLines={1}
        >
          {" "}
          등록하기
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View
      className="flex-1"
      style={{
        height: layout.quickActionHeight,
        elevation: 6,
        shadowColor: colors.blue[3],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
      }}
    >
      {href ? (
        <Link href={href} asChild>
          {button}
        </Link>
      ) : (
        button
      )}
    </View>
  );
}

function StatCard({
  label,
  layout,
  value,
  onPress,
}: {
  label: string;
  layout: HomeLayoutMetrics;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <View
      className="justify-center"
      style={{
        height: layout.statCardHeight,
        paddingHorizontal: layout.statCardPaddingHorizontal,
      }}
    >
      <Text
        {...fixedTextScaleProps}
        adjustsFontSizeToFit
        className="font-pretendard text-[14px] leading-[20px] text-text-subdued"
        minimumFontScale={0.7}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        {...fixedTextScaleProps}
        adjustsFontSizeToFit
        className="mt-2 font-pretendard-semibold text-[20px] leading-[30px] text-accent"
        minimumFontScale={0.85}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        className="flex-1 rounded-lg border-[0.5px] border-blue-3 bg-blue-1"
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="flex-1 rounded-lg border-[0.5px] border-blue-3 bg-blue-1">{content}</View>
  );
}

function SearchCard({
  emphasis,
  suffix,
  icon,
  layout,
  onPress,
}: {
  emphasis: string;
  suffix: string;
  icon: React.ReactNode;
  layout: HomeLayoutMetrics;
  onPress: () => void;
}) {
  return (
    <View
      className="flex-1"
      style={{
        height: layout.searchCardHeight,
        elevation: 6,
        shadowColor: colors.blue[3],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }}
    >
      <Pressable
        className="flex-1 items-center justify-center rounded-lg border-[0.5px] border-blue-3 bg-white"
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        {icon}
        <View className="mt-[8px] flex-row items-center">
          <Text
            {...fixedTextScaleProps}
            className="font-pretendard-semibold text-[14px] leading-[20px] text-text"
            numberOfLines={1}
          >
            {emphasis}
          </Text>
          <Text
            {...fixedTextScaleProps}
            className="font-pretendard text-[14px] leading-[20px] text-text-subdued"
            numberOfLines={1}
          >
            {suffix}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function PurchaseCheckBubble({ onPress }: { onPress: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    onPress();
  };

  return (
    <View
      className="h-[26px]"
      style={{
        elevation: 4,
        shadowColor: colors.blue[3],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        width: isExpanded ? 173 : 49,
      }}
    >
      <Pressable
        accessibilityLabel="구매 전 확인하기로 이동"
        accessibilityRole="button"
        className="h-full items-center justify-center rounded-[8px] rounded-br-none bg-text px-[14px]"
        onPress={handlePress}
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        {isExpanded ? (
          <Text
            {...fixedTextScaleProps}
            className="font-pretendard text-[12px] leading-[16px] text-blue-0"
            numberOfLines={1}
          >
            구매를 고민하는 옷이 있나요?
          </Text>
        ) : (
          <DotsIcon height={5} width={21} />
        )}
      </Pressable>
    </View>
  );
}

export function MainHomeScreen() {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { data: homeSummary, refetch: refetchHomeSummary } = useHomeSummary();
  const [isClosetGuideVisible, setIsClosetGuideVisible] = useState(false);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);
  const [contentAreaHeight, setContentAreaHeight] = useState(screenHeight);
  const layout = getHomeLayoutMetrics(contentAreaHeight);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredHeight = Math.round(event.nativeEvent.layout.height);

    setContentAreaHeight((currentHeight) =>
      Math.abs(currentHeight - measuredHeight) < 1 ? currentHeight : measuredHeight,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetchHomeSummary();
    }, [refetchHomeSummary]),
  );

  const closetSummary: ClosetSummary = {
    totalClothes: homeSummary?.totalClothesCount ?? defaultClosetSummary.totalClothes,
    closetCount: homeSummary?.closetCount ?? defaultClosetSummary.closetCount,
    storageCount: homeSummary?.storageCount ?? defaultClosetSummary.storageCount,
  };

  const weeklyFashionStats: WeeklyFashionStats = {
    totalSpending: homeSummary?.weeklyExpenseAmount ?? defaultWeeklyFashionStats.totalSpending,
    closetUsageRate:
      homeSummary?.weeklyClosetUsageRate ?? defaultWeeklyFashionStats.closetUsageRate,
  };

  const handlePressClosetRegistration = () => {
    if (!homeSummary) {
      showToast("옷장 정보를 불러오는 중입니다.");
      return;
    }

    if (homeSummary.closetCount >= maxClosetCount) {
      showAlert({
        title: "옷장은 최대 3개까지 등록할 수 있습니다.",
        confirmText: "확인",
        dismissible: false,
      });
      return;
    }

    setIsClosetGuideVisible(true);
  };

  const handlePressClothesRegistration = () => {
    if (!homeSummary) {
      showToast("옷장 정보를 불러오는 중입니다.");
      return;
    }

    if (homeSummary.closetCount === 0) {
      showAlert({
        title: "옷장 등록이 필요해요",
        message: "옷을 등록하려면 먼저\n옷장을 등록해주세요.",
        confirmText: "옷장 등록하기",
        cancelText: "취소",
        dismissible: false,
        onConfirm: () => setIsClosetGuideVisible(true),
      });
      return;
    }

    setIsClothesGuideVisible(true);
  };

  const handlePressCapture = () => {
    void (async () => {
      setIsClosetGuideVisible(false);

      try {
        const imageUri = await launchClothesCamera();

        if (!imageUri) {
          showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
          return;
        }

        router.push({
          pathname: "/closet/register/preview",
          params: { imageUri },
        });
      } catch {
        showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
      }
    })();
  };

  const handlePressClosetImageSelect = async () => {
    setIsClosetGuideVisible(false);

    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/closet/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressClothesCapture = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressClothesImageSelect = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressShoppingMallLink = () => {
    setIsClothesGuideVisible(false);
    router.push(clothesRegistrationRoutes.shoppingMallLink);
  };

  const openClosetSearch = (mode: "color" | "category") => {
    router.push({
      pathname: "/home/search/select",
      params: { mode, entryKey: Date.now().toString() },
    });
  };

  return (
    <>
      <View
        className="flex-1 bg-bg-light px-6"
        onLayout={handleContentLayout}
        style={{ paddingBottom: layout.rootPaddingBottom, paddingTop: layout.rootPaddingTop }}
      >
        <View className="flex-1 justify-between">
          <SummaryCard layout={layout} summary={closetSummary} />

          <View className="flex-row" style={{ gap: layout.rowGap }}>
            <QuickActionButton
              onPress={handlePressClosetRegistration}
              icon={
                <Image
                  resizeMode="contain"
                  source={HangerIconImage}
                  style={{ height: layout.hangerIconHeight, width: layout.hangerIconWidth }}
                />
              }
              layout={layout}
              emphasis="옷장"
            />
            <QuickActionButton
              onPress={handlePressClothesRegistration}
              icon={
                <Image
                  resizeMode="contain"
                  source={ClothesIconImage}
                  style={{ height: layout.clothesIconHeight, width: layout.clothesIconWidth }}
                />
              }
              layout={layout}
              emphasis="옷"
            />
          </View>

          <View>
            <Text
              {...fixedTextScaleProps}
              className="font-pretendard-bold text-[14px] leading-[24px] text-text"
            >
              주간 패션 소비
            </Text>
            <View
              className="flex-row"
              style={{ gap: layout.rowGap, marginTop: layout.sectionContentGap }}
            >
              <StatCard
                label="이번주 총 패션 지출액"
                layout={layout}
                value={formatWon(weeklyFashionStats.totalSpending)}
                onPress={() => router.push("/home/weekly-spending")}
              />
              <StatCard
                label="이번주 옷장 활용률"
                layout={layout}
                value={`${weeklyFashionStats.closetUsageRate}%`}
                onPress={() => router.push(weeklyReviewRoutes.analysis)}
              />
            </View>
          </View>

          <View>
            <View className="h-[26px] flex-row items-center justify-between">
              <Text
                {...fixedTextScaleProps}
                className="font-pretendard-bold text-[14px] leading-[24px] text-text"
              >
                내 옷 찾기
              </Text>
              <PurchaseCheckBubble onPress={() => router.push("/home/pre-purchase-check")} />
            </View>
            <View
              className="flex-row"
              style={{ gap: layout.rowGap, marginTop: layout.sectionContentGap }}
            >
              <SearchCard
                emphasis="색상"
                suffix="으로 찾기"
                icon={<ColorIcon height={25} width={87} />}
                layout={layout}
                onPress={() => openClosetSearch("color")}
              />
              <SearchCard
                emphasis="카테고리"
                suffix="로 찾기"
                icon={<CategoryIcon height={25} width={88} />}
                layout={layout}
                onPress={() => openClosetSearch("category")}
              />
            </View>
          </View>
        </View>
      </View>

      <ClosetRegistrationGuideModal
        visible={isClosetGuideVisible}
        onClose={() => setIsClosetGuideVisible(false)}
        onPressCapture={handlePressCapture}
        onPressSelectImage={handlePressClosetImageSelect}
      />
      <ClothesRegistrationGuideModal
        visible={isClothesGuideVisible}
        onClose={() => setIsClothesGuideVisible(false)}
        onPressCapture={handlePressClothesCapture}
        onPressSelectImage={handlePressClothesImageSelect}
        onPressShoppingMallLink={handlePressShoppingMallLink}
      />
    </>
  );
}
