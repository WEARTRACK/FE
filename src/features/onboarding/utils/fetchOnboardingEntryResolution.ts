import type { QueryClient } from "@tanstack/react-query";

import { getOnboardingQuests } from "@/features/onboarding/api/getOnboardingQuests";
import { getOnboardingStatus } from "@/features/onboarding/api/getOnboardingStatus";
import { onboardingQueryKeys } from "@/features/onboarding/hooks/onboardingQueryKeys";
import { resolvePostNicknameEntry } from "@/features/onboarding/utils/resolvePostNicknameEntry";

export async function fetchOnboardingEntryResolution(queryClient: QueryClient) {
  const [statusResult, questsResult] = await Promise.allSettled([
    queryClient.fetchQuery({
      queryKey: onboardingQueryKeys.status(),
      queryFn: getOnboardingStatus,
    }),
    queryClient.fetchQuery({
      queryKey: onboardingQueryKeys.quests(),
      queryFn: getOnboardingQuests,
    }),
  ]);

  return resolvePostNicknameEntry({
    status: statusResult.status === "fulfilled" ? statusResult.value : null,
    quests: questsResult.status === "fulfilled" ? questsResult.value : null,
  });
}
