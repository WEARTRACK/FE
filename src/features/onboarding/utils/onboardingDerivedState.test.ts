import { describe, expect, it } from "vitest";

import {
  deriveOnboardingState,
  getFirstQuestCompleted,
  getOrderedOnboardingQuests,
} from "./onboardingDerivedState";

describe("onboardingDerivedState", () => {
  it("orders quests by predefined onboarding sequence", () => {
    const orderedQuests = getOrderedOnboardingQuests({
      onboardingCompleted: false,
      totalQuestCount: 3,
      completedQuestCount: 0,
      quests: [
        {
          questType: "REGISTER_BOTTOM",
          title: "하의 2벌 등록하기",
          description: "하의 카테고리 옷을 2벌 등록해보세요.",
          requiredCount: 2,
          currentCount: 0,
          completed: false,
        },
        {
          questType: "REGISTER_CLOSET",
          title: "옷장 등록하기",
          description: "나의 옷장을 등록해보세요.",
          requiredCount: 1,
          currentCount: 0,
          completed: false,
        },
        {
          questType: "REGISTER_TOP",
          title: "상의 5벌 등록하기",
          description: "상의 카테고리 옷을 5벌 등록해보세요.",
          requiredCount: 5,
          currentCount: 0,
          completed: false,
        },
      ],
    });

    expect(orderedQuests.map((quest) => quest.questType)).toEqual([
      "REGISTER_CLOSET",
      "REGISTER_TOP",
      "REGISTER_BOTTOM",
    ]);
    expect(orderedQuests[0]?.progressRoute).toBe("/quest/first/progress");
  });

  it("fills empty titles and descriptions with fallback metadata", () => {
    const orderedQuests = getOrderedOnboardingQuests({
      onboardingCompleted: false,
      totalQuestCount: 1,
      completedQuestCount: 0,
      quests: [
        {
          questType: "REGISTER_CLOSET",
          title: "",
          description: "",
          requiredCount: 1,
          currentCount: 0,
          completed: false,
        },
      ],
    });

    expect(orderedQuests[0]?.title).toBe("첫 번째 퀘스트");
    expect(orderedQuests[0]?.description).toBe("옷장 등록하기");
  });

  it("derives first quest completion from quest payload", () => {
    expect(
      getFirstQuestCompleted({
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
        ],
      }),
    ).toBe(true);
  });

  it("selects the first incomplete quest as the current available quest", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: false,
        hidden: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        hasNewQuest: true,
        availableQuestCount: 1,
        nextQuestOpenAt: null,
      },
      quests: {
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
          {
            questType: "REGISTER_TOP",
            title: "상의 5벌 등록하기",
            description: "상의 카테고리 옷을 5벌 등록해보세요.",
            requiredCount: 5,
            currentCount: 2,
            completed: false,
          },
          {
            questType: "REGISTER_BOTTOM",
            title: "하의 2벌 등록하기",
            description: "하의 카테고리 옷을 2벌 등록해보세요.",
            requiredCount: 2,
            currentCount: 0,
            completed: false,
          },
        ],
      },
    });

    expect(derivedState.currentAvailableQuest?.questType).toBe("REGISTER_TOP");
    expect(derivedState.nextLockedQuest?.questType).toBe("REGISTER_BOTTOM");
    expect(derivedState.firstQuestCompleted).toBe(true);
    expect(derivedState.hasNewQuestBadge).toBe(true);
    expect(derivedState.canStartQuest).toBe(true);
  });

  it("marks waiting state when no quest is currently available", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: false,
        hidden: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        hasNewQuest: false,
        availableQuestCount: 0,
        nextQuestOpenAt: "2026-07-01T00:00:00.000Z",
      },
      quests: {
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
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
    });

    expect(derivedState.currentAvailableQuest).toBeNull();
    expect(derivedState.nextLockedQuest?.questType).toBe("REGISTER_TOP");
    expect(derivedState.isWaitingForNextQuest).toBe(true);
    expect(derivedState.canStartQuest).toBe(false);
  });

  it("does not mark waiting state when onboarding status is unresolved", () => {
    const derivedState = deriveOnboardingState({
      status: null,
      quests: {
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
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
    });

    expect(derivedState.isStatusResolved).toBe(false);
    expect(derivedState.isWaitingForNextQuest).toBe(false);
    expect(derivedState.canStartQuest).toBe(false);
  });

  it("hides the home quest badge when onboarding status is unavailable", () => {
    const derivedState = deriveOnboardingState({
      status: null,
      quests: {
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
        ],
      },
    });

    expect(derivedState.hasNewQuestBadge).toBe(false);
  });

  it("hides the home quest badge when the server marks onboarding as hidden", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: false,
        hidden: true,
        totalQuestCount: 3,
        completedQuestCount: 1,
        hasNewQuest: true,
        availableQuestCount: 1,
        nextQuestOpenAt: null,
      },
      quests: {
        onboardingCompleted: false,
        totalQuestCount: 3,
        completedQuestCount: 1,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
        ],
      },
    });

    expect(derivedState.hasNewQuestBadge).toBe(false);
  });

  it("uses completed quest count as a first-quest fallback when quests are unavailable", () => {
    const derivedState = deriveOnboardingState({
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
    });

    expect(derivedState.firstQuestCompleted).toBe(true);
  });

  it("marks onboarding completion when the server says onboarding is complete", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: true,
        hidden: false,
        totalQuestCount: 3,
        completedQuestCount: 3,
        hasNewQuest: false,
        availableQuestCount: 0,
        nextQuestOpenAt: null,
      },
      quests: {
        onboardingCompleted: true,
        totalQuestCount: 3,
        completedQuestCount: 3,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
          {
            questType: "REGISTER_TOP",
            title: "상의 5벌 등록하기",
            description: "상의 카테고리 옷을 5벌 등록해보세요.",
            requiredCount: 5,
            currentCount: 5,
            completed: true,
          },
          {
            questType: "REGISTER_BOTTOM",
            title: "하의 2벌 등록하기",
            description: "하의 카테고리 옷을 2벌 등록해보세요.",
            requiredCount: 2,
            currentCount: 2,
            completed: true,
          },
        ],
      },
    });

    expect(derivedState.isOnboardingCompleted).toBe(true);
    expect(derivedState.isWaitingForNextQuest).toBe(false);
    expect(derivedState.currentAvailableQuest).toBeNull();
    expect(derivedState.completedQuests).toHaveLength(3);
  });

  it("prefers completed quest state when status and quest responses briefly disagree", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: false,
        hidden: false,
        totalQuestCount: 3,
        completedQuestCount: 2,
        hasNewQuest: false,
        availableQuestCount: 0,
        nextQuestOpenAt: null,
      },
      quests: {
        onboardingCompleted: true,
        totalQuestCount: 3,
        completedQuestCount: 3,
        quests: [
          {
            questType: "REGISTER_CLOSET",
            title: "옷장 등록하기",
            description: "나의 옷장을 등록해보세요.",
            requiredCount: 1,
            currentCount: 1,
            completed: true,
          },
          {
            questType: "REGISTER_TOP",
            title: "상의 5벌 등록하기",
            description: "상의 카테고리 옷을 5벌 등록해보세요.",
            requiredCount: 5,
            currentCount: 5,
            completed: true,
          },
          {
            questType: "REGISTER_BOTTOM",
            title: "하의 2벌 등록하기",
            description: "하의 카테고리 옷을 2벌 등록해보세요.",
            requiredCount: 2,
            currentCount: 2,
            completed: true,
          },
        ],
      },
    });

    expect(derivedState.isOnboardingCompleted).toBe(true);
    expect(derivedState.isWaitingForNextQuest).toBe(false);
  });

  it("avoids inferring a current quest when the availability count is ambiguous", () => {
    const derivedState = deriveOnboardingState({
      status: {
        onboardingCompleted: false,
        hidden: false,
        totalQuestCount: 3,
        completedQuestCount: 0,
        hasNewQuest: true,
        availableQuestCount: 2,
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
          {
            questType: "REGISTER_TOP",
            title: "상의 5벌 등록하기",
            description: "상의 카테고리 옷을 5벌 등록해보세요.",
            requiredCount: 5,
            currentCount: 0,
            completed: false,
          },
        ],
      },
    });

    expect(derivedState.currentAvailableQuest).toBeNull();
    expect(derivedState.nextLockedQuest).toBeNull();
    expect(derivedState.hasAmbiguousQuestAvailability).toBe(true);
    expect(derivedState.canStartQuest).toBe(false);
  });
});
