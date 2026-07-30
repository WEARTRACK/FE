import { describe, expect, it } from "vitest";

import { resolvePostLoginRoute } from "./resolvePostLoginRoute";

describe("resolvePostLoginRoute", () => {
  it("shows sign-up success before terms for a sign-up intent even if the profile is complete", () => {
    expect(
      resolvePostLoginRoute({
        intentSuccessHref: "/auth/sign-up-success",
        requiredTermsAgreed: false,
        profileCompleted: true,
      }),
    ).toEqual({
      isValid: true,
      route: "/auth/sign-up-success",
      requiresOnboardingResolution: false,
    });
  });

  it("sends a login intent with missing terms directly to terms agreement", () => {
    expect(
      resolvePostLoginRoute({
        requiredTermsAgreed: false,
        profileCompleted: false,
      }),
    ).toEqual({
      isValid: true,
      route: "/auth/terms-agreement",
      requiresOnboardingResolution: false,
    });
  });

  it("continues to nickname setup after terms are agreed", () => {
    expect(
      resolvePostLoginRoute({
        requiredTermsAgreed: true,
        profileCompleted: false,
      }),
    ).toEqual({
      isValid: true,
      route: "/auth/set-nickname",
      requiresOnboardingResolution: false,
    });
  });

  it("resolves onboarding before home for a completed profile", () => {
    expect(
      resolvePostLoginRoute({
        requiredTermsAgreed: true,
        profileCompleted: true,
      }),
    ).toEqual({
      isValid: true,
      route: "/home",
      requiresOnboardingResolution: true,
    });
  });

  it("rejects invalid server state", () => {
    expect(
      resolvePostLoginRoute({
        requiredTermsAgreed: undefined,
        profileCompleted: false,
      }),
    ).toEqual({
      isValid: false,
      route: "/auth",
      requiresOnboardingResolution: false,
    });
  });
});
