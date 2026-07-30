import { colors } from "@/constants/colors";
import { resolveClosetImageUrl } from "@/features/closet/api/closet-api-mappers";
import type { WeeklyWornClothesResultApi } from "@/features/weekly-review/api/weekly-review-api-types";
import type {
  ClosetUsageProfile,
  WeeklyReceiptReport,
} from "@/features/weekly-review/types/weekly-review";
import { ApiError } from "@/lib/api/errors";

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

function resolveWeeklyReceiptImageUrl(rawImageUrl: string) {
  try {
    return resolveClosetImageUrl(rawImageUrl);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.code === "INVALID_IMAGE_URL_DOMAIN" &&
      /^https:\/\//i.test(rawImageUrl.trim())
    ) {
      return rawImageUrl.trim();
    }

    throw error;
  }
}

export function createWeeklyReceiptReport({
  imageUrlByClothesId,
  profile,
  usageRate,
  wornClothesResult,
}: {
  imageUrlByClothesId?: Map<number, string>;
  profile: ClosetUsageProfile;
  usageRate: number;
  wornClothesResult: WeeklyWornClothesResultApi | undefined;
}): WeeklyReceiptReport {
  const reportItems =
    wornClothesResult?.wornClothes.map((item) => {
      const fallbackImageUrl = imageUrlByClothesId?.get(item.clothesId);
      const imageUrl = fallbackImageUrl ?? item.imageUrl;

      return {
        clothesId: item.clothesId,
        imageUrl: resolveWeeklyReceiptImageUrl(imageUrl),
        price: item.price,
      };
    }) ?? [];

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
