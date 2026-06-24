import type { OnboardingQuestType } from "@/features/onboarding/api/onboardingApiTypes";
import { useOnboardingDerivedState } from "@/features/onboarding/hooks/useOnboardingDerivedState";
import { getShouldRedirectQuestProgress } from "@/features/onboarding/utils/getShouldRedirectQuestProgress";

export function useOnboardingQuestProgress(questType: OnboardingQuestType) {
  const onboardingState = useOnboardingDerivedState();
  const quest =
    onboardingState.orderedQuests.find((item) => item.questType === questType) ?? null;
  const shouldRedirectToQuestEntry = getShouldRedirectQuestProgress({
    questCompleted: quest?.completed ?? false,
    targetQuestType: questType,
    currentAvailableQuestType: onboardingState.currentAvailableQuest?.questType ?? null,
    isWaitingForNextQuest: onboardingState.isWaitingForNextQuest,
    hasAmbiguousQuestAvailability: onboardingState.hasAmbiguousQuestAvailability,
    isStatusResolved: onboardingState.isStatusResolved,
  });

  return {
    ...onboardingState,
    quest,
    shouldRedirectToQuestEntry,
  };
}
