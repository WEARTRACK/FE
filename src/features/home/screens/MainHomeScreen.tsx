import { Href, Link, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import ClosetFrame from "../../../../assets/closet-frame.svg";
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import HangerIcon from "../../../../assets/hanger-icon.svg";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

type ClosetSummary = {
  totalClothes: number;
  closetCount: number;
  storageCount: number;
};

type WeeklyFashionStats = {
  totalSpending: number;
  closetUsageRate: number;
};

const closetSummary: ClosetSummary = {
  totalClothes: 48,
  closetCount: 1,
  storageCount: 5,
};

const weeklyFashionStats: WeeklyFashionStats = {
  totalSpending: 100000,
  closetUsageRate: 73,
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function SummaryCard({ summary }: { summary: ClosetSummary }) {
  return (
    <View className="h-[148px] flex-row justify-between rounded-xl border border-primary bg-white px-[21px] py-[27px]">
      <View className="justify-between">
        <Text className="font-pretendard text-[13px] leading-[20px] text-text-subdued">
          내 옷장은...
        </Text>
        <Text className="font-pretendard-semibold text-[20px] leading-[30px] text-text">
          총 {summary.totalClothes}벌
        </Text>
        <Text className="font-pretendard text-[12px] leading-[16px] text-text-subdued">
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
  const content = (
    <Pressable
      className="h-[122px] flex-1 items-center justify-center rounded-lg bg-bg-dark"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      {icon}
      <View className="mt-3 flex-row items-center">
        <Text className="font-pretendard-semibold text-[12px] leading-[20px] text-white">
          {emphasis}
        </Text>
        <Text className="font-pretendard text-[12px] leading-[20px] text-white"> 등록하기</Text>
      </View>
    </Pressable>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} asChild>
      {content}
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="h-[118px] flex-1 justify-center rounded-lg border-[0.5px] border-blue-3 bg-blue-1 px-[22px]">
      <Text className="font-pretendard text-[12px] leading-[20px] text-text-subdued">{label}</Text>
      <Text className="mt-2 font-pretendard-semibold text-[20px] leading-[30px] text-accent">
        {value}
      </Text>
    </View>
  );
}

function SearchCard({ emphasis, suffix }: { emphasis: string; suffix: string }) {
  return (
    <Pressable
      className="h-[76px] flex-1 flex-row items-center justify-center rounded-lg bg-cool"
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text className="font-pretendard-semibold text-[12px] leading-[20px] text-text">
        {emphasis}
      </Text>
      <Text className="font-pretendard text-[12px] leading-[20px] text-text-subdued">{suffix}</Text>
    </Pressable>
  );
}

function ClosetRegistrationGuideModal({
  visible,
  onClose,
  onPressCapture,
}: {
  visible: boolean;
  onClose: () => void;
  onPressCapture: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/25 px-6" onPress={onClose}>
        <Pressable
          className="items-center rounded-xl bg-white px-[38px] pb-[29px] pt-[27px]"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="font-pretendard-bold text-[20px] leading-[24px] text-text">
            옷장 등록하기
          </Text>

          <View className="mt-[20px] h-[257px] w-[180px] items-center justify-center overflow-hidden bg-cool">
            <ClosetFrame width={172} height={258} />
          </View>

          <Text className="mt-[18px] text-center font-pretendard text-[12px] leading-[20px] text-text">
            예시 이미지처럼 옷장 전체와{"\n"}보관 칸이 보이도록 촬영해주세요.
          </Text>

          <Pressable
            className="mt-[24px] h-[48px] w-full items-center justify-center rounded-lg bg-bg-dark"
            onPress={onPressCapture}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[16px] leading-[20px] text-white">
              촬영하기
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ClothesRegistrationGuideModal({
  visible,
  onClose,
  onPressCapture,
}: {
  visible: boolean;
  onClose: () => void;
  onPressCapture: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/25 px-6" onPress={onClose}>
        <Pressable
          className="items-center rounded-xl bg-white px-[38px] pb-[29px] pt-[30px]"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            옷 등록하기
          </Text>

          <View className="mt-[24px] h-[257px] w-[180px] items-center justify-center overflow-hidden bg-cool">
            <ClothesIcon width={124} height={124} />
          </View>

          <Text className="mt-[33px] text-center font-pretendard text-[12px] leading-[20px] text-bg-dark">
            예시 이미지처럼 옷 전체가 보이도록 촬영해주세요.
          </Text>

          <Pressable
            className="mt-[31px] h-[50px] w-full items-center justify-center rounded-lg bg-bg-dark"
            onPress={onPressCapture}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[16px] leading-[20px] text-white">
              촬영하기
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function MainHomeScreen() {
  const router = useRouter();
  const [isClosetGuideVisible, setIsClosetGuideVisible] = useState(false);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);

  const handlePressCapture = () => {
    setIsClosetGuideVisible(false);
    router.push(clothesRegistrationRoutes.preview);
  };

  const handlePressClothesCapture = () => {
    setIsClothesGuideVisible(false);
    router.push(clothesRegistrationRoutes.clothesPreview);
  };

  return (
    <>
      <View className="flex-1 bg-bg-light px-6 pb-8 pt-4">
        <SummaryCard summary={closetSummary} />

        <View className="mt-[34px] flex-row gap-[18px]">
          <QuickActionButton
            onPress={() => setIsClosetGuideVisible(true)}
            icon={<HangerIcon width={75} height={47} />}
            emphasis="옷장"
          />
          <QuickActionButton
            onPress={() => setIsClothesGuideVisible(true)}
            icon={<ClothesIcon width={60} height={55} />}
            emphasis="옷"
          />
        </View>

        <View className="mt-[27px]">
          <Text className="font-pretendard-bold text-[14px] leading-[24px] text-text">
            주간 패션 소비
          </Text>
          <View className="mt-[12px] flex-row gap-[18px]">
            <StatCard
              label="이번주 총 패션 지출액"
              value={formatWon(weeklyFashionStats.totalSpending)}
            />
            <StatCard label="이번주 옷장 활용률" value={`${weeklyFashionStats.closetUsageRate}%`} />
          </View>
        </View>

        <View className="mt-[27px]">
          <Text className="font-pretendard-bold text-[14px] leading-[24px] text-text">
            내 옷 찾기
          </Text>
          <View className="mt-[12px] flex-row gap-[18px]">
            <SearchCard emphasis="색상" suffix="으로 찾기" />
            <SearchCard emphasis="카테고리" suffix="로 찾기" />
          </View>
        </View>
      </View>

      <ClosetRegistrationGuideModal
        visible={isClosetGuideVisible}
        onClose={() => setIsClosetGuideVisible(false)}
        onPressCapture={handlePressCapture}
      />
      <ClothesRegistrationGuideModal
        visible={isClothesGuideVisible}
        onClose={() => setIsClothesGuideVisible(false)}
        onPressCapture={handlePressClothesCapture}
      />
    </>
  );
}
