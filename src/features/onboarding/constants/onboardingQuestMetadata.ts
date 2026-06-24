import type { Href } from "expo-router";

import type { OnboardingQuestType } from "@/features/onboarding/api/onboardingApiTypes";

export type OnboardingQuestRouteMetadata = {
  questType: OnboardingQuestType;
  order: number;
  templateRoute: Href;
  progressRoute: Href;
  completeRoute: Href;
  fallbackTitle: string;
  fallbackDescription: string;
};

export const onboardingQuestMetadataByType: Record<
  OnboardingQuestType,
  OnboardingQuestRouteMetadata
> = {
  REGISTER_CLOSET: {
    questType: "REGISTER_CLOSET",
    order: 1,
    templateRoute: "/quest/first",
    progressRoute: "/quest/first/progress",
    completeRoute: "/quest/first/complete",
    fallbackTitle: "첫 번째 퀘스트",
    fallbackDescription: "옷장 등록하기",
  },
  REGISTER_TOP: {
    questType: "REGISTER_TOP",
    order: 2,
    templateRoute: "/quest/second",
    progressRoute: "/quest/second/progress",
    completeRoute: "/quest/second/complete",
    fallbackTitle: "두 번째 퀘스트",
    fallbackDescription: "상의 5벌 등록하기",
  },
  REGISTER_BOTTOM: {
    questType: "REGISTER_BOTTOM",
    order: 3,
    templateRoute: "/quest/third",
    progressRoute: "/quest/third/progress",
    completeRoute: "/quest/third/complete",
    fallbackTitle: "세 번째 퀘스트",
    fallbackDescription: "하의 2벌 등록하기",
  },
};

export const onboardingQuestOrder = Object.values(onboardingQuestMetadataByType)
  .sort((left, right) => left.order - right.order)
  .map((metadata) => metadata.questType);
