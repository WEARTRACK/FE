import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type ProductLinkPreview = {
  sourceShop: "MUSINSA" | "ABLY" | "ZIGZAG" | "UNKNOWN";
  sourceUrl: string;
  productName: string;
  imageUrl: string;
  price: number | null;
  brandName: string | null;
  category: string | null;
  color: string | null;
  reasonCode: string | null;
};

type ProductLinkPreviewResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: ProductLinkPreview | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "상품 미리보기 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isProductLinkPreview(value: unknown): value is ProductLinkPreview {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.sourceShop === "string" &&
    typeof candidate.sourceUrl === "string" &&
    typeof candidate.productName === "string" &&
    typeof candidate.imageUrl === "string" &&
    (typeof candidate.price === "number" || candidate.price === null) &&
    (typeof candidate.brandName === "string" || candidate.brandName === null) &&
    (typeof candidate.category === "string" || candidate.category === null) &&
    (typeof candidate.color === "string" || candidate.color === null) &&
    (typeof candidate.reasonCode === "string" || candidate.reasonCode === null)
  );
}

function isProductLinkPreviewResponse(value: unknown): value is ProductLinkPreviewResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isProductLinkPreview(candidate.result))
  );
}

export async function fetchProductLinkPreview(url: string): Promise<ProductLinkPreview> {
  const { data, status } = await apiClient.post<ProductLinkPreviewResponse>(
    "/api/clothes/link-preview",
    { url },
    { timeout: 30000 },
  );

  if (!isProductLinkPreviewResponse(data)) {
    throw createInvalidResponseError(data);
  }

  if (!data.isSuccess) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status,
      details: data.result,
    });
  }

  if (!data.result) {
    throw createInvalidResponseError(data);
  }

  return data.result;
}
