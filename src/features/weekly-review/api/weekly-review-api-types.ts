import { ApiError } from "@/lib/api/errors";

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T | null;
};

export type DailyReviewClothesApi = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: string;
  selected: boolean;
};

export type DailyReviewCategoryApi = {
  category: string;
  selectedCount: number;
  clothes: DailyReviewClothesApi[];
};

export type DailyReviewTodayResultApi = {
  reviewDate: string;
  weekStartDate: string;
  weekEndDate: string;
  completed: boolean;
  previousDayIncomplete: boolean;
  noRegisteredClothes: boolean;
  categories: DailyReviewCategoryApi[];
};

export type SaveDailyReviewTodayRequestBody = {
  clothesIds: number[];
};

export type WeeklyReviewClothesApi = {
  clothesId: number;
  imageUrl: string;
  color: string;
};

export type WeeklyReviewCategoryApi = {
  category: string;
  wornCount: number;
  clothes: WeeklyReviewClothesApi[];
};

export type WeeklyReviewResultApi = {
  weekStartDate: string;
  weekEndDate: string;
  wornClothesCount: number;
  totalClothesCount?: number;
  weeklyClosetUsageRate: number;
  weeklyInsight: string;
  categories: WeeklyReviewCategoryApi[];
};

function createInvalidResponseError(message: string, details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message,
    status: null,
    details,
  });
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

export function unwrapApiEnvelope<T>(
  envelope: ApiEnvelope<T>,
  responseStatus: number,
  invalidResultMessage: string,
): T {
  if (!envelope.isSuccess) {
    throw new ApiError({
      code: envelope.code,
      message: envelope.message,
      status: responseStatus,
      details: envelope.result,
    });
  }

  if (envelope.result === null || envelope.result === undefined) {
    throw createInvalidResponseError(invalidResultMessage, envelope);
  }

  return envelope.result;
}

export function assertApiEnvelope<T>(
  value: unknown,
  invalidEnvelopeMessage: string,
): ApiEnvelope<T> {
  if (!isApiEnvelope(value)) {
    throw createInvalidResponseError(invalidEnvelopeMessage, value);
  }

  return value as ApiEnvelope<T>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isDailyReviewClothesApi(value: unknown): value is DailyReviewClothesApi {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.clothesId === "number" &&
    typeof value.imageUrl === "string" &&
    typeof value.color === "string" &&
    typeof value.category === "string" &&
    typeof value.selected === "boolean"
  );
}

function isDailyReviewCategoryApi(value: unknown): value is DailyReviewCategoryApi {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.category === "string" &&
    typeof value.selectedCount === "number" &&
    Array.isArray(value.clothes) &&
    value.clothes.every(isDailyReviewClothesApi)
  );
}

export function isDailyReviewTodayResultApi(value: unknown): value is DailyReviewTodayResultApi {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.reviewDate === "string" &&
    typeof value.weekStartDate === "string" &&
    typeof value.weekEndDate === "string" &&
    typeof value.completed === "boolean" &&
    typeof value.previousDayIncomplete === "boolean" &&
    typeof value.noRegisteredClothes === "boolean" &&
    Array.isArray(value.categories) &&
    value.categories.every(isDailyReviewCategoryApi)
  );
}

function isWeeklyReviewClothesApi(value: unknown): value is WeeklyReviewClothesApi {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.clothesId === "number" &&
    typeof value.imageUrl === "string" &&
    typeof value.color === "string"
  );
}

function isWeeklyReviewCategoryApi(value: unknown): value is WeeklyReviewCategoryApi {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.category === "string" &&
    typeof value.wornCount === "number" &&
    Array.isArray(value.clothes) &&
    value.clothes.every(isWeeklyReviewClothesApi)
  );
}

export function isWeeklyReviewResultApi(value: unknown): value is WeeklyReviewResultApi {
  if (!isRecord(value)) {
    return false;
  }

  const totalClothesCountIsValid =
    value.totalClothesCount === undefined || typeof value.totalClothesCount === "number";

  return (
    typeof value.weekStartDate === "string" &&
    typeof value.weekEndDate === "string" &&
    typeof value.wornClothesCount === "number" &&
    totalClothesCountIsValid &&
    typeof value.weeklyClosetUsageRate === "number" &&
    typeof value.weeklyInsight === "string" &&
    Array.isArray(value.categories) &&
    value.categories.every(isWeeklyReviewCategoryApi)
  );
}

export function assertDailyReviewTodayResultApi(
  value: unknown,
  invalidResultMessage: string,
): DailyReviewTodayResultApi {
  if (!isDailyReviewTodayResultApi(value)) {
    throw createInvalidResponseError(invalidResultMessage, value);
  }

  return value;
}

export function assertWeeklyReviewResultApi(
  value: unknown,
  invalidResultMessage: string,
): WeeklyReviewResultApi {
  if (!isWeeklyReviewResultApi(value)) {
    throw createInvalidResponseError(invalidResultMessage, value);
  }

  return value;
}
