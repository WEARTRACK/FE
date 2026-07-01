import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";

import WeartrackLogo from "../../../../assets/WEARTRACK-logo.svg";
import { BackButton } from "@/components/common/BackButton";
import { useCurrentWeeklyFashionConsumption } from "@/features/home/hooks/useCurrentWeeklyFashionConsumption";
import { groupCategoriesByExpense } from "@/features/report/utils/reportCategory";

type CategorySpending = {
  category: string;
  label: string;
  amount: number;
  sourceCategories: string[];
};

const categoryDefinitions = [
  { key: "T-SHIRT", label: "T-Shirt" },
  { key: "SHIRT", label: "Shirt" },
  { key: "KNIT", label: "Knit" },
  { key: "HOODIE", label: "Hoodie" },
  { key: "VEST", label: "Vest" },
  { key: "CARDIGAN", label: "Cardigan" },
  { key: "PANTS", label: "Pants" },
  { key: "SHORTS", label: "Shorts" },
  { key: "SKIRT", label: "Skirt" },
  { key: "DRESS", label: "Dress" },
  { key: "JACKET", label: "Jacket" },
  { key: "COAT", label: "Coat" },
  { key: "PADDING", label: "Padding" },
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

function ReceiptCard({
  totalSpending,
  changeRate,
}: {
  totalSpending: number;
  changeRate: number | null;
}) {
  const formattedChangeRate =
    changeRate === null ? "-" : `${changeRate > 0 ? "+" : ""}${changeRate}%`;

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
        <Text
          className={`font-pretendard text-[14px] leading-[16px] ${
            changeRate !== null && changeRate > 0 ? "text-red-3" : "text-green-3"
          }`}
        >
          1주 전 대비 {formattedChangeRate}
        </Text>
      </View>

      <DottedDivider />

      <Text className="mt-[14px] text-center font-pretendard text-[14px] leading-[14px] text-primary">
        Total price
      </Text>
      <Text className="mt-[8px] text-center font-pretendard-semibold text-[24px] leading-[28px] text-primary">
        {formatWon(totalSpending)}
      </Text>
    </View>
  );
}

function CategorySpendingRow({
  item,
  totalSpending,
  onPress,
}: {
  item: CategorySpending;
  totalSpending: number;
  onPress: () => void;
}) {
  const progress = totalSpending > 0 ? item.amount / totalSpending : 0;

  return (
    <Pressable
      accessibilityLabel={`${item.label} 구매 내역 보기`}
      accessibilityRole="button"
      className="mx-6 mb-2 rounded-[4px] border-[0.5px] border-cool bg-white px-6 pb-[12px] pt-[12px]"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
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
    </Pressable>
  );
}

export function WeeklySpendingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: weeklyConsumption } = useCurrentWeeklyFashionConsumption({ page: 0, size: 13 });
  const totalSpending = weeklyConsumption?.totalExpenseAmount ?? 0;
  const changeRate = weeklyConsumption ? weeklyConsumption.expenseChangeRate : null;
  const groupedCategories = groupCategoriesByExpense(weeklyConsumption?.categories ?? []);
  const categorySpending = categoryDefinitions
    .map(({ key, label }, originalIndex) => {
      const category = groupedCategories.find((item) => item.category === key);

      return {
        category: key,
        label,
        amount: category?.expenseAmount ?? 0,
        sourceCategories: category?.sourceCategories ?? [key],
        originalIndex,
      };
    })
    .sort((first, second) => {
      if (first.amount !== second.amount) {
        return second.amount - first.amount;
      }

      return first.originalIndex - second.originalIndex;
    });

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
        <ReceiptCard totalSpending={totalSpending} changeRate={changeRate} />

        <Text className="mb-[11px] mt-[16px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
          카테고리 별 지출
        </Text>

        {categorySpending.map((item) => (
          <CategorySpendingRow
            key={item.label}
            item={item}
            totalSpending={totalSpending}
            onPress={() =>
              router.push({
                pathname: "/home/purchase-history",
                params: {
                  category: item.category,
                  currentWeek: "true",
                  sourceCategories: item.sourceCategories.join(","),
                },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
