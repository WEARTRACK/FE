import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type WeeklyFashionReportCategory = {
  category: string;
  expenseAmount: number;
};

export type WeeklyFashionReport = {
  weekStartDate: string;
  weekEndDate: string;
  totalExpenseAmount: number;
  expenseChangeRate: number | null;
  categories: WeeklyFashionReportCategory[];
};

type WeeklyFashionReportApiResult = Omit<WeeklyFashionReport, "categories"> & {
  categories: {
    category: string;
    expenseAmount: number | string;
  }[];
};

export type WeeklyCategoryClothesItem = {
  clothesId: number;
  imageUrl: string;
  productName: string | null;
  sourceShopName: string | null;
  price: number | null;
  color: string | null;
};

export type WeeklyCategoryClothes = {
  weekStartDate: string;
  weekEndDate: string;
  category: string;
  clothes: WeeklyCategoryClothesItem[];
};

type WeeklyCategoryClothesApiItem = {
  clothesId: number;
  imageUrl: string;
  productName?: string | null;
  sourceShopName?: string | null;
  price?: number | null;
  color?: string | null;
};

type WeeklyCategoryClothesApiResult = Omit<WeeklyCategoryClothes, "clothes"> & {
  clothes: WeeklyCategoryClothesApiItem[];
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;
};

type PaginationQuery = {
  page?: number;
  size?: number;
};

type WeeklyReportQuery = PaginationQuery & {
  weekStartDate: string;
};

type WeeklyCategoryClothesQuery = WeeklyReportQuery & {
  category: string;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "패션 소비 리포트 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null | undefined {
  return value === undefined || value === null || isFiniteNumber(value);
}

function isNumeric(value: unknown) {
  return (
    isFiniteNumber(value) ||
    (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
  );
}

function isWeeklyReportCategory(
  value: unknown,
): value is WeeklyFashionReportApiResult["categories"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.category === "string" && isNumeric(candidate.expenseAmount);
}

function isWeeklyReport(value: unknown): value is WeeklyFashionReportApiResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.weekStartDate === "string" &&
    typeof candidate.weekEndDate === "string" &&
    isFiniteNumber(candidate.totalExpenseAmount) &&
    (candidate.expenseChangeRate === null || isFiniteNumber(candidate.expenseChangeRate)) &&
    Array.isArray(candidate.categories) &&
    candidate.categories.every(isWeeklyReportCategory)
  );
}

function isWeeklyCategoryClothesItem(value: unknown): value is WeeklyCategoryClothesApiItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isFiniteNumber(candidate.clothesId) &&
    typeof candidate.imageUrl === "string" &&
    isNullableString(candidate.productName) &&
    isNullableString(candidate.sourceShopName) &&
    isNullableNumber(candidate.price) &&
    isNullableString(candidate.color)
  );
}

function isWeeklyCategoryClothes(value: unknown): value is WeeklyCategoryClothesApiResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.weekStartDate === "string" &&
    typeof candidate.weekEndDate === "string" &&
    typeof candidate.category === "string" &&
    Array.isArray(candidate.clothes) &&
    candidate.clothes.every(isWeeklyCategoryClothesItem)
  );
}

function isApiResponse<T>(value: unknown, isResult: (result: unknown) => result is T) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isResult(candidate.result))
  );
}

function getSuccessfulResult<T>(response: unknown, isResult: (result: unknown) => result is T): T {
  if (!isApiResponse(response, isResult)) {
    throw createInvalidResponseError(response);
  }

  const typedResponse = response as ApiResponse<T>;

  if (!typedResponse.isSuccess) {
    throw new ApiError({
      code: typedResponse.code,
      message: typedResponse.message,
      status: 200,
      details: typedResponse.result,
    });
  }

  if (!typedResponse.result) {
    throw createInvalidResponseError(response);
  }

  return typedResponse.result;
}

export async function getWeeklyFashionReport({
  weekStartDate,
  page = 0,
  size = 13,
}: WeeklyReportQuery): Promise<WeeklyFashionReport> {
  const response = await apiClient.get<ApiResponse<WeeklyFashionReport>>(
    `/api/fashion-consumption/reports/weekly/${encodeURIComponent(weekStartDate)}`,
    { params: { page, size } },
  );

  const result = getSuccessfulResult(response.data, isWeeklyReport);

  return {
    ...result,
    categories: result.categories.map((item) => ({
      category: item.category,
      expenseAmount: Number(item.expenseAmount),
    })),
  };
}

export async function getWeeklyCategoryClothes({
  weekStartDate,
  category,
  page = 0,
  size = 10,
}: WeeklyCategoryClothesQuery): Promise<WeeklyCategoryClothes> {
  const response = await apiClient.get<ApiResponse<WeeklyCategoryClothes>>(
    `/api/fashion-consumption/reports/weekly/${encodeURIComponent(
      weekStartDate,
    )}/categories/${encodeURIComponent(category)}/clothes`,
    { params: { page, size } },
  );

  const result = getSuccessfulResult(response.data, isWeeklyCategoryClothes);

  return {
    ...result,
    clothes: result.clothes.map((item) => ({
      clothesId: item.clothesId,
      imageUrl: item.imageUrl,
      productName: item.productName ?? null,
      sourceShopName: item.sourceShopName ?? null,
      price: item.price ?? null,
      color: item.color ?? null,
    })),
  };
}
