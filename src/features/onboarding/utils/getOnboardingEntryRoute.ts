import type { Href } from "expo-router";

import type { OnboardingDerivedState } from "@/features/onboarding/utils/onboardingDerivedState";

const HOME_ROUTE = "/home" as Href;
const QUEST_ROUTE = "/quest" as Href;

export function getOnboardingEntryRoute(
  state: Pick<OnboardingDerivedState, "firstQuestCompleted" | "isOnboardingCompleted">,
): Href {
  if (state.isOnboardingCompleted || state.firstQuestCompleted) {
    return HOME_ROUTE;
  }

  return QUEST_ROUTE;
}
