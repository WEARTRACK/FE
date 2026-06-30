import { colors } from "@/constants/colors";
import type { WeeklyReviewResultApi } from "@/features/weekly-review/api/weekly-review-api-types";
import type {
  ClosetUsageProfile,
  WeeklyReceiptReport,
} from "@/features/weekly-review/types/weekly-review";
import {
  getWeeklyReviewCategoryLabel,
  toWeeklyReviewCategory,
} from "@/features/weekly-review/utils/weekly-review-category";
import { getMockReceiptPrice } from "@/features/weekly-review/utils/weekly-review-receipt-mock";

export type WeeklyReceiptTheme = {
  accent: string;
  barcode: string;
  soft: string;
  softer: string;
};

export const weeklyReceiptThemeByToken: Record<
  ClosetUsageProfile["colorToken"],
  WeeklyReceiptTheme
> = {
  blue: {
    accent: colors.blue[4],
    barcode: colors.blue[3],
    soft: colors.blue[2],
    softer: colors.blue[1],
  },
  green: {
    accent: colors.green[4],
    barcode: colors.green[3],
    soft: colors.green[2],
    softer: colors.green[1],
  },
  yellow: {
    accent: colors.yellow[4],
    barcode: colors.yellow[3],
    soft: colors.yellow[2],
    softer: colors.yellow[1],
  },
  red: {
    accent: colors.red[4],
    barcode: colors.red[3],
    soft: colors.red[2],
    softer: colors.red[1],
  },
};

function flattenWornItems(weeklyReview: WeeklyReviewResultApi | undefined) {
  return (
    weeklyReview?.categories.flatMap((category) =>
      category.clothes.map((clothes) => ({
        ...clothes,
        category: category.category,
      })),
    ) ?? []
  );
}

export function createWeeklyReceiptReport({
  profile,
  usageRate,
  weeklyReview,
}: {
  profile: ClosetUsageProfile;
  usageRate: number;
  weeklyReview: WeeklyReviewResultApi | undefined;
}): WeeklyReceiptReport {
  const wornItems = flattenWornItems(weeklyReview);
  const reportItems = wornItems.map((item, index) => {
    const category = toWeeklyReviewCategory(item.category);

    return {
      category,
      categoryLabel: getWeeklyReviewCategoryLabel(category),
      clothesId: item.clothesId,
      color: item.color,
      imageUrl: item.imageUrl,
      price: getMockReceiptPrice(profile, index),
    };
  });

  return {
    usageProfile: profile,
    usageRate,
    weekStartDate: weeklyReview?.weekStartDate ?? "",
    weekEndDate: weeklyReview?.weekEndDate ?? "",
    wornItems: reportItems,
    totalPrice: reportItems.reduce((sum, item) => sum + item.price, 0),
  };
}

export function formatReceiptPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
