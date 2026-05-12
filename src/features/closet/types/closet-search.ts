export type ClosetSearchMode = "color" | "category";

export type ClosetSearchValueByMode = {
  color: string;
  category: string;
};

export type ClosetSearchParams =
  | {
      mode: "color";
      value: string;
    }
  | {
      mode: "category";
      value: string;
    };

export type ClosetSearchResultItem = {
  id: string;
  clothesId: number;
  imageUri: string;
  color: string;
  category: string;
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

  if (mode === "color" && value.trim().length > 0) {
    return { mode: "color", value };
  }

  if (mode === "category" && value.trim().length > 0) {
    return { mode: "category", value };
  }

  return null;
}
