import { useQuery } from "@tanstack/react-query";

import { getOnboardingQuests } from "@/features/onboarding/api/getOnboardingQuests";
import { onboardingQueryKeys } from "@/features/onboarding/hooks/onboardingQueryKeys";
import { useSessionStore } from "@/stores/useSessionStore";

export function useOnboardingQuests() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: onboardingQueryKeys.quests(),
    queryFn: getOnboardingQuests,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
    refetchOnMount: true,
  });
}
