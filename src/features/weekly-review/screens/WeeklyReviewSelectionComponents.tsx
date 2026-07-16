import { useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import type { DailyReviewCategoryApi } from "@/features/weekly-review/api/weekly-review-api-types";
import {
  getWeeklyReviewCategoryLabel,
  parseWeeklyReviewCategory,
  toWeeklyReviewCategory,
} from "@/features/weekly-review/utils/weekly-review-category";

const GRID_COLUMN_COUNT = 3;
const CARD_HEIGHT = 110;
const GRID_GAP = 8;
const SCROLLBAR_HEIGHT = 3;
const SCROLLBAR_MIN_THUMB_WIDTH = 52;

type WeeklyReviewClothesCardProps = {
  imageUrl: string;
  isSelected: boolean;
  onPress: () => void;
  size: number;
};

function WeeklyReviewClothesCard({
  imageUrl,
  isSelected,
  onPress,
  size,
}: WeeklyReviewClothesCardProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      className="overflow-hidden rounded-[13px] bg-cool"
      onPress={onPress}
      style={({ pressed }) => ({
        height: CARD_HEIGHT,
        opacity: pressed ? 0.72 : 1,
        width: size,
      })}
    >
      <Image
        resizeMode="cover"
        source={{ uri: imageUrl }}
        style={{
          height: CARD_HEIGHT,
          width: size,
        }}
      />
      <View
        className="absolute inset-0 rounded-[13px]"
        pointerEvents="none"
        style={{
          borderColor: isSelected ? "#070117" : "#6B7280",
          borderWidth: isSelected ? 2 : 0.5,
        }}
      />
      {isSelected ? (
        <View className="absolute right-[11px] top-[11px]">
          <CheckActiveIcon height={30} width={30} />
        </View>
      ) : null}
    </Pressable>
  );
}

type WeeklyReviewCategorySectionProps = {
  category: DailyReviewCategoryApi;
  contentWidth: number;
  selectedIds: Set<number>;
  onToggle: (clothesId: number) => void;
};

export function WeeklyReviewCategorySection({
  category,
  contentWidth,
  selectedIds,
  onToggle,
}: WeeklyReviewCategorySectionProps) {
  const parsedCategory = parseWeeklyReviewCategory(category.category);
  const normalizedCategory = parsedCategory ?? toWeeklyReviewCategory(category.category);
  const categoryLabel = parsedCategory
    ? getWeeklyReviewCategoryLabel(normalizedCategory)
    : category.category;
  const selectedCount = category.clothes.filter((clothes) =>
    selectedIds.has(clothes.clothesId),
  ).length;
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardSize = (contentWidth - GRID_GAP * (GRID_COLUMN_COUNT - 1)) / GRID_COLUMN_COUNT;
  const rowCount = Math.min(2, Math.max(1, Math.ceil(category.clothes.length / GRID_COLUMN_COUNT)));
  const gridHeight = rowCount * CARD_HEIGHT + (rowCount - 1) * GRID_GAP;
  const columnCount = Math.ceil(category.clothes.length / rowCount);
  const scrollContentWidth = columnCount * cardSize + Math.max(columnCount - 1, 0) * GRID_GAP;
  const scrollableDistance = Math.max(scrollContentWidth - contentWidth, 0);
  const scrollbarThumbWidth =
    scrollableDistance > 0
      ? Math.max(SCROLLBAR_MIN_THUMB_WIDTH, (contentWidth / scrollContentWidth) * contentWidth)
      : contentWidth;
  const scrollbarTravelDistance = Math.max(contentWidth - scrollbarThumbWidth, 0);
  const scrollbarTranslateX = scrollX.interpolate({
    inputRange: [0, scrollableDistance || 1],
    outputRange: [0, scrollbarTravelDistance],
    extrapolate: "clamp",
  });

  return (
    <View className="mt-[25px]">
      <View className="h-5 flex-row items-center justify-between">
        <Text className="font-pretendard-semibold text-headline text-text">{categoryLabel}</Text>
        <Text className="font-pretendard-light text-caption text-text-subdued">
          {selectedCount}개 선택됨
        </Text>
      </View>

      <Animated.ScrollView
        className="mt-4"
        horizontal
        contentContainerStyle={{
          columnGap: GRID_GAP,
          flexDirection: "row",
          flexWrap: "wrap",
          height: gridHeight,
          rowGap: GRID_GAP,
          width: scrollContentWidth,
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEnabled={scrollableDistance > 0}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{ height: gridHeight }}
      >
        {category.clothes.map((clothes) => (
          <View key={clothes.clothesId}>
            <WeeklyReviewClothesCard
              imageUrl={clothes.imageUrl}
              isSelected={selectedIds.has(clothes.clothesId)}
              onPress={() => onToggle(clothes.clothesId)}
              size={cardSize}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {scrollableDistance > 0 ? (
        <View
          className="mt-3 overflow-hidden bg-disabled"
          style={{
            height: SCROLLBAR_HEIGHT,
            width: contentWidth,
          }}
        >
          <Animated.View
            className="bg-bg-dark"
            style={{
              height: SCROLLBAR_HEIGHT,
              transform: [{ translateX: scrollbarTranslateX }],
              width: scrollbarThumbWidth,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
