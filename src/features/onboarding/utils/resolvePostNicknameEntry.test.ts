import { describe, expect, it } from "vitest";

import { resolvePostNicknameEntry } from "./resolvePostNicknameEntry";

describe("resolvePostNicknameEntry", () => {
  it("routes to /quest when onboarding data shows the first quest is incomplete", () => {
    expect(
      resolvePostNicknameEntry({
        status: {
          onboardingCompleted: false,
          hidden: false,
          totalQuestCount: 3,
          completedQuestCount: 0,
          hasNewQuest: true,
          availableQuestCount: 1,
          nextQuestOpenAt: null,
        },
        quests: {
          onboardingCompleted: false,
          totalQuestCount: 3,
          completedQuestCount: 0,
          quests: [
            {
              questType: "REGISTER_CLOSET",
              title: "옷장 등록하기",
              description: "나의 옷장을 등록해보세요.",
              requiredCount: 1,
              currentCount: 0,
              completed: false,
            },
          ],
        },
      }),
    ).toEqual({
      route: "/quest",
      shouldShowFetchFailureToast: false,
    });
  });

  it("routes to /home when only status succeeds and indicates the first quest is already complete", () => {
    expect(
      resolvePostNicknameEntry({
        status: {
          onboardingCompleted: false,
          hidden: false,
          totalQuestCount: 3,
          completedQuestCount: 1,
          hasNewQuest: false,
          availableQuestCount: 0,
          nextQuestOpenAt: null,
        },
        quests: null,
      }),
    ).toEqual({
      route: "/home",
      shouldShowFetchFailureToast: false,
    });
  });

  it("routes to /home and requests a toast when both onboarding queries fail", () => {
    expect(
      resolvePostNicknameEntry({
        status: null,
        quests: null,
      }),
    ).toEqual({
      route: "/home",
      shouldShowFetchFailureToast: true,
    });
  });
});
