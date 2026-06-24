import type {
  OnboardingQuestApi,
  OnboardingQuestsResultApi,
  OnboardingStatusResultApi,
} from "@/features/onboarding/api/onboardingApiTypes";
import {
  onboardingQuestMetadataByType,
  onboardingQuestOrder,
  type OnboardingQuestRouteMetadata,
} from "@/features/onboarding/constants/onboardingQuestMetadata";

export type OnboardingQuestWithMetadata = OnboardingQuestApi & OnboardingQuestRouteMetadata;

export type OnboardingDerivedState = {
  orderedQuests: OnboardingQuestWithMetadata[];
  completedQuests: OnboardingQuestWithMetadata[];
  latestCompletedQuest: OnboardingQuestWithMetadata | null;
  currentAvailableQuest: OnboardingQuestWithMetadata | null;
  nextLockedQuest: OnboardingQuestWithMetadata | null;
  firstQuestCompleted: boolean;
  hasNewQuestBadge: boolean;
  isWaitingForNextQuest: boolean;
  isOnboardingCompleted: boolean;
  canStartQuest: boolean;
  isStatusResolved: boolean;
  hasAmbiguousQuestAvailability: boolean;
};

function compareQuestOrder(left: OnboardingQuestApi, right: OnboardingQuestApi) {
  return (
    onboardingQuestMetadataByType[left.questType].order -
    onboardingQuestMetadataByType[right.questType].order
  );
}

export function getOrderedOnboardingQuests(
  questsResult: OnboardingQuestsResultApi | null | undefined,
): OnboardingQuestWithMetadata[] {
  if (!questsResult) {
    return [];
  }

  return [...questsResult.quests]
    .sort(compareQuestOrder)
    .map((quest) => ({
      ...onboardingQuestMetadataByType[quest.questType],
      ...quest,
      title: quest.title || onboardingQuestMetadataByType[quest.questType].fallbackTitle,
      description:
        quest.description || onboardingQuestMetadataByType[quest.questType].fallbackDescription,
    }));
}

export function getFirstQuestCompleted(
  questsResult: OnboardingQuestsResultApi | null | undefined,
): boolean {
  const orderedQuests = getOrderedOnboardingQuests(questsResult);
  const firstQuestType = onboardingQuestOrder[0];
  return orderedQuests.find((quest) => quest.questType === firstQuestType)?.completed ?? false;
}

export function deriveOnboardingState(params: {
  status: OnboardingStatusResultApi | null | undefined;
  quests: OnboardingQuestsResultApi | null | undefined;
}): OnboardingDerivedState {
  const orderedQuests = getOrderedOnboardingQuests(params.quests);
  const completedQuests = orderedQuests.filter((quest) => quest.completed);
  const latestCompletedQuest = completedQuests.at(-1) ?? null;
  const firstIncompleteQuest = orderedQuests.find((quest) => !quest.completed) ?? null;
  const isStatusResolved = params.status != null;
  const isOnboardingCompleted =
    params.status?.onboardingCompleted === true ||
    params.quests?.onboardingCompleted === true ||
    (orderedQuests.length > 0 && completedQuests.length === orderedQuests.length);
  const availableQuestCount = params.status?.availableQuestCount ?? null;
  const hasAmbiguousQuestAvailability = availableQuestCount != null && availableQuestCount > 1;
  const hasSingleAvailableQuest = availableQuestCount === 1;

  // The current API does not identify which quest is open, so we only infer the
  // active quest when exactly one quest is available in the expected sequential flow.
  const currentAvailableQuest =
    !isOnboardingCompleted && hasSingleAvailableQuest ? firstIncompleteQuest : null;
  const nextLockedQuest =
    currentAvailableQuest === null
      ? hasAmbiguousQuestAvailability || !isStatusResolved || isOnboardingCompleted
        ? null
        : firstIncompleteQuest
      : (orderedQuests.find(
          (quest) =>
            onboardingQuestMetadataByType[quest.questType].order >
            onboardingQuestMetadataByType[currentAvailableQuest.questType].order,
        ) ?? null);
  const firstQuestCompleted =
    getFirstQuestCompleted(params.quests) ||
    (params.quests == null &&
      ((params.status?.completedQuestCount ?? 0) > 0 || params.status?.onboardingCompleted === true));

  return {
    orderedQuests,
    completedQuests,
    latestCompletedQuest,
    currentAvailableQuest,
    nextLockedQuest,
    firstQuestCompleted,
    hasNewQuestBadge:
      params.status != null ? !params.status.hidden && params.status.hasNewQuest : false,
    isWaitingForNextQuest:
      isStatusResolved && !isOnboardingCompleted && availableQuestCount === 0,
    isOnboardingCompleted,
    canStartQuest: currentAvailableQuest !== null,
    isStatusResolved,
    hasAmbiguousQuestAvailability,
  };
}
