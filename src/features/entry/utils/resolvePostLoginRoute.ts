import type { Href } from "expo-router";

const AUTH_ROUTE = "/auth" as Href;
const SIGN_UP_SUCCESS_INTENT_ROUTE = "/auth/sign-up-success" as const;
const SIGN_UP_SUCCESS_ROUTE = SIGN_UP_SUCCESS_INTENT_ROUTE as Href;
const TERMS_AGREEMENT_ROUTE = "/auth/terms-agreement" as Href;
const SET_NICKNAME_ROUTE = "/auth/set-nickname" as Href;
const HOME_ROUTE = "/home" as Href;

export type PostLoginIntentSuccessHref = typeof SIGN_UP_SUCCESS_INTENT_ROUTE;

export type PostLoginRouteResolution =
  | {
      isValid: false;
      route: Href;
      requiresOnboardingResolution: false;
    }
  | {
      isValid: true;
      route: Href;
      requiresOnboardingResolution: boolean;
    };

type ResolvePostLoginRouteParams = {
  intentSuccessHref?: PostLoginIntentSuccessHref | null;
  requiredTermsAgreed: unknown;
  profileCompleted: unknown;
};

export function resolvePostLoginRoute({
  intentSuccessHref,
  requiredTermsAgreed,
  profileCompleted,
}: ResolvePostLoginRouteParams): PostLoginRouteResolution {
  if (typeof requiredTermsAgreed !== "boolean" || typeof profileCompleted !== "boolean") {
    return {
      isValid: false,
      route: AUTH_ROUTE,
      requiresOnboardingResolution: false,
    };
  }

  if (intentSuccessHref === SIGN_UP_SUCCESS_INTENT_ROUTE && !requiredTermsAgreed) {
    return {
      isValid: true,
      route: SIGN_UP_SUCCESS_ROUTE,
      requiresOnboardingResolution: false,
    };
  }

  if (!requiredTermsAgreed) {
    return {
      isValid: true,
      route: TERMS_AGREEMENT_ROUTE,
      requiresOnboardingResolution: false,
    };
  }

  if (!profileCompleted) {
    return {
      isValid: true,
      route: SET_NICKNAME_ROUTE,
      requiresOnboardingResolution: false,
    };
  }

  return {
    isValid: true,
    route: HOME_ROUTE,
    requiresOnboardingResolution: true,
  };
}
