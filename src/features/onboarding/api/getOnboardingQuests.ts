import { apiClient } from "@/lib/api/client";

import {
  type ApiEnvelope,
  type OnboardingQuestsResultApi,
  parseOnboardingQuestsResponse,
} from "./onboardingApiTypes";

export async function getOnboardingQuests(): Promise<OnboardingQuestsResultApi> {
  const response =
    await apiClient.get<ApiEnvelope<OnboardingQuestsResultApi>>("/api/onboarding/quests");

  return parseOnboardingQuestsResponse(response.data, response.status);
}
