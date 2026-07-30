import { ApiError } from "@/lib/api/errors";

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T | null;
};

export const ONBOARDING_QUEST_TYPES = [
  "REGISTER_CLOSET",
  "REGISTER_TOP",
  "REGISTER_BOTTOM",
] as const;

export type OnboardingQuestType = (typeof ONBOARDING_QUEST_TYPES)[number];

export type OnboardingStatusResultApi = {
  onboardingCompleted: boolean;
  hidden: boolean;
  totalQuestCount: number;
  completedQuestCount: number;
  hasNewQuest: boolean;
  availableQuestCount: number;
  nextQuestOpenAt: string | null;
};

export type OnboardingQuestApi = {
  questType: OnboardingQuestType;
  title: string;
  description: string;
  requiredCount: number;
  currentCount: number;
  completed: boolean;
};

export type OnboardingQuestsResultApi = {
  onboardingCompleted: boolean;
  totalQuestCount: number;
  completedQuestCount: number;
  quests: OnboardingQuestApi[];
};

function createInvalidOnboardingResponseError(message: string, details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message,
    status: null,
    details,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isOnboardingQuestType(value: unknown): value is OnboardingQuestType {
  return typeof value === "string" && ONBOARDING_QUEST_TYPES.includes(value as OnboardingQuestType);
}

function isNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function getSuccessfulResult<T>(value: unknown, responseStatus: number): T | null | undefined {
  if (!isRecord(value)) {
    throw createInvalidOnboardingResponseError("온보딩 응답 형식이 올바르지 않아요.", value);
  }

  if (
    typeof value.isSuccess !== "boolean" ||
    typeof value.code !== "string" ||
    typeof value.message !== "string"
  ) {
    throw createInvalidOnboardingResponseError("온보딩 응답 형식이 올바르지 않아요.", value);
  }

  if (!value.isSuccess) {
    throw new ApiError({
      code: value.code,
      message: value.message,
      status: responseStatus,
      details: value.result,
    });
  }

  return value.result as T | null | undefined;
}

export function parseOnboardingStatusResponse(
  value: unknown,
  responseStatus: number,
): OnboardingStatusResultApi {
  const result = getSuccessfulResult<OnboardingStatusResultApi>(value, responseStatus);

  if (!isRecord(result)) {
    throw createInvalidOnboardingResponseError("온보딩 상태 응답 형식이 올바르지 않아요.", value);
  }

  if (
    typeof result.onboardingCompleted !== "boolean" ||
    typeof result.hidden !== "boolean" ||
    !isNonNegativeNumber(result.totalQuestCount) ||
    !isNonNegativeNumber(result.completedQuestCount) ||
    typeof result.hasNewQuest !== "boolean" ||
    !isNonNegativeNumber(result.availableQuestCount) ||
    (result.nextQuestOpenAt !== null && typeof result.nextQuestOpenAt !== "string")
  ) {
    throw createInvalidOnboardingResponseError("온보딩 상태 응답 형식이 올바르지 않아요.", value);
  }

  return {
    onboardingCompleted: result.onboardingCompleted,
    hidden: result.hidden,
    totalQuestCount: result.totalQuestCount,
    completedQuestCount: result.completedQuestCount,
    hasNewQuest: result.hasNewQuest,
    availableQuestCount: result.availableQuestCount,
    nextQuestOpenAt: result.nextQuestOpenAt,
  };
}

function parseOnboardingQuest(value: unknown): OnboardingQuestApi {
  if (!isRecord(value)) {
    throw createInvalidOnboardingResponseError("온보딩 퀘스트 응답 형식이 올바르지 않아요.", value);
  }

  if (
    !isOnboardingQuestType(value.questType) ||
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    !isNonNegativeNumber(value.requiredCount) ||
    !isNonNegativeNumber(value.currentCount) ||
    typeof value.completed !== "boolean"
  ) {
    throw createInvalidOnboardingResponseError("온보딩 퀘스트 응답 형식이 올바르지 않아요.", value);
  }

  return {
    questType: value.questType,
    title: value.title,
    description: value.description,
    requiredCount: Number(value.requiredCount),
    currentCount: Number(value.currentCount),
    completed: value.completed,
  };
}

export function parseOnboardingQuestsResponse(
  value: unknown,
  responseStatus: number,
): OnboardingQuestsResultApi {
  const result = getSuccessfulResult<OnboardingQuestsResultApi>(value, responseStatus);

  if (
    !isRecord(result) ||
    typeof result.onboardingCompleted !== "boolean" ||
    !isNonNegativeNumber(result.totalQuestCount) ||
    !isNonNegativeNumber(result.completedQuestCount) ||
    !Array.isArray(result.quests)
  ) {
    throw createInvalidOnboardingResponseError("온보딩 퀘스트 응답 형식이 올바르지 않아요.", value);
  }

  return {
    onboardingCompleted: result.onboardingCompleted,
    totalQuestCount: result.totalQuestCount,
    completedQuestCount: result.completedQuestCount,
    quests: result.quests.map(parseOnboardingQuest),
  };
}
