import {
  CLOSET_CATEGORIES,
  CLOSET_COLORS,
  type ClosetCategory,
  type ClosetColor,
} from "@/features/closet/types/closet-item";

export type ClosetSearchMode = "color" | "category";

export type ClosetSearchValueByMode = {
  color: ClosetColor;
  category: ClosetCategory;
};

export type ClosetSearchParams =
  | {
      mode: "color";
      value: ClosetColor;
    }
  | {
      mode: "category";
      value: ClosetCategory;
    };

export type ClosetSearchResultItem = {
  id: string;
  clothesId: number;
  imageUri: string;
  color: ClosetColor;
  category: ClosetCategory;
  sectionName: string;
  price: number;
  colorLabel: string;
  categoryLabel: string;
  similarCount?: number;
};

export type ClosetSearchPage = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  items: ClosetSearchResultItem[];
};

export function isClosetSearchMode(value: string): value is ClosetSearchMode {
  return value === "color" || value === "category";
}

export function isClosetColor(value: string): value is ClosetColor {
  return CLOSET_COLORS.includes(value as (typeof CLOSET_COLORS)[number]);
}

export function isClosetCategory(value: string): value is ClosetCategory {
  return CLOSET_CATEGORIES.includes(value as (typeof CLOSET_CATEGORIES)[number]);
}

type RawSearchParam = string | string[] | undefined;

function pickSingle(value: RawSearchParam): string | null {
  // Selection routes in 1.4 pass only a single string.
  // We intentionally reject array params to avoid ambiguous query interpretation.
  return typeof value === "string" ? value : null;
}

export function parseClosetSearchParams(input: {
  mode?: RawSearchParam;
  value?: RawSearchParam;
}): ClosetSearchParams | null {
  const mode = pickSingle(input.mode);
  const value = pickSingle(input.value);

  if (!mode || !value || !isClosetSearchMode(mode)) {
    return null;
  }

  if (mode === "color" && isClosetColor(value)) {
    return { mode: "color", value };
  }

  if (mode === "category" && isClosetCategory(value)) {
    return { mode: "category", value };
  }

  return null;
}
