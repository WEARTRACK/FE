import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetSummaryResultApi,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetSummaryResultApi,
} from "./closet-api-types";
import {
  mapApiTemplateIdToClosetTemplateId,
  mapSectionOrderToClosetSectionId,
} from "./closet-api-mappers";
import type { ClosetTemplate } from "@/features/closet/types/closet-layout";

export async function fetchClosetSummary(closetId: number): Promise<ClosetTemplate> {
  const response = await apiClient.get<ApiEnvelope<ClosetSummaryResultApi>>(
    `/api/closets/${closetId}`,
  );

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷장 조회 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetSummaryResultApi(result)) {
    throw createInvalidResponseError("옷장 조회 result 형식이 올바르지 않아요.", response.data);
  }

  const sections = [...result.sections]
    .sort((left, right) => left.sectionOrder - right.sectionOrder)
    .map((section) => ({
      id: mapSectionOrderToClosetSectionId(section.sectionOrder),
      apiSectionId: section.sectionId,
      sectionName: section.sectionName,
    }));

  return {
    templateId: mapApiTemplateIdToClosetTemplateId(result.templateId),
    sections,
  };
}
