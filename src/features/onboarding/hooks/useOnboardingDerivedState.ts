import { useMemo } from "react";

import { useOnboardingQuests } from "@/features/onboarding/hooks/useOnboardingQuests";
import { useOnboardingStatus } from "@/features/onboarding/hooks/useOnboardingStatus";
import { deriveOnboardingState } from "@/features/onboarding/utils/onboardingDerivedState";

export function useOnboardingDerivedState() {
  const statusQuery = useOnboardingStatus();
  const questsQuery = useOnboardingQuests();

  const derivedState = useMemo(
    () =>
      deriveOnboardingState({
        status: statusQuery.data,
        quests: questsQuery.data,
      }),
    [questsQuery.data, statusQuery.data],
  );

  return {
    ...derivedState,
    statusQuery,
    questsQuery,
  };
}
