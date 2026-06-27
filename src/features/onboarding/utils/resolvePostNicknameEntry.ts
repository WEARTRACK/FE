import type { Href } from "expo-router";

import type {
  OnboardingQuestsResultApi,
  OnboardingStatusResultApi,
} from "@/features/onboarding/api/onboardingApiTypes";
import { getOnboardingEntryRoute } from "@/features/onboarding/utils/getOnboardingEntryRoute";
import { deriveOnboardingState } from "@/features/onboarding/utils/onboardingDerivedState";

export type PostNicknameEntryResolution = {
  route: Href;
  shouldShowFetchFailureToast: boolean;
};

export function resolvePostNicknameEntry(params: {
  status: OnboardingStatusResultApi | null;
  quests: OnboardingQuestsResultApi | null;
}): PostNicknameEntryResolution {
  if (!params.status && !params.quests) {
    return {
      route: "/quest",
      shouldShowFetchFailureToast: true,
    };
  }

  const onboardingState = deriveOnboardingState(params);

  return {
    route: getOnboardingEntryRoute(onboardingState),
    shouldShowFetchFailureToast: false,
  };
}
