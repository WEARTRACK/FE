import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { fetchClosetList } from "./closet-list-api";

vi.mock("@/config/env", () => ({
  env: { apiBaseUrl: "http://localhost:3000" },
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("fetchClosetList", () => {
  const getMock = vi.mocked(apiClient.get);

  beforeEach(() => {
    getMock.mockReset();
  });

  it("maps registered closets and sorts their sections", async () => {
    getMock.mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result: [
          {
            closetId: 12,
            templateId: 2,
            closetName: "안방 옷장",
            imageUrl: null,
            sections: [
              { sectionId: 102, sectionOrder: 2, sectionName: "겨울옷", clothesCount: 3 },
              { sectionId: 101, sectionOrder: 1, sectionName: "여름옷", clothesCount: 2 },
            ],
          },
        ],
      },
    });

    await expect(fetchClosetList()).resolves.toEqual([
      {
        closetId: 12,
        templateId: "LAYOUT_1",
        closetName: "안방 옷장",
        imageUrl: null,
        sections: [
          {
            id: "section-1",
            apiSectionId: 101,
            sectionName: "여름옷",
            clothesCount: 2,
          },
          {
            id: "section-2",
            apiSectionId: 102,
            sectionName: "겨울옷",
            clothesCount: 3,
          },
        ],
      },
    ]);
    expect(getMock).toHaveBeenCalledWith("/api/closets/select");
  });
});
