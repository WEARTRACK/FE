import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";

import WeartrackLogo from "../../../../assets/WEARTRACK-logo.svg";
import { BackButton } from "@/components/common/BackButton";

type CategorySpending = {
  label: string;
  amount: number;
};

const TOTAL_SPENDING = 89_000;

const categorySpending: CategorySpending[] = [
  { label: "T-Shirt", amount: TOTAL_SPENDING },
  { label: "Shirt", amount: 0 },
  { label: "Hoodie", amount: 0 },
  { label: "Vest", amount: 0 },
  { label: "Cardigan", amount: 0 },
  { label: "Pants", amount: 0 },
  { label: "Shorts", amount: 0 },
  { label: "Skirt", amount: 0 },
  { label: "Dress", amount: 0 },
  { label: "Jacket", amount: 0 },
  { label: "Coat", amount: 0 },
  { label: "Padding", amount: 0 },
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function DottedDivider() {
  return (
    <Svg width="100%" height={2}>
      <Line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="#FFFFFF"
        strokeDasharray="1 3"
        strokeLinecap="round"
        strokeOpacity={0.8}
        strokeWidth={1}
      />
    </Svg>
  );
}

function ReceiptCard() {
  return (
    <View className="mx-6 rounded-[4px] bg-bg-dark px-[36px] pb-[19px] pt-[34px]">
      <View className="items-center">
        <WeartrackLogo width={138} height={18} />
      </View>
      <Text className="mt-[17px] text-center font-pretendard text-[14px] leading-[14px] text-blue-1">
        RECEIPT
      </Text>

      <View className="mt-[17px]">
        <DottedDivider />
      </View>

      <View className="flex-row items-center justify-between py-[16px]">
        <Text className="font-pretendard text-[15px] leading-[16px] text-white">이번 주 지출</Text>
        <Text className="text-green-3 font-pretendard text-[14px] leading-[16px]">
          1주 전 대비 -23%
        </Text>
      </View>

      <DottedDivider />

      <Text className="mt-[14px] text-center font-pretendard text-[14px] leading-[14px] text-primary">
        Total price
      </Text>
      <Text className="mt-[8px] text-center font-pretendard-semibold text-[24px] leading-[28px] text-primary">
        {formatWon(TOTAL_SPENDING)}
      </Text>
    </View>
  );
}

function CategorySpendingRow({ item }: { item: CategorySpending }) {
  const progress = item.amount / TOTAL_SPENDING;

  return (
    <View className="mx-6 mb-2 rounded-[4px] border-[0.5px] border-cool bg-white px-6 pb-[12px] pt-[12px]">
      <View className="flex-row items-center justify-between">
        <Text className="font-pretendard text-[14px] leading-[17px] text-text">{item.label}</Text>
        <Text className="font-pretendard text-[14px] leading-[17px] text-text">
          {formatWon(item.amount)}
        </Text>
      </View>

      <View className="mt-[8px] h-[7px] overflow-hidden rounded-full bg-blue-1">
        <View
          className="h-full rounded-full bg-blue-4"
          style={{ width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }}
        />
      </View>
    </View>
  );
}

export function WeeklySpendingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top }}>
      <View className="h-[72px] flex-row items-center px-6">
        <View className="w-8 items-start">
          <BackButton accessibilityLabel="홈으로 돌아가기" />
        </View>
        <Text className="flex-1 text-center font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          이번주 패션 지출액
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ReceiptCard />

        <Text className="mb-[11px] mt-[16px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
          카테고리 별 지출
        </Text>

        {categorySpending.map((item) => (
          <CategorySpendingRow key={item.label} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
