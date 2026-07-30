import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type WeeklyFashionConsumptionCategory = {
  category: string;
  expenseAmount: number;
};

export type CurrentWeeklyFashionConsumption = {
  weekStartDate: string;
  weekEndDate: string;
  totalExpenseAmount: number;
  expenseChangeRate: number | null;
  categories: WeeklyFashionConsumptionCategory[];
};

export type CurrentWeeklyFashionConsumptionQuery = {
  page?: number;
  size?: number;
};

type CurrentWeeklyFashionConsumptionResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result:
    | (Omit<CurrentWeeklyFashionConsumption, "categories"> & {
        categories: {
          category: string;
          expenseAmount: number | string;
        }[];
      })
    | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "주간 패션 지출 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isWeeklyFashionConsumptionCategory(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const expenseAmount = candidate.expenseAmount;

  return (
    typeof candidate.category === "string" &&
    ((typeof expenseAmount === "number" && Number.isFinite(expenseAmount)) ||
      (typeof expenseAmount === "string" &&
        expenseAmount.trim() !== "" &&
        Number.isFinite(Number(expenseAmount))))
  );
}

function isCurrentWeeklyFashionConsumption(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.weekStartDate === "string" &&
    typeof candidate.weekEndDate === "string" &&
    typeof candidate.totalExpenseAmount === "number" &&
    (candidate.expenseChangeRate === null ||
      (typeof candidate.expenseChangeRate === "number" &&
        Number.isFinite(candidate.expenseChangeRate))) &&
    Array.isArray(candidate.categories) &&
    candidate.categories.every(isWeeklyFashionConsumptionCategory)
  );
}

function isCurrentWeeklyFashionConsumptionResponse(
  value: unknown,
): value is CurrentWeeklyFashionConsumptionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isCurrentWeeklyFashionConsumption(candidate.result))
  );
}

export async function getCurrentWeeklyFashionConsumption(
  query: CurrentWeeklyFashionConsumptionQuery = {},
): Promise<CurrentWeeklyFashionConsumption> {
  const response = await apiClient.get<CurrentWeeklyFashionConsumptionResponse>(
    "/api/fashion-consumption/reports/weekly/current",
    {
      params: {
        page: query.page ?? 0,
        size: query.size ?? 10,
      },
    },
  );

  if (!isCurrentWeeklyFashionConsumptionResponse(response.data)) {
    throw createInvalidResponseError(response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: 200,
      details: response.data.result,
    });
  }

  if (!response.data.result) {
    throw createInvalidResponseError(response.data);
  }

  return {
    ...response.data.result,
    categories: response.data.result.categories.map((category) => ({
      category: category.category,
      expenseAmount: Number(category.expenseAmount),
    })),
  };
}
