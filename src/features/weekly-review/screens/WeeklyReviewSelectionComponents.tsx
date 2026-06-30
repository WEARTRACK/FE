import { useMemo } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import type { DailyReviewCategoryApi } from "@/features/weekly-review/api/weekly-review-api-types";
import {
  getWeeklyReviewCategoryLabel,
  parseWeeklyReviewCategory,
  toWeeklyReviewCategory,
} from "@/features/weekly-review/utils/weekly-review-category";

const CLOTHES_PER_PAGE = 6;
const GRID_COLUMN_COUNT = 3;
const CARD_HEIGHT = 110;
const GRID_GAP = 8;

type WeeklyReviewClothesCardProps = {
  imageUrl: string;
  isSelected: boolean;
  onPress: () => void;
  size: number;
};

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

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
  const pages = useMemo(() => chunkArray(category.clothes, CLOTHES_PER_PAGE), [category.clothes]);
  const cardSize = (contentWidth - GRID_GAP * (GRID_COLUMN_COUNT - 1)) / GRID_COLUMN_COUNT;
  const rowCount = Math.min(2, Math.max(1, Math.ceil(category.clothes.length / GRID_COLUMN_COUNT)));
  const gridHeight = rowCount * CARD_HEIGHT + (rowCount - 1) * GRID_GAP;

  return (
    <View className="mt-[25px]">
      <View className="h-5 flex-row items-center justify-between">
        <Text className="font-pretendard-semibold text-headline text-text">{categoryLabel}</Text>
        <Text className="font-pretendard-light text-caption text-text-subdued">
          {selectedCount}개 선택됨
        </Text>
      </View>

      <FlatList
        className="mt-4"
        data={pages}
        horizontal
        keyExtractor={(_, index) => `${category.category}-${index}`}
        pagingEnabled
        renderItem={({ item: page }) => (
          <View
            className="flex-row flex-wrap"
            style={{
              gap: GRID_GAP,
              height: gridHeight,
              width: contentWidth,
            }}
          >
            {page.map((clothes) => (
              <WeeklyReviewClothesCard
                imageUrl={clothes.imageUrl}
                isSelected={selectedIds.has(clothes.clothesId)}
                key={clothes.clothesId}
                onPress={() => onToggle(clothes.clothesId)}
                size={cardSize}
              />
            ))}
          </View>
        )}
        scrollEnabled={pages.length > 1}
        showsHorizontalScrollIndicator={pages.length > 1}
        style={{ height: gridHeight }}
      />
    </View>
  );
}
