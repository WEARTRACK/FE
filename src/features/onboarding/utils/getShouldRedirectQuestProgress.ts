import type { OnboardingQuestType } from "@/features/onboarding/api/onboardingApiTypes";

export function getShouldRedirectQuestProgress(params: {
  questCompleted: boolean;
  targetQuestType: OnboardingQuestType;
  currentAvailableQuestType: OnboardingQuestType | null;
  isWaitingForNextQuest: boolean;
  hasAmbiguousQuestAvailability: boolean;
  isStatusResolved: boolean;
}) {
  if (params.questCompleted) {
    return false;
  }

  if (!params.isStatusResolved) {
    return false;
  }

  if (params.hasAmbiguousQuestAvailability || params.isWaitingForNextQuest) {
    return true;
  }

  return (
    params.currentAvailableQuestType !== null &&
    params.currentAvailableQuestType !== params.targetQuestType
  );
}
