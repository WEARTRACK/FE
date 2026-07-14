import { Href, Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, Text, useWindowDimensions, View } from "react-native";

import ClotheExample from "../../../../assets/clotheExample.svg";
import CategoryIcon from "../../../../assets/category.svg";
import ClosetIcon from "../../../../assets/closet-icon.svg";
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import ColorIcon from "../../../../assets/color.svg";
import DotsIcon from "../../../../assets/dots.svg";
import HangerIcon from "../../../../assets/hanger-icon.svg";
import { colors } from "@/constants/colors";
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

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function SummaryCard({ summary }: { summary: ClosetSummary }) {
  return (
    <View className="h-[148px] flex-row justify-between rounded-xl border border-primary bg-white px-[21px] py-[27px]">
      <View className="justify-between">
        <Text className="font-pretendard text-[15px] leading-[20px] text-text-subdued">
          내 옷장은...
        </Text>
        <Text className="font-pretendard-semibold text-[20px] leading-[30px] text-text">
          총 {summary.totalClothes}벌
        </Text>
        <Text className="font-pretendard text-[14px] leading-[16px] text-text-subdued">
          {summary.closetCount} 옷장{"       "}
          {summary.storageCount} 보관 칸
        </Text>
      </View>

      <View className="justify-center">
        <ClosetIcon width={64} height={88} />
      </View>
    </View>
  );
}

function QuickActionButton({
  href,
  onPress,
  icon,
  emphasis,
}: {
  href?: Href;
  onPress?: () => void;
  icon: React.ReactNode;
  emphasis: string;
}) {
  const button = (
    <Pressable
      className="flex-1 items-center justify-center rounded-lg bg-bg-dark"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      {icon}
      <View className="mt-3 flex-row items-center">
        <Text className="font-pretendard-semibold text-[14px] leading-[20px] text-white">
          {emphasis}
        </Text>
        <Text className="font-pretendard text-[14px] leading-[20px] text-white"> 등록하기</Text>
      </View>
    </Pressable>
  );

  return (
    <View
      className="h-[122px] flex-1"
      style={{
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
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const Component = onPress ? Pressable : View;

  return (
    <Component
      accessibilityRole={onPress ? "button" : undefined}
      className="h-[118px] flex-1 justify-center rounded-lg border-[0.5px] border-blue-3 bg-blue-1 px-[22px]"
      onPress={onPress}
      style={onPress ? ({ pressed }) => ({ opacity: pressed ? 0.72 : 1 }) : undefined}
    >
      <Text className="font-pretendard text-[14px] leading-[20px] text-text-subdued">{label}</Text>
      <Text className="mt-2 font-pretendard-semibold text-[20px] leading-[30px] text-accent">
        {value}
      </Text>
    </Component>
  );
}

function SearchCard({
  emphasis,
  suffix,
  icon,
  onPress,
}: {
  emphasis: string;
  suffix: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <View
      className="h-[81px] flex-1"
      style={{
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
          <Text className="font-pretendard-semibold text-[14px] leading-[20px] text-text">
            {emphasis}
          </Text>
          <Text className="font-pretendard text-[14px] leading-[20px] text-text-subdued">
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
          <Text className="font-pretendard text-[12px] leading-[16px] text-blue-0">
            구매를 고민하는 옷이 있나요?
          </Text>
        ) : (
          <DotsIcon height={5} width={21} />
        )}
      </Pressable>
    </View>
  );
}

function ClothesRegistrationGuideModal({
  visible,
  onClose,
  onPressCapture,
  onPressSelectImage,
  onPressShoppingMallLink,
}: {
  visible: boolean;
  onClose: () => void;
  onPressCapture: () => void;
  onPressSelectImage: () => void;
  onPressShoppingMallLink: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center px-6">
        <Pressable
          className="absolute inset-0 bg-black/25"
          onPress={onClose}
          style={{ zIndex: 0 }}
        />
        <View
          className="items-center rounded-xl bg-white px-[38px] pb-[29px] pt-[30px]"
          style={{ position: "relative", elevation: 2, zIndex: 1 }}
        >
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            옷 등록하기
          </Text>

          <View className="mt-[24px] h-[240px] w-[180px] items-center justify-center overflow-hidden bg-cool">
            <ClotheExample width={180} height={257} />
          </View>

          <Text className="mt-[23px] text-center font-pretendard text-[14px] leading-[20px] text-bg-dark">
            예시 이미지처럼 옷 전체가 보이는{"\n"} 사진을 등록해주세요.
          </Text>

          <Pressable
            className="mt-[20px] h-[50px] w-full items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white"
            onPress={onPressCapture}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-text">
              촬영하기
            </Text>
          </Pressable>

          <Pressable
            className="mt-[8px] h-[50px] w-full items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white"
            onPress={onPressSelectImage}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-text">
              앨범에서 선택
            </Text>
          </Pressable>

          <Pressable
            className="mt-[8px] h-[50px] w-full items-center justify-center rounded-lg bg-bg-dark"
            onPress={onPressShoppingMallLink}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-white">
              쇼핑몰 링크
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function MainHomeScreen() {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { data: homeSummary, refetch: refetchHomeSummary } = useHomeSummary();
  const [isClosetGuideVisible, setIsClosetGuideVisible] = useState(false);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);
  const isCompactHeight = screenHeight < 870;

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
    router.push(clothesRegistrationRoutes.shoppingMallTerms);
  };

  const openClosetSearch = (mode: "color" | "category") => {
    router.push({
      pathname: "/home/search/select",
      params: { mode, entryKey: Date.now().toString() },
    });
  };

  return (
    <>
      <View className={`flex-1 bg-bg-light px-6 ${isCompactHeight ? "pb-6 pt-3" : "pb-8 pt-4"}`}>
        <SummaryCard summary={closetSummary} />

        <View className={`${isCompactHeight ? "mt-[26px]" : "mt-[34px]"} flex-row gap-[18px]`}>
          <QuickActionButton
            onPress={handlePressClosetRegistration}
            icon={<HangerIcon width={75} height={47} />}
            emphasis="옷장"
          />
          <QuickActionButton
            onPress={handlePressClothesRegistration}
            icon={<ClothesIcon width={60} height={55} />}
            emphasis="옷"
          />
        </View>

        <View className={isCompactHeight ? "mt-[20px]" : "mt-[27px]"}>
          <Text className="font-pretendard-bold text-[14px] leading-[24px] text-text">
            주간 패션 소비
          </Text>
          <View className={`${isCompactHeight ? "mt-[10px]" : "mt-[12px]"} flex-row gap-[18px]`}>
            <StatCard
              label="이번주 총 패션 지출액"
              value={formatWon(weeklyFashionStats.totalSpending)}
              onPress={() => router.push("/home/weekly-spending")}
            />
            <StatCard
              label="이번주 옷장 활용률"
              value={`${weeklyFashionStats.closetUsageRate}%`}
              onPress={() => router.push(weeklyReviewRoutes.analysis)}
            />
          </View>
        </View>

        <View className={isCompactHeight ? "mt-[20px]" : "mt-[27px]"}>
          <View className="h-[26px] flex-row items-center justify-between">
            <Text className="font-pretendard-bold text-[14px] leading-[24px] text-text">
              내 옷 찾기
            </Text>
            <PurchaseCheckBubble onPress={() => router.push("/home/pre-purchase-check")} />
          </View>
          <View className={`${isCompactHeight ? "mt-[10px]" : "mt-[12px]"} flex-row gap-[18px]`}>
            <SearchCard
              emphasis="색상"
              suffix="으로 찾기"
              icon={<ColorIcon height={25} width={87} />}
              onPress={() => openClosetSearch("color")}
            />
            <SearchCard
              emphasis="카테고리"
              suffix="로 찾기"
              icon={<CategoryIcon height={25} width={88} />}
              onPress={() => openClosetSearch("category")}
            />
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
