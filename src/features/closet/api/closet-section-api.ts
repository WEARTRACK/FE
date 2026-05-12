import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetSectionResultApi,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetSectionResultApi,
} from "./closet-api-types";
import {
  mapServerCategoryToClosetCategory,
  mapServerColorToClosetColor,
  resolveClosetImageUrl,
} from "./closet-api-mappers";

function toDisplayLabel(value: string) {
  if (value === "tshirt") {
    return "T-shirt";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function fetchClosetSectionItems(params: {
  closetId: number;
  sectionId: number;
  uiSectionId: ClosetSectionId;
  page?: number;
  size?: number;
}): Promise<ClosetItem[]> {
  const response = await apiClient.get<ApiEnvelope<ClosetSectionResultApi>>(
    `/api/closets/${params.closetId}/sections/${params.sectionId}`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 12,
      },
    },
  );

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷장 칸 조회 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetSectionResultApi(result)) {
    throw createInvalidResponseError("옷장 칸 조회 result 형식이 올바르지 않아요.", response.data);
  }

  return result.clothes.map((item) => {
    const color = mapServerColorToClosetColor(item.color);
    const category = mapServerCategoryToClosetCategory(item.category);

    return {
      id: String(item.clothesId),
      sectionId: params.uiSectionId,
      imageUri: resolveClosetImageUrl(item.imageUrl),
      price: 0,
      color,
      colorLabel: toDisplayLabel(color),
      category,
      categoryLabel: toDisplayLabel(category),
    };
  });
}
