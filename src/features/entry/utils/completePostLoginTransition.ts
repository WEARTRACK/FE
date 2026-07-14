import type { QueryClient } from "@tanstack/react-query";
import type { Href } from "expo-router";

import type { SocialLoginResult } from "@/features/entry/api/socialLogin";
import {
  resolvePostLoginRoute,
  type PostLoginIntentSuccessHref,
} from "@/features/entry/utils/resolvePostLoginRoute";
import { resetAuthenticatedClientState } from "@/features/entry/utils/resetAuthenticatedClientState";
import { isValidClosetId } from "@/features/closet/utils/closet-id";
import { fetchOnboardingEntryResolution } from "@/features/onboarding/utils/fetchOnboardingEntryResolution";

type CompletePostLoginTransitionParams = {
  intentSuccessHref?: PostLoginIntentSuccessHref | null;
  queryClient: QueryClient;
  result: SocialLoginResult;
  setClosetId: (closetId: number | null) => void;
  setSession: (session: {
    memberId: number;
    nickname: string | null;
    requiredTermsAgreed: boolean;
    profileCompleted: boolean;
    accessToken: string;
    refreshToken: string;
  }) => void;
  showLoginFailureToast: () => void;
  showOnboardingFetchFailureToast: () => void;
  navigate: (href: Href) => void;
};

export async function completePostLoginTransition({
  intentSuccessHref,
  queryClient,
  result,
  setClosetId,
  setSession,
  showLoginFailureToast,
  showOnboardingFetchFailureToast,
  navigate,
}: CompletePostLoginTransitionParams) {
  const baseRouteResolution = resolvePostLoginRoute({
    intentSuccessHref,
    requiredTermsAgreed: result.requiredTermsAgreed,
    profileCompleted: result.profileCompleted,
  });

  if (!baseRouteResolution.isValid) {
    showLoginFailureToast();
    navigate("/auth");
    return false;
  }

  resetAuthenticatedClientState(queryClient);
  setSession(result);
  setClosetId(isValidClosetId(result.closetId) ? result.closetId : null);

  let nextHref = baseRouteResolution.route;

  if (baseRouteResolution.requiresOnboardingResolution) {
    const entryResolution = await fetchOnboardingEntryResolution(queryClient);

    if (entryResolution.shouldShowFetchFailureToast) {
      showOnboardingFetchFailureToast();
    }

    nextHref = entryResolution.route;
  }

  navigate(nextHref);
  return true;
}
