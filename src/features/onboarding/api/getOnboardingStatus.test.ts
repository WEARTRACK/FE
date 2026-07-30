import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
  },
}));

describe("getOnboardingStatus", () => {
  it("returns validated onboarding status result", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          onboardingCompleted: false,
          hidden: false,
          totalQuestCount: 3,
          completedQuestCount: 1,
          hasNewQuest: true,
          availableQuestCount: 1,
          nextQuestOpenAt: null,
        },
      },
    });

    const { getOnboardingStatus } = await import("./getOnboardingStatus");
    const result = await getOnboardingStatus();

    expect(result.availableQuestCount).toBe(1);
  });

  it("rejects invalid onboarding status payload", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          onboardingCompleted: false,
          hidden: false,
          totalQuestCount: 3,
          completedQuestCount: 1,
          hasNewQuest: true,
          availableQuestCount: "1",
          nextQuestOpenAt: null,
        },
      },
    });

    const { getOnboardingStatus } = await import("./getOnboardingStatus");

    await expect(getOnboardingStatus()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("rejects non-envelope responses", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        result: {
          onboardingCompleted: false,
        },
      },
    });

    const { getOnboardingStatus } = await import("./getOnboardingStatus");

    await expect(getOnboardingStatus()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("rejects failed onboarding status envelopes", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "ONBOARDING_400",
        message: "failed",
        result: null,
      },
    });

    const { getOnboardingStatus } = await import("./getOnboardingStatus");

    await expect(getOnboardingStatus()).rejects.toMatchObject({
      code: "ONBOARDING_400",
      message: "failed",
    });
  });
});
