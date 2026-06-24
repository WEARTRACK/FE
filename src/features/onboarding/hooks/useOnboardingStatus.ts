import { useQuery } from "@tanstack/react-query";

import { getOnboardingStatus } from "@/features/onboarding/api/getOnboardingStatus";
import { onboardingQueryKeys } from "@/features/onboarding/hooks/onboardingQueryKeys";
import { useSessionStore } from "@/stores/useSessionStore";

export function useOnboardingStatus() {
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: onboardingQueryKeys.status(),
    queryFn: getOnboardingStatus,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
    refetchOnMount: true,
  });
}
