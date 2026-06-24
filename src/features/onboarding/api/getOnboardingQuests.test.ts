import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
  },
}));

describe("getOnboardingQuests", () => {
  it("returns validated onboarding quests result", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          onboardingCompleted: false,
          totalQuestCount: 3,
          completedQuestCount: 1,
          quests: [
            {
              questType: "REGISTER_TOP",
              title: "상의 5벌 등록하기",
              description: "상의 카테고리 옷을 5벌 등록해보세요.",
              requiredCount: 5,
              currentCount: 2,
              completed: false,
            },
          ],
        },
      },
    });

    const { getOnboardingQuests } = await import("./getOnboardingQuests");
    const result = await getOnboardingQuests();

    expect(result.quests).toHaveLength(1);
  });

  it("rejects invalid onboarding quests payload", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          onboardingCompleted: false,
          totalQuestCount: 3,
          completedQuestCount: 1,
          quests: [
            {
              questType: "REGISTER_SHOES",
              title: "신발 등록하기",
              description: "신발을 등록해보세요.",
              requiredCount: 1,
              currentCount: 0,
              completed: false,
            },
          ],
        },
      },
    });

    const { getOnboardingQuests } = await import("./getOnboardingQuests");

    await expect(getOnboardingQuests()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("rejects non-envelope responses", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        result: {
          quests: [],
        },
      },
    });

    const { getOnboardingQuests } = await import("./getOnboardingQuests");

    await expect(getOnboardingQuests()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("rejects failed onboarding quests envelopes", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "ONBOARDING_400",
        message: "failed",
        result: null,
      },
    });

    const { getOnboardingQuests } = await import("./getOnboardingQuests");

    await expect(getOnboardingQuests()).rejects.toMatchObject({
      code: "ONBOARDING_400",
      message: "failed",
    });
  });
});
