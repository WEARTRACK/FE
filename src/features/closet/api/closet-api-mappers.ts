import {
  CLOSET_CATEGORIES,
  CLOSET_COLORS,
  type ClosetCategory,
  type ClosetColor,
} from "@/features/closet/types/closet-item";
import { ApiError } from "@/lib/api/errors";

const CATEGORY_ALIASES: Record<string, ClosetCategory> = {
  tshirt: "tshirt",
  t_shirt: "tshirt",
  tee: "tshirt",
  shirt: "shirt",
  knit: "knit",
  knite: "knit",
  hoodie: "hoodie",
  vest: "vest",
  cardigan: "cardigan",
  pants: "pants",
  shorts: "shorts",
  skirt: "skirt",
  dress: "dress",
  jacket: "jacket",
  coat: "coat",
  padding: "padding",
};

const COLOR_ALIASES: Record<string, ClosetColor> = {
  red: "red",
  pink: "pink",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  blue: "blue",
  navy: "navy",
  purple: "purple",
  white: "white",
  beige: "beige",
  brown: "brown",
  gray: "gray",
  grey: "gray",
  black: "black",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function createEnumMappingError(enumType: "color" | "category", rawValue: unknown) {
  return new ApiError({
    code: "INVALID_ENUM_MAPPING",
    message: `서버 ${enumType} 값을 앱 enum으로 변환할 수 없습니다.`,
    status: 500,
    details: { enumType, rawValue },
  });
}

export function mapServerColorToClosetColor(rawColor: string): ClosetColor {
  const normalized = normalize(rawColor);
  const mapped = COLOR_ALIASES[normalized];

  if (!mapped || !CLOSET_COLORS.includes(mapped)) {
    throw createEnumMappingError("color", rawColor);
  }

  return mapped;
}

export function mapServerCategoryToClosetCategory(rawCategory: string): ClosetCategory {
  const normalized = normalize(rawCategory);
  const mapped = CATEGORY_ALIASES[normalized];

  if (!mapped || !CLOSET_CATEGORIES.includes(mapped)) {
    throw createEnumMappingError("category", rawCategory);
  }

  return mapped;
}

export function resolveSectionName(input: { sectionName?: string; storageSectionName?: string }) {
  return input.sectionName ?? input.storageSectionName ?? null;
}
