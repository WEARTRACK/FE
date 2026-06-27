import { describe, expect, it } from "vitest";

import { resolveQuestEntryScreenState } from "./resolveQuestEntryScreenState";

describe("resolveQuestEntryScreenState", () => {
  it("returns loading state while queries are pending", () => {
    expect(
      resolveQuestEntryScreenState({
        isLoading: true,
        hasError: false,
        entryState: null,
      }),
    ).toEqual({
      kind: "loading",
      title: "퀘스트 정보를 불러오는 중이에요.",
    });
  });

  it("returns error state when entry cannot be resolved", () => {
    expect(
      resolveQuestEntryScreenState({
        isLoading: false,
        hasError: true,
        entryState: null,
      }),
    ).toEqual({
      kind: "error",
      title: "퀘스트 정보를 불러오지 못했어요.",
      description: "다시 시도해주세요.",
    });
  });

  it("passes through resolved template state", () => {
    expect(
      resolveQuestEntryScreenState({
        isLoading: false,
        hasError: false,
        entryState: {
          kind: "template",
          templateRoute: "/quest/second",
        },
      }),
    ).toEqual({
      kind: "template",
      templateRoute: "/quest/second",
    });
  });

  it("passes through waiting state", () => {
    expect(
      resolveQuestEntryScreenState({
        isLoading: false,
        hasError: false,
        entryState: {
          kind: "waiting",
          quests: [{ title: "첫 번째 퀘스트", kind: "completed" }],
        },
      }),
    ).toEqual({
      kind: "waiting",
      quests: [{ title: "첫 번째 퀘스트", kind: "completed" }],
    });
  });
});
