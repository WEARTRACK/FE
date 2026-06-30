import { describe, expect, it } from "vitest";

import { getShouldRedirectQuestProgress } from "./getShouldRedirectQuestProgress";

describe("getShouldRedirectQuestProgress", () => {
  it("redirects when a different quest is currently available", () => {
    expect(
      getShouldRedirectQuestProgress({
        questCompleted: false,
        targetQuestType: "REGISTER_TOP",
        currentAvailableQuestType: "REGISTER_CLOSET",
        isWaitingForNextQuest: false,
        hasAmbiguousQuestAvailability: false,
        isStatusResolved: true,
      }),
    ).toBe(true);
  });

  it("redirects when the user is waiting for the next quest to open", () => {
    expect(
      getShouldRedirectQuestProgress({
        questCompleted: false,
        targetQuestType: "REGISTER_TOP",
        currentAvailableQuestType: null,
        isWaitingForNextQuest: true,
        hasAmbiguousQuestAvailability: false,
        isStatusResolved: true,
      }),
    ).toBe(true);
  });

  it("redirects when quest availability is ambiguous", () => {
    expect(
      getShouldRedirectQuestProgress({
        questCompleted: false,
        targetQuestType: "REGISTER_BOTTOM",
        currentAvailableQuestType: null,
        isWaitingForNextQuest: false,
        hasAmbiguousQuestAvailability: true,
        isStatusResolved: true,
      }),
    ).toBe(true);
  });

  it("does not redirect completed quests", () => {
    expect(
      getShouldRedirectQuestProgress({
        questCompleted: true,
        targetQuestType: "REGISTER_BOTTOM",
        currentAvailableQuestType: null,
        isWaitingForNextQuest: true,
        hasAmbiguousQuestAvailability: false,
        isStatusResolved: true,
      }),
    ).toBe(false);
  });

  it("does not redirect while status is unresolved", () => {
    expect(
      getShouldRedirectQuestProgress({
        questCompleted: false,
        targetQuestType: "REGISTER_CLOSET",
        currentAvailableQuestType: null,
        isWaitingForNextQuest: false,
        hasAmbiguousQuestAvailability: false,
        isStatusResolved: false,
      }),
    ).toBe(false);
  });
});
