import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyClosetIcon from "../../../../assets/empty-closet.svg";
import { BackButton } from "@/components/common/BackButton";
import type { WeeklyCategoryClothesItem } from "@/features/report/api/weeklyFashionReportApi";
import { useWeeklyCategoryClothes } from "@/features/report/hooks/useWeeklyFashionReport";
import { formatCategoryLabel } from "@/features/report/utils/reportCategory";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function ProductCard({
  product,
  categoryLabel,
}: {
  product: WeeklyCategoryClothesItem;
  categoryLabel: string;
}) {
  const description = product.sourceShopName ?? product.color;

  return (
    <View className="mb-[9px] h-[93px] flex-row items-center rounded-[12px] border-[0.5px] border-blue-2 bg-white px-[24px]">
      <Image
        className="h-[58px] w-[58px] rounded-[5px] bg-cool"
        resizeMode="cover"
        source={
          product.imageUrl
            ? { uri: product.imageUrl }
            : require("../../../../assets/clotheExample.png")
        }
      />
      <View className="ml-[23px] h-[58px] flex-1 justify-between py-[3px]">
        <Text className="font-pretendard text-[15px] leading-[20px] text-text">
          {product.productName ?? categoryLabel}
        </Text>
        <View className="flex-row items-center justify-between pr-[55px]">
          <Text className="font-pretendard-light text-[13px] leading-[16px] text-text-subdued">
            {description ?? ""}
          </Text>
          {product.price !== null ? (
            <Text className="font-pretendard-light text-[13px] leading-[16px] text-text-subdued">
              {formatWon(product.price)}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function PurchaseHistoryScreen({
  backAccessibilityLabel = "리포트로 돌아가기",
}: {
  backAccessibilityLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    category?: string;
    currentWeek?: string;
    sourceCategories?: string;
    weekStartDate?: string;
  }>();
  const category = params.category ?? "";
  const isCurrentWeek = params.currentWeek === "true";
  const weekStartDate = params.weekStartDate ?? "";
  const sourceCategories =
    params.sourceCategories?.split(",").filter(Boolean) ?? (category ? [category] : []);
  const categoryLabel = category ? formatCategoryLabel(category) : "카테고리";
  const clothesQuery = useWeeklyCategoryClothes(weekStartDate, sourceCategories, isCurrentWeek);
  const products = clothesQuery.data?.clothes ?? [];

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top }}>
      <View className="h-[72px] flex-row items-center px-6">
        <View className="w-8 items-start">
          <BackButton accessibilityLabel={backAccessibilityLabel} />
        </View>
        <Text className="flex-1 text-center font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          구매 내역
        </Text>
        <View className="w-8" />
      </View>

      {clothesQuery.isPending ? (
        <View className="flex-1 items-center justify-center pb-[86px]">
          <ActivityIndicator color="#272C35" />
        </View>
      ) : clothesQuery.isError ? (
        <View className="flex-1 items-center justify-center px-6 pb-[86px]">
          <Text className="font-pretendard text-[15px] text-text-subdued">
            구매 내역을 불러오지 못했어요.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-4 rounded-[6px] bg-bg-dark px-5 py-3"
            onPress={() => clothesQuery.refetch()}
          >
            <Text className="font-pretendard text-[14px] text-white">다시 시도</Text>
          </Pressable>
        </View>
      ) : products.length > 0 ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
            {categoryLabel}
          </Text>
          {products.map((product) => (
            <ProductCard key={product.clothesId} product={product} categoryLabel={categoryLabel} />
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
