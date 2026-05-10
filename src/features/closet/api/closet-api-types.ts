import { ApiError } from "@/lib/api/errors";
import type { ClosetCategory, ClosetColor } from "@/features/closet/types/closet-item";

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T | null;
};

export type ClosetFilterRequestQuery =
  | {
      color: string;
      category?: never;
      page: number;
      size: number;
      sort?: string[];
    }
  | {
      color?: never;
      category: string;
      page: number;
      size: number;
      sort?: string[];
    };

export type ClosetFilterItemApi = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: string;
  sectionName?: string;
  storageSectionName?: string;
};

export type ClosetFilterResultApi = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  clothes: ClosetFilterItemApi[];
};

export type ClosetFilterItem = {
  clothesId: number;
  imageUrl: string;
  color: ClosetColor;
  category: ClosetCategory;
  sectionName: string;
};

export type ClosetFilterResult = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  clothes: ClosetFilterItem[];
};

export type ClosetDetailResultApi = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: string;
  price: number;
  sectionId: number;
  sectionName: string;
};

export type ClosetDetailResult = {
  clothesId: number;
  imageUrl: string;
  color: ClosetColor;
  category: ClosetCategory;
  price: number;
  sectionId: number;
  sectionName: string;
};

export type ClosetUpdateRequestBody = {
  color: string | null;
  category: string | null;
  price: number | null;
  sectionId: number | null;
};

export type ClosetDeleteResultApi = null | {
  id?: number;
  createdAt?: string;
};

export function createInvalidResponseError(message: string, details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message,
    status: null,
    details,
  });
}

export function assertExclusiveFilterQuery(query: {
  color?: string;
  category?: string;
}) {
  const hasColor = typeof query.color === "string" && query.color.trim().length > 0;
  const hasCategory = typeof query.category === "string" && query.category.trim().length > 0;

  if (hasColor === hasCategory) {
    throw new ApiError({
      code: "INVALID_FILTER_QUERY",
      message: "색상 또는 카테고리 중 하나만 선택해야 합니다.",
      status: 400,
      details: query,
    });
  }
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}
