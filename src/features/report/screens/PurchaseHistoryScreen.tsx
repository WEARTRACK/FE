import { Image, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyClosetIcon from "../../../../assets/empty-closet.svg";
import { BackButton } from "@/components/common/BackButton";
import { getWeeklyReport } from "@/features/report/reportMockData";
import type { ReportProduct } from "@/features/report/reportMockData";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function ProductCard({ product }: { product: ReportProduct }) {
  return (
    <View className="mb-[9px] h-[93px] flex-row items-center rounded-[12px] border-[0.5px] border-blue-2 bg-white px-[24px]">
      <Image
        className="h-[58px] w-[58px] rounded-[5px] bg-cool"
        resizeMode="cover"
        source={require("../../../../assets/clotheExample.png")}
      />
      <View className="ml-[23px] h-[58px] flex-1 justify-between py-[3px]">
        <Text className="font-pretendard text-[15px] leading-[20px] text-text">{product.name}</Text>
        <View className="flex-row items-center justify-between pr-[55px]">
          <Text className="font-pretendard-light text-[13px] leading-[16px] text-text-subdued">
            {product.brand}
          </Text>
          <Text className="font-pretendard-light text-[13px] leading-[16px] text-text-subdued">
            {formatWon(product.price)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function PurchaseHistoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; reportId?: string }>();
  const report = getWeeklyReport(params.reportId);
  const category = report.categories.find((item) => item.label === params.category);
  const categoryLabel = category?.label ?? params.category ?? "카테고리";
  const products = category?.products ?? [];

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top }}>
      <View className="h-[72px] flex-row items-center px-6">
        <View className="w-8 items-start">
          <BackButton accessibilityLabel="리포트로 돌아가기" />
        </View>
        <Text className="flex-1 text-center font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          구매 내역
        </Text>
        <View className="w-8" />
      </View>

      {products.length > 0 ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
            {categoryLabel}
          </Text>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6 pb-[86px]">
          <EmptyClosetIcon width={147} height={174} />
          <Text className="mt-[44px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
            해당 카테고리의 구매 내역이 없어요.
          </Text>
        </View>
      )}
    </View>
  );
}
