import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type MonthlyExpense = {
  yearMonth: string;
  expenseAmount: number;
};

export type MonthlyTopCategory = {
  category: string;
  percentage: number;
};

export type MonthlyFashionReport = {
  yearMonth: string;
  monthStartDate: string;
  monthEndDate: string;
  totalExpenseAmount: number;
  expenseChangeRate: number | null;
  monthlyExpenses: MonthlyExpense[];
  topCategories: MonthlyTopCategory[];
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;
};

type MonthlyFashionReportQuery = {
  yearMonth?: string;
  page?: number;
  size?: number;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "월간 패션 소비 리포트 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMonthlyExpense(value: unknown): value is MonthlyExpense {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.yearMonth === "string" && isFiniteNumber(candidate.expenseAmount);
}

function isMonthlyTopCategory(value: unknown): value is MonthlyTopCategory {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.category === "string" && isFiniteNumber(candidate.percentage);
}

function isMonthlyFashionReport(value: unknown): value is MonthlyFashionReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.yearMonth === "string" &&
    typeof candidate.monthStartDate === "string" &&
    typeof candidate.monthEndDate === "string" &&
    isFiniteNumber(candidate.totalExpenseAmount) &&
    (candidate.expenseChangeRate === null || isFiniteNumber(candidate.expenseChangeRate)) &&
    Array.isArray(candidate.monthlyExpenses) &&
    candidate.monthlyExpenses.every(isMonthlyExpense) &&
    Array.isArray(candidate.topCategories) &&
    candidate.topCategories.every(isMonthlyTopCategory)
  );
}

function isApiResponse(value: unknown): value is ApiResponse<MonthlyFashionReport> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isMonthlyFashionReport(candidate.result))
  );
}

export async function getMonthlyFashionReport({
  yearMonth,
  page = 0,
  size = 10,
}: MonthlyFashionReportQuery = {}): Promise<MonthlyFashionReport> {
  const endpoint = yearMonth
    ? `/api/fashion-consumption/reports/monthly/${encodeURIComponent(yearMonth)}`
    : "/api/fashion-consumption/reports/monthly/current";
  const response = await apiClient.get<ApiResponse<MonthlyFashionReport>>(endpoint, {
    params: { page, size },
  });

  if (!isApiResponse(response.data)) {
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

  return response.data.result;
}
