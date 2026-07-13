import { ApiError } from "@/lib/api/errors";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

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
  color: string;
  category: string;
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
  color: string;
  category: string;
  price: number;
  sectionId: ClosetSectionId;
  sectionName: string;
};

export type ClosetUpdateRequestBody = {
  color: string | null;
  category: string | null;
  price: number | null;
  sectionId: ClosetSectionId | number | null;
};

export type ClosetDeleteResultApi =
  | null
  | {
      id?: number;
      createdAt?: string;
    };

export type ClosetSummarySectionApi = {
  sectionId: number;
  sectionName: string;
  sectionOrder: number;
  clothesCount: number;
};

export type ClosetSummaryResultApi = {
  closetName: string;
  templateId: number;
  sectionCount: number;
  sections: ClosetSummarySectionApi[];
};

export type ClosetSectionItemApi = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: string;
};

export type ClosetSectionResultApi = {
  sectionName: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  clothes: ClosetSectionItemApi[];
};

export type ClosetCategoryStatisticApi = {
  category: string;
  count: number;
};

export type ClosetStatisticsResultApi = {
  totalCount: number;
  categoryStatistics: ClosetCategoryStatisticApi[];
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

export function assertApiEnvelopeSuccess<T>(
  envelope: ApiEnvelope<T>,
  responseStatus: number,
): T | null | undefined {
  if (envelope.isSuccess) {
    return envelope.result;
  }

  throw new ApiError({
    code: envelope.code,
    message: envelope.message,
    status: responseStatus,
    details: envelope.result,
  });
}

export function isClosetDetailResultApi(value: unknown): value is ClosetDetailResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.clothesId === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.sectionId === "number" &&
    typeof candidate.sectionName === "string"
  );
}

export function isClosetDeleteResultApi(value: unknown): value is ClosetDeleteResultApi {
  if (value === null) {
    return true;
  }

  if (value === undefined) {
    return false;
  }

  if (typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.id === undefined || typeof candidate.id === "number") &&
    (candidate.createdAt === undefined || typeof candidate.createdAt === "string")
  );
}

export function isClosetSummaryResultApi(value: unknown): value is ClosetSummaryResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.closetName === "string" &&
    typeof candidate.templateId === "number" &&
    typeof candidate.sectionCount === "number" &&
    Array.isArray(candidate.sections) &&
    candidate.sections.every((section) => {
      if (!section || typeof section !== "object") {
        return false;
      }

      const s = section as Record<string, unknown>;
      return (
        typeof s.sectionId === "number" &&
        typeof s.sectionName === "string" &&
        typeof s.sectionOrder === "number" &&
        typeof s.clothesCount === "number"
      );
    })
  );
}

export function isClosetSectionResultApi(value: unknown): value is ClosetSectionResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.sectionName === "string" &&
    typeof candidate.totalCount === "number" &&
    typeof candidate.currentPage === "number" &&
    typeof candidate.totalPages === "number" &&
    typeof candidate.hasNext === "boolean" &&
    Array.isArray(candidate.clothes) &&
    candidate.clothes.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const clothes = item as Record<string, unknown>;
      return (
        typeof clothes.clothesId === "number" &&
        typeof clothes.imageUrl === "string" &&
        typeof clothes.color === "string" &&
        typeof clothes.category === "string"
      );
    })
  );
}

export function isClosetStatisticsResultApi(value: unknown): value is ClosetStatisticsResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.totalCount === "number" &&
    Array.isArray(candidate.categoryStatistics) &&
    candidate.categoryStatistics.every((stat) => {
      if (!stat || typeof stat !== "object") {
        return false;
      }

      const s = stat as Record<string, unknown>;
      return typeof s.category === "string" && typeof s.count === "number";
    })
  );
}
