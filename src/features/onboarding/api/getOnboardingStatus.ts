import { apiClient } from "@/lib/api/client";

import {
  type ApiEnvelope,
  type OnboardingStatusResultApi,
  parseOnboardingStatusResponse,
} from "./onboardingApiTypes";

export async function getOnboardingStatus(): Promise<OnboardingStatusResultApi> {
  const response =
    await apiClient.get<ApiEnvelope<OnboardingStatusResultApi>>("/api/onboarding/status");

  return parseOnboardingStatusResponse(response.data, response.status);
}
