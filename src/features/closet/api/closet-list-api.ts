import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";
import {
  mapApiTemplateIdToClosetTemplateId,
  mapSectionOrderToClosetSectionId,
} from "./closet-api-mappers";
import type { ClosetSection, ClosetTemplateId } from "@/features/closet/types/closet-layout";

type ClosetListSectionApi = {
  sectionId: number;
  sectionName: string;
  sectionOrder: number;
  clothesCount: number;
};

type ClosetListItemApi = {
  closetId: number;
  templateId: number;
  closetName: string;
  imageUrl?: string | null;
  sections: ClosetListSectionApi[];
};

export type ClosetListItem = {
  closetId: number;
  templateId: ClosetTemplateId;
  closetName: string;
  imageUrl: string | null;
  sections: ClosetSection[];
};

function isClosetListItemApi(value: unknown): value is ClosetListItemApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.closetId === "number" &&
    typeof candidate.templateId === "number" &&
    typeof candidate.closetName === "string" &&
    (candidate.imageUrl === undefined ||
      candidate.imageUrl === null ||
      typeof candidate.imageUrl === "string") &&
    Array.isArray(candidate.sections) &&
    candidate.sections.every((section) => {
      if (!section || typeof section !== "object") {
        return false;
      }

      const target = section as Record<string, unknown>;
      return (
        typeof target.sectionId === "number" &&
        typeof target.sectionName === "string" &&
        typeof target.sectionOrder === "number" &&
        typeof target.clothesCount === "number"
      );
    })
  );
}

export async function fetchClosetList(): Promise<ClosetListItem[]> {
  const response = await apiClient.get<ApiEnvelope<ClosetListItemApi[]>>("/api/closets/select");

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷장 목록 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);
  if (!Array.isArray(result) || !result.every(isClosetListItemApi)) {
    throw createInvalidResponseError("옷장 목록 result 형식이 올바르지 않아요.", response.data);
  }

  return result.map((closet) => ({
    closetId: closet.closetId,
    templateId: mapApiTemplateIdToClosetTemplateId(closet.templateId),
    closetName: closet.closetName,
    imageUrl: closet.imageUrl ?? null,
    sections: [...closet.sections]
      .sort((left, right) => left.sectionOrder - right.sectionOrder)
      .map((section) => ({
        id: mapSectionOrderToClosetSectionId(section.sectionOrder),
        apiSectionId: section.sectionId,
        sectionName: section.sectionName,
        clothesCount: section.clothesCount,
      })),
  }));
}
