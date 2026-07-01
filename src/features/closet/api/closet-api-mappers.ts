import { env } from "@/config/env";
import {
  CLOSET_CATEGORIES,
  CLOSET_COLORS,
  type ClosetCategory,
  type ClosetColor,
} from "@/features/closet/types/closet-item";
import {
  isClosetSectionId,
  type ClosetSectionId,
  type ClosetTemplateId,
} from "@/features/closet/types/closet-layout";
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

export function mapServerColorToClosetColor(rawColor: string): string {
  const normalized = normalize(rawColor);
  const mapped = COLOR_ALIASES[normalized];

  if (mapped && CLOSET_COLORS.includes(mapped)) {
    return mapped;
  }

  return rawColor;
}

export function mapServerCategoryToClosetCategory(rawCategory: string): string {
  const normalized = normalize(rawCategory);
  const mapped = CATEGORY_ALIASES[normalized];

  if (mapped && CLOSET_CATEGORIES.includes(mapped)) {
    return mapped;
  }

  return rawCategory;
}

export function resolveSectionName(input: { sectionName?: string; storageSectionName?: string }) {
  return input.sectionName ?? input.storageSectionName ?? null;
}

export function resolveClosetImageUrl(rawImageUrl: string) {
  const imageUrl = rawImageUrl.trim();
  const baseUrl = new URL(env.apiBaseUrl);

  if (!imageUrl) {
    throw new ApiError({
      code: "INVALID_IMAGE_URL",
      message: "imageUrl 값이 비어 있습니다.",
      status: 500,
      details: { rawImageUrl },
    });
  }

  if (/^(data:|blob:)/i.test(imageUrl)) {
    return imageUrl;
  }

  if (/^(https?:\/\/|\/\/)/i.test(imageUrl)) {
    return new URL(imageUrl, baseUrl).toString();
  }

  const normalizedBase = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${normalizedBase}${normalizedPath}`;
}

export function normalizeServerEnumLikeValue(rawValue: string) {
  return normalize(rawValue);
}

export function mapApiSectionIdToClosetSectionId(rawSectionId: number): ClosetSectionId {
  const mapped = `section-${rawSectionId}`;

  if (!isClosetSectionId(mapped)) {
    throw new ApiError({
      code: "INVALID_SECTION_ID",
      message: "서버 sectionId 값을 앱 sectionId로 변환할 수 없습니다.",
      status: 500,
      details: { rawSectionId },
    });
  }

  return mapped;
}

export function mapSectionOrderToClosetSectionId(sectionOrder: number): ClosetSectionId {
  const mapped = `section-${sectionOrder}`;

  if (!isClosetSectionId(mapped)) {
    throw new ApiError({
      code: "INVALID_SECTION_ORDER",
      message: "서버 sectionOrder 값을 앱 sectionId로 변환할 수 없습니다.",
      status: 500,
      details: { sectionOrder },
    });
  }

  return mapped;
}

export function mapClosetSectionIdToApiSectionId(sectionId: ClosetSectionId): number {
  const parsed = Number(sectionId.replace("section-", ""));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError({
      code: "INVALID_SECTION_ID",
      message: "앱 sectionId 값을 서버 sectionId로 변환할 수 없습니다.",
      status: 400,
      details: { sectionId },
    });
  }

  return parsed;
}

export function mapApiTemplateIdToClosetTemplateId(rawTemplateId: number): ClosetTemplateId {
  switch (rawTemplateId) {
    case 2:
      return "LAYOUT_1";
    case 3:
      return "LAYOUT_2";
    case 4:
      return "LAYOUT_3";
    case 5:
      return "LAYOUT_4";
    case 6:
      return "LAYOUT_5";
    case 7:
      return "LAYOUT_6";
    case 8:
      return "LAYOUT_7";
    case 9:
      return "LAYOUT_8";
    case 10:
      return "LAYOUT_9";
    default:
      throw new ApiError({
        code: "INVALID_TEMPLATE_ID",
        message: "서버 templateId 값을 앱 templateId로 변환할 수 없습니다.",
        status: 500,
        details: { rawTemplateId },
      });
  }
}
