import { useMemo } from "react";
import { FlatList, Image, Text, View } from "react-native";

import type { WeeklyReviewCategoryApi } from "@/features/weekly-review/api/weekly-review-api-types";
import {
  getWeeklyReviewCategoryLabel,
  parseWeeklyReviewCategory,
  toWeeklyReviewCategory,
} from "@/features/weekly-review/utils/weekly-review-category";

const CLOTHES_PER_PAGE = 6;
const GRID_COLUMN_COUNT = 3;
const CARD_HEIGHT = 110;
const GRID_GAP = 8;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function WeeklyReviewWornClothesCard({ imageUrl, size }: { imageUrl: string; size: number }) {
  return (
    <View
      className="overflow-hidden rounded-[13px] bg-cool"
      style={{ height: CARD_HEIGHT, width: size }}
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
        className="absolute inset-0 rounded-[13px] border border-bg-dark"
        pointerEvents="none"
      />
    </View>
  );
}

export function WeeklyReviewWornCategorySection({
  category,
  contentWidth,
}: {
  category: WeeklyReviewCategoryApi;
  contentWidth: number;
}) {
  const parsedCategory = parseWeeklyReviewCategory(category.category);
  const normalizedCategory = parsedCategory ?? toWeeklyReviewCategory(category.category);
  const categoryLabel = parsedCategory
    ? getWeeklyReviewCategoryLabel(normalizedCategory)
    : category.category;
  const pages = useMemo(() => chunkArray(category.clothes, CLOTHES_PER_PAGE), [category.clothes]);
  const cardSize = (contentWidth - GRID_GAP * (GRID_COLUMN_COUNT - 1)) / GRID_COLUMN_COUNT;
  const rowCount = Math.min(2, Math.max(1, Math.ceil(category.clothes.length / GRID_COLUMN_COUNT)));
  const gridHeight = rowCount * CARD_HEIGHT + (rowCount - 1) * GRID_GAP;

  if (category.clothes.length === 0) {
    return null;
  }

  return (
    <View className="mt-[24px]">
      <Text className="font-pretendard-semibold text-headline text-text">{categoryLabel}</Text>

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
              <WeeklyReviewWornClothesCard
                imageUrl={clothes.imageUrl}
                key={clothes.clothesId}
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
