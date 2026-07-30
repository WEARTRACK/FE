import { QueryClient } from "@tanstack/react-query";

import { onboardingQueryKeys } from "@/features/onboarding/hooks/onboardingQueryKeys";

export async function invalidateRegistrationQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
    queryClient.invalidateQueries({ queryKey: ["closet"] }),
    queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.status() }),
    queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.quests() }),
  ]);
}
