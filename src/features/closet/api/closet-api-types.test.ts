import { describe, expect, it } from "vitest";

import { ApiError } from "../../../lib/api/errors";

import {
  assertApiEnvelopeSuccess,
  isClosetSectionResultApi,
  isClosetStatisticsResultApi,
  isClosetSummaryResultApi,
  type ApiEnvelope,
} from "./closet-api-types";

describe("closet-api-types", () => {
  it("throws ApiError when envelope is fail", () => {
    const failedEnvelope: ApiEnvelope<unknown> = {
      isSuccess: false,
      code: "CLOSET_500",
      message: "요청에 실패했습니다.",
      result: { reason: "server" },
    };

    expect(() => assertApiEnvelopeSuccess(failedEnvelope, 500)).toThrowError(ApiError);
  });

  it("validates closet summary response shape", () => {
    const valid = {
      templateId: 4,
      sectionCount: 8,
      sections: [
        {
          sectionId: 1,
          sectionName: "아우터",
          sectionOrder: 1,
          clothesCount: 2,
        },
      ],
    };

    const invalid = {
      ...valid,
      sections: [{ ...valid.sections[0], sectionOrder: "1" }],
    };

    expect(isClosetSummaryResultApi(valid)).toBe(true);
    expect(isClosetSummaryResultApi(invalid)).toBe(false);
  });

  it("validates closet section response shape", () => {
    const valid = {
      sectionName: "아우터",
      totalCount: 2,
      currentPage: 0,
      totalPages: 1,
      hasNext: false,
      clothes: [{ clothesId: 5, imageUrl: "/uploads/a.png", color: "white", category: "Knite" }],
    };

    const invalid = {
      ...valid,
      clothes: [{ ...valid.clothes[0], clothesId: "5" }],
    };

    expect(isClosetSectionResultApi(valid)).toBe(true);
    expect(isClosetSectionResultApi(invalid)).toBe(false);
  });

  it("validates closet statistics response shape", () => {
    const valid = {
      totalCount: 3,
      categoryStatistics: [
        { category: "Knite", count: 2 },
        { category: "OUTER", count: 1 },
      ],
    };

    const invalid = {
      ...valid,
      categoryStatistics: [{ category: "Knite", count: "2" }],
    };

    expect(isClosetStatisticsResultApi(valid)).toBe(true);
    expect(isClosetStatisticsResultApi(invalid)).toBe(false);
  });
});
