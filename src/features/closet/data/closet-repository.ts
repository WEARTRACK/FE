import { deleteClothes } from "@/features/closet/api/clothes-delete-api";
import { fetchClothesDetail } from "@/features/closet/api/clothes-detail-api";
import { fetchClothesByFilter } from "@/features/closet/api/clothes-filter-api";
import { mapServerCategoryToClosetCategory } from "@/features/closet/api/closet-api-mappers";
import { fetchClosetSectionItems } from "@/features/closet/api/closet-section-api";
import { fetchClosetStatistics } from "@/features/closet/api/closet-statistics-api";
import { fetchClosetSummary } from "@/features/closet/api/closet-summary-api";
import { updateClothes as updateClothesApi } from "@/features/closet/api/clothes-update-api";
import type { ClosetDeleteResultApi, ClosetDetailResult, ClosetUpdateRequestBody } from "@/features/closet/api/closet-api-types";
import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSectionId, ClosetTemplate } from "@/features/closet/types/closet-layout";
import type { ClosetSearchPage, ClosetSearchParams } from "@/features/closet/types/closet-search";
import { ApiError } from "@/lib/api/errors";
import { useClosetStore } from "@/stores/useClosetStore";

async function resolveClosetId() {
  if (!useClosetStore.persist.hasHydrated()) {
    await useClosetStore.persist.rehydrate();
  }

  const closetId = useClosetStore.getState().closetId;
  if (closetId === null) {
    throw new ApiError({
      code: "CLOSET_ID_REQUIRED",
      message: "옷장 정보가 없습니다. 옷장 등록 후 다시 시도해주세요.",
      status: 400,
    });
  }

  return closetId;
}

function toDisplayLabel(value: string) {
  if (value === "tshirt") {
    return "T-shirt";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function resolveApiSectionId(params: { closetId: number; uiSectionId: ClosetSectionId }) {
  const template = await fetchClosetSummary(params.closetId);
  const section = template.sections.find((target) => target.id === params.uiSectionId);

  if (!section || typeof section.apiSectionId !== "number") {
    throw new ApiError({
      code: "INVALID_SECTION_ID",
      message: "섹션 정보를 찾을 수 없습니다.",
      status: 400,
      details: { uiSectionId: params.uiSectionId },
    });
  }

  return section.apiSectionId;
}

export type ClosetDataRepository = {
  getTemplate: () => Promise<ClosetTemplate>;
  getAllItems: () => Promise<ClosetItem[]>;
  getItemsBySectionId: (sectionId: ClosetSectionId) => Promise<ClosetItem[]>;
  getItemById: (sectionId: ClosetSectionId, itemId: string) => Promise<ClosetItem | null>;
  searchClothes: (params: {
    searchParams: ClosetSearchParams;
    page: number;
    size: number;
  }) => Promise<ClosetSearchPage>;
  getClothesDetail: (clothesId: number) => Promise<ClosetDetailResult>;
  updateClothes: (clothesId: number, payload: ClosetUpdateRequestBody) => Promise<ClosetDetailResult>;
  deleteClothes: (clothesId: number) => Promise<ClosetDeleteResultApi>;
};

export const apiClosetRepository: ClosetDataRepository = {
  getTemplate: async () => fetchClosetSummary(await resolveClosetId()),
  getAllItems: async () => {
    const result = await fetchClosetStatistics(await resolveClosetId());
    const items: ClosetItem[] = [];
    let cursor = 1;

    result.categoryStatistics.forEach((stat) => {
      const category = mapServerCategoryToClosetCategory(stat.category);
      const count = Math.max(0, stat.count);

      for (let index = 0; index < count; index += 1) {
        items.push({
          id: `stats-${cursor}`,
          sectionId: "section-1",
          imageUri: "",
          price: 0,
          color: "black",
          colorLabel: "Black",
          category,
          categoryLabel: toDisplayLabel(category),
        });
        cursor += 1;
      }
    });

    return items;
  },
  getItemsBySectionId: async (sectionId) =>
    {
      const closetId = await resolveClosetId();
      const apiSectionId = await resolveApiSectionId({ closetId, uiSectionId: sectionId });

      return fetchClosetSectionItems({
        closetId,
        sectionId: apiSectionId,
        uiSectionId: sectionId,
        page: 0,
        size: 12,
      });
    },
  getItemById: async (sectionId, itemId) => {
    const closetId = await resolveClosetId();
    const apiSectionId = await resolveApiSectionId({ closetId, uiSectionId: sectionId });
    const items = await fetchClosetSectionItems({
      closetId,
      sectionId: apiSectionId,
      uiSectionId: sectionId,
      page: 0,
      size: 12,
    });

    return items.find((target) => target.id === itemId) ?? null;
  },
  searchClothes: async ({ searchParams, page, size }) => {
    const result = await fetchClothesByFilter(
      searchParams.mode === "color"
        ? { color: searchParams.value, page, size }
        : { category: searchParams.value, page, size },
    );

    return {
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      items: result.clothes.map((item) => ({
        id: String(item.clothesId),
        clothesId: item.clothesId,
        imageUri: item.imageUrl,
        color: item.color,
        category: item.category,
        sectionName: item.sectionName,
        price: 0,
        colorLabel: toDisplayLabel(item.color),
        categoryLabel: toDisplayLabel(item.category),
      })),
    };
  },
  getClothesDetail: fetchClothesDetail,
  updateClothes: async (clothesId, payload) => {
    const closetId = await resolveClosetId();
    const nextSectionId =
      payload.sectionId === null
        ? null
        : typeof payload.sectionId === "number"
          ? payload.sectionId
          : await resolveApiSectionId({ closetId, uiSectionId: payload.sectionId });

    return updateClothesApi(clothesId, {
      ...payload,
      sectionId: nextSectionId,
    });
  },
  deleteClothes,
};
