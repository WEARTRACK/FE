import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  createInvalidResponseError,
  isApiEnvelope,
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

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readArrayFromPayload(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }

  const payload = readObject(value);
  if (!payload) {
    return null;
  }

  const directCandidates = [
    payload.clothes,
    payload.items,
    payload.content,
    payload.list,
    payload.clothesList,
    payload.storageItems,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const nestedCandidates = [
    payload.data,
    payload.result,
    payload.page,
    payload.section,
    payload.storageSection,
    payload.closetSection,
  ];
  for (const candidate of nestedCandidates) {
    const nested = readArrayFromPayload(candidate);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function fetchClosetSectionItems(params: {
  closetId: number;
  sectionId: number;
  uiSectionId: ClosetSectionId;
  page?: number;
  size?: number;
}): Promise<ClosetItem[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/api/closets/${params.closetId}/sections/${params.sectionId}/clothes`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 12,
      },
    },
  );

  const root = isApiEnvelope(response.data)
    ? (assertApiEnvelopeSuccess(response.data, response.status) ?? [])
    : response.data;

  const rawClothes = readArrayFromPayload(root);

  if (!rawClothes) {
    throw createInvalidResponseError("옷장 칸 조회 result 형식이 올바르지 않아요.", root);
  }

  return rawClothes.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const clothesId = readNumber(candidate.clothesId ?? candidate.id);
    const imageUrl = readString(
      candidate.imageUrl ??
        candidate.clothesImageUrl ??
        candidate.photoUrl ??
        candidate.image ??
        candidate.url,
    );
    const colorRaw = readString(candidate.color ?? candidate.colorName);
    const categoryRaw = readString(candidate.category ?? candidate.categoryName);

    if (clothesId === null || imageUrl === null || colorRaw === null || categoryRaw === null) {
      return [];
    }

    const color = mapServerColorToClosetColor(colorRaw);
    const category = mapServerCategoryToClosetCategory(categoryRaw);

    const resolvedImageUri = (() => {
      try {
        return resolveClosetImageUrl(imageUrl);
      } catch (error) {
        if (
          error instanceof ApiError &&
          (error.code === "INVALID_IMAGE_URL_DOMAIN" || error.code === "INVALID_IMAGE_URL")
        ) {
          if (!imageUrl.trim()) {
            return null;
          }
          return imageUrl;
        }
        throw error;
      }
    })();

    if (!resolvedImageUri) {
      return [];
    }

    return [
      {
        id: String(clothesId),
        sectionId: params.uiSectionId,
        imageUri: resolvedImageUri,
        price: 0,
        color,
        colorLabel: toDisplayLabel(color),
        category,
        categoryLabel: toDisplayLabel(category),
      },
    ];
  });
}
