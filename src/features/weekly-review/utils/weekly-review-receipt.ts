import { colors } from "@/constants/colors";
import { resolveClosetImageUrl } from "@/features/closet/api/closet-api-mappers";
import type { WeeklyWornClothesResultApi } from "@/features/weekly-review/api/weekly-review-api-types";
import type {
  ClosetUsageProfile,
  WeeklyReceiptReport,
} from "@/features/weekly-review/types/weekly-review";

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

export function createWeeklyReceiptReport({
  profile,
  usageRate,
  wornClothesResult,
}: {
  profile: ClosetUsageProfile;
  usageRate: number;
  wornClothesResult: WeeklyWornClothesResultApi | undefined;
}): WeeklyReceiptReport {
  const reportItems =
    wornClothesResult?.wornClothes.map((item) => ({
      clothesId: item.clothesId,
      imageUrl: resolveClosetImageUrl(item.imageUrl),
      price: item.price,
    })) ?? [];

  return {
    usageProfile: profile,
    usageRate,
    weekStartDate: "",
    weekEndDate: "",
    wornItems: reportItems,
    totalPrice: wornClothesResult?.totalWornClothesPrice ?? 0,
  };
}

export function formatReceiptPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
