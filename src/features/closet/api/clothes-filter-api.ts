import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  assertExclusiveFilterQuery,
  type ApiEnvelope,
  type ClosetFilterItemApi,
  type ClosetFilterRequestQuery,
  type ClosetFilterResult,
  type ClosetFilterResultApi,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";
import {
  mapServerCategoryToClosetCategory,
  mapServerColorToClosetColor,
  resolveClosetImageUrl,
  resolveSectionName,
} from "./closet-api-mappers";

function isClosetFilterItemApi(value: unknown): value is ClosetFilterItemApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.clothesId === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.category === "string" &&
    (candidate.sectionName === undefined || typeof candidate.sectionName === "string") &&
    (candidate.storageSectionName === undefined || typeof candidate.storageSectionName === "string")
  );
}

function isClosetFilterResultApi(value: unknown): value is ClosetFilterResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.totalCount === "number" &&
    typeof candidate.currentPage === "number" &&
    typeof candidate.totalPages === "number" &&
    typeof candidate.hasNext === "boolean" &&
    Array.isArray(candidate.clothes) &&
    candidate.clothes.every((item) => isClosetFilterItemApi(item))
  );
}

export async function fetchClothesByFilter(
  query: ClosetFilterRequestQuery,
): Promise<ClosetFilterResult> {
  assertExclusiveFilterQuery(query);

  const response = await apiClient.get<ApiEnvelope<ClosetFilterResultApi>>("/api/clothes/filter", {
    params: query,
  });

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 필터 조회 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetFilterResultApi(result)) {
    throw createInvalidResponseError("옷 필터 조회 result 형식이 올바르지 않아요.", response.data);
  }

  return {
    totalCount: result.totalCount,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    clothes: result.clothes.map((item) => {
      const sectionName = resolveSectionName(item);

      if (!sectionName) {
        throw createInvalidResponseError("옷 필터 조회 sectionName 형식이 올바르지 않아요.", item);
      }

      return {
        clothesId: item.clothesId,
        imageUrl: resolveClosetImageUrl(item.imageUrl),
        color: mapServerColorToClosetColor(item.color),
        category: mapServerCategoryToClosetCategory(item.category),
        sectionName,
      };
    }),
  };
}
