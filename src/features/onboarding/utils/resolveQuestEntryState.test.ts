import { describe, expect, it } from "vitest";

import { resolveQuestEntryState } from "./resolveQuestEntryState";

describe("resolveQuestEntryState", () => {
  it("routes to the current template screen when a quest is available", () => {
    expect(
      resolveQuestEntryState({
        orderedQuests: [],
        completedQuests: [],
        latestCompletedQuest: null,
        currentAvailableQuest: {
          questType: "REGISTER_TOP",
          order: 2,
          templateRoute: "/quest/second",
          progressRoute: "/quest/second/progress",
          completeRoute: "/quest/second/complete",
          fallbackTitle: "두 번째 퀘스트",
          fallbackDescription: "상의 5벌 등록하기",
          title: "두 번째 퀘스트",
          description: "상의 5벌 등록하기",
          requiredCount: 5,
          currentCount: 1,
          completed: false,
        },
        nextLockedQuest: null,
        firstQuestCompleted: true,
        hasNewQuestBadge: true,
        isWaitingForNextQuest: false,
        isOnboardingCompleted: false,
        canStartQuest: true,
        isStatusResolved: true,
        hasAmbiguousQuestAvailability: false,
      }),
    ).toEqual({
      kind: "template",
      templateRoute: "/quest/second",
    });
  });

  it("builds waiting cards from the latest completed quest and the next locked quest", () => {
    expect(
      resolveQuestEntryState({
        orderedQuests: [],
        completedQuests: [],
        latestCompletedQuest: {
          questType: "REGISTER_CLOSET",
          order: 1,
          templateRoute: "/quest/first",
          progressRoute: "/quest/first/progress",
          completeRoute: "/quest/first/complete",
          fallbackTitle: "첫 번째 퀘스트",
          fallbackDescription: "옷장 등록하기",
          title: "첫 번째 퀘스트",
          description: "옷장 등록하기",
          requiredCount: 1,
          currentCount: 1,
          completed: true,
        },
        currentAvailableQuest: null,
        nextLockedQuest: {
          questType: "REGISTER_TOP",
          order: 2,
          templateRoute: "/quest/second",
          progressRoute: "/quest/second/progress",
          completeRoute: "/quest/second/complete",
          fallbackTitle: "두 번째 퀘스트",
          fallbackDescription: "상의 5벌 등록하기",
          title: "두 번째 퀘스트",
          description: "상의 5벌 등록하기",
          requiredCount: 5,
          currentCount: 0,
          completed: false,
        },
        firstQuestCompleted: true,
        hasNewQuestBadge: false,
        isWaitingForNextQuest: true,
        isOnboardingCompleted: false,
        canStartQuest: false,
        isStatusResolved: true,
        hasAmbiguousQuestAvailability: false,
      }),
    ).toEqual({
      kind: "waiting",
      quests: [
        {
          title: "첫 번째 퀘스트",
          description: "옷장 등록하기",
          kind: "completed",
        },
        {
          title: "두 번째 퀘스트",
          description: "상의 5벌 등록하기",
          kind: "locked",
        },
      ],
    });
  });

  it("builds completed-entry cards with a coming-soon card for the next slot", () => {
    expect(
      resolveQuestEntryState({
        orderedQuests: [],
        completedQuests: [],
        latestCompletedQuest: {
          questType: "REGISTER_BOTTOM",
          order: 3,
          templateRoute: "/quest/third",
          progressRoute: "/quest/third/progress",
          completeRoute: "/quest/third/complete",
          fallbackTitle: "세 번째 퀘스트",
          fallbackDescription: "하의 2벌 등록하기",
          title: "세 번째 퀘스트",
          description: "하의 2벌 등록하기",
          requiredCount: 2,
          currentCount: 2,
          completed: true,
        },
        currentAvailableQuest: null,
        nextLockedQuest: null,
        firstQuestCompleted: true,
        hasNewQuestBadge: false,
        isWaitingForNextQuest: false,
        isOnboardingCompleted: true,
        canStartQuest: false,
        isStatusResolved: true,
        hasAmbiguousQuestAvailability: false,
      }),
    ).toEqual({
      kind: "completed",
      quests: [
        {
          title: "세 번째 퀘스트",
          description: "하의 2벌 등록하기",
          kind: "completed",
        },
        {
          title: "Coming soon..",
          kind: "coming-soon",
        },
      ],
    });
  });
});
