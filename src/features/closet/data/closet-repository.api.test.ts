import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ClosetItem } from "@/features/closet/types/closet-item";

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

const fetchClosetSummaryMock = vi.fn();
const fetchClosetSectionItemsMock = vi.fn();
const fetchClosetStatisticsMock = vi.fn();

let mockedClosetId: number | null = null;
let mockedHydrated = true;
const rehydrateMock = vi.fn(async () => {
  mockedHydrated = true;
});

vi.mock("@/stores/useClosetStore", () => ({
  useClosetStore: {
    getState: () => ({ closetId: mockedClosetId }),
    persist: {
      hasHydrated: () => mockedHydrated,
      rehydrate: rehydrateMock,
    },
  },
}));

vi.mock("@/features/closet/api/closet-summary-api", () => ({
  fetchClosetSummary: fetchClosetSummaryMock,
}));

vi.mock("@/features/closet/api/closet-section-api", () => ({
  fetchClosetSectionItems: fetchClosetSectionItemsMock,
}));

vi.mock("@/features/closet/api/closet-statistics-api", () => ({
  fetchClosetStatistics: fetchClosetStatisticsMock,
}));

describe("apiClosetRepository smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedClosetId = 1;
    mockedHydrated = true;
  });

  it("loads template from closet summary API", async () => {
    fetchClosetSummaryMock.mockResolvedValueOnce({
      templateId: "LAYOUT_D",
      sections: [{ id: "section-1", sectionName: "아우터" }],
    });

    const { apiClosetRepository } = await import("./closet-repository");
    const template = await apiClosetRepository.getTemplate();

    expect(fetchClosetSummaryMock).toHaveBeenCalledWith(1);
    expect(template.templateId).toBe("LAYOUT_D");
    expect(template.sections[0]?.id).toBe("section-1");
  });

  it("throws when closetId is missing", async () => {
    mockedClosetId = null;
    const { apiClosetRepository } = await import("./closet-repository");

    await expect(apiClosetRepository.getTemplate()).rejects.toMatchObject({
      code: "CLOSET_ID_REQUIRED",
    });
  });

  it("uses persisted closetId after rehydrate", async () => {
    mockedClosetId = 7;
    mockedHydrated = false;

    fetchClosetSummaryMock.mockResolvedValueOnce({
      templateId: "LAYOUT_E",
      sections: [{ id: "section-1", sectionName: "칸1" }],
    });

    const { apiClosetRepository } = await import("./closet-repository");
    await apiClosetRepository.getTemplate();

    expect(rehydrateMock).toHaveBeenCalledTimes(1);
    expect(fetchClosetSummaryMock).toHaveBeenCalledWith(7);
  });

  it("loads section items with page 0 and size 12", async () => {
    const apiItems: ClosetItem[] = [
      {
        id: "1",
        sectionId: "section-2",
        imageUri: "http://localhost:3000/uploads/1.png",
        price: 0,
        color: "black",
        colorLabel: "Black",
        category: "coat",
        categoryLabel: "Coat",
      },
    ];

    fetchClosetSectionItemsMock.mockResolvedValueOnce(apiItems);

    const { apiClosetRepository } = await import("./closet-repository");
    const items = await apiClosetRepository.getItemsBySectionId("section-2");

    expect(fetchClosetSectionItemsMock).toHaveBeenCalledWith({
      closetId: 1,
      sectionId: 2,
      uiSectionId: "section-2",
      page: 0,
      size: 12,
    });
    expect(items).toEqual(apiItems);
  });

  it("builds statistics items from statistics API", async () => {
    fetchClosetStatisticsMock.mockResolvedValueOnce({
      totalCount: 3,
      categoryStatistics: [
        { category: "Knite", count: 2 },
        { category: "Coat", count: 1 },
      ],
    });

    const { apiClosetRepository } = await import("./closet-repository");
    const items = await apiClosetRepository.getAllItems();

    expect(fetchClosetStatisticsMock).toHaveBeenCalledWith(1);
    expect(items).toHaveLength(3);
    expect(items.filter((item) => item.category === "knit")).toHaveLength(2);
    expect(items.filter((item) => item.category === "coat")).toHaveLength(1);
  });
});
