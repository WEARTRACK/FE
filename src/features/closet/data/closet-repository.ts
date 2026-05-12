import { deleteClothes } from "@/features/closet/api/clothes-delete-api";
import { fetchClothesDetail } from "@/features/closet/api/clothes-detail-api";
import { fetchClothesByFilter } from "@/features/closet/api/clothes-filter-api";
import { mapClosetSectionIdToApiSectionId, mapServerCategoryToClosetCategory } from "@/features/closet/api/closet-api-mappers";
import { fetchClosetSectionItems } from "@/features/closet/api/closet-section-api";
import { fetchClosetStatistics } from "@/features/closet/api/closet-statistics-api";
import { fetchClosetSummary } from "@/features/closet/api/closet-summary-api";
import { updateClothes as updateClothesApi } from "@/features/closet/api/clothes-update-api";
import type { ClosetDeleteResultApi, ClosetDetailResult, ClosetUpdateRequestBody } from "@/features/closet/api/closet-api-types";
import { MOCK_CLOSET_ITEMS } from "@/features/closet/mock/closet-items";
import { MOCK_CLOSET_TEMPLATE } from "@/features/closet/mock/closet-template";
import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSectionId, ClosetTemplate } from "@/features/closet/types/closet-layout";
import type { ClosetSearchPage, ClosetSearchParams } from "@/features/closet/types/closet-search";
import { filterClosetItemsBySearchParams } from "@/features/closet/utils/closet-search";
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

function toSearchPageFromMock(
  allItems: ClosetItem[],
  params: { searchParams: ClosetSearchParams; page: number; size: number },
): ClosetSearchPage {
  const filteredItems = filterClosetItemsBySearchParams(allItems, params.searchParams);
  const startIndex = params.page * params.size;
  const endIndex = startIndex + params.size;
  const pageItems = filteredItems.slice(startIndex, endIndex);
  const totalCount = filteredItems.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / params.size);

  return {
    totalCount,
    currentPage: totalPages === 0 ? 0 : Math.min(params.page, totalPages - 1),
    totalPages,
    hasNext: params.page + 1 < totalPages,
    items: pageItems.map((item) => ({
      id: item.id,
      clothesId: Number(item.id),
      imageUri: item.imageUri,
      color: item.color,
      category: item.category,
      sectionName:
        MOCK_CLOSET_TEMPLATE.sections.find((section) => section.id === item.sectionId)?.sectionName ??
        "알 수 없는 보관 칸",
      price: item.price,
      colorLabel: item.colorLabel,
      categoryLabel: item.categoryLabel,
    })),
  };
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

export const mockClosetRepository: ClosetDataRepository = {
  getTemplate: async () => structuredClone(MOCK_CLOSET_TEMPLATE),
  getAllItems: async () => structuredClone(MOCK_CLOSET_ITEMS),
  getItemsBySectionId: async (sectionId) =>
    structuredClone(MOCK_CLOSET_ITEMS.filter((item) => item.sectionId === sectionId)),
  getItemById: async (sectionId, itemId) => {
    const item = MOCK_CLOSET_ITEMS.find((target) => target.sectionId === sectionId && target.id === itemId);
    return item ? structuredClone(item) : null;
  },
  searchClothes: async ({ searchParams, page, size }) =>
    toSearchPageFromMock(structuredClone(MOCK_CLOSET_ITEMS), { searchParams, page, size }),
  getClothesDetail: async (clothesId) => {
    const item = MOCK_CLOSET_ITEMS.find((target) => Number(target.id) === clothesId);

    if (!item) {
      throw new Error("Item not found");
    }

    return {
      clothesId,
      imageUrl: item.imageUri,
      color: item.color,
      category: item.category,
      price: item.price,
      sectionId: item.sectionId,
      sectionName:
        MOCK_CLOSET_TEMPLATE.sections.find((section) => section.id === item.sectionId)?.sectionName ??
        "알 수 없는 보관 칸",
    };
  },
  updateClothes: async (clothesId, payload) => {
    const item = MOCK_CLOSET_ITEMS.find((target) => Number(target.id) === clothesId);

    if (!item) {
      throw new Error("Item not found");
    }

    const nextColor = payload.color ?? item.color;
    const nextCategory = payload.category ?? item.category;
    const nextSectionId = payload.sectionId ?? item.sectionId;

    return {
      clothesId,
      imageUrl: item.imageUri,
      color: nextColor,
      category: nextCategory,
      price: payload.price ?? item.price,
      sectionId: nextSectionId,
      sectionName:
        MOCK_CLOSET_TEMPLATE.sections.find((section) => section.id === nextSectionId)?.sectionName ??
        "알 수 없는 보관 칸",
    };
  },
  deleteClothes: async () => null,
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
    fetchClosetSectionItems({
      closetId: await resolveClosetId(),
      sectionId: mapClosetSectionIdToApiSectionId(sectionId),
      uiSectionId: sectionId,
      page: 0,
      size: 12,
    }),
  getItemById: async (sectionId, itemId) => {
    const items = await fetchClosetSectionItems({
      closetId: await resolveClosetId(),
      sectionId: mapClosetSectionIdToApiSectionId(sectionId),
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
  updateClothes: updateClothesApi,
  deleteClothes,
};
