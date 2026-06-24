import type { Href } from "expo-router";

import type { QuestCardItem } from "@/features/quest/screens/QuestTemplateScreen";
import type { QuestEntryState } from "@/features/onboarding/utils/resolveQuestEntryState";

export type QuestEntryScreenState =
  | {
      kind: "loading";
      title: string;
    }
  | {
      kind: "error";
      title: string;
      description: string;
    }
  | {
      kind: "progress";
      progressRoute: Href;
    }
  | {
      kind: "waiting";
      quests: QuestCardItem[];
    }
  | {
      kind: "completed";
      quests: QuestCardItem[];
    };

export function resolveQuestEntryScreenState(params: {
  isLoading: boolean;
  hasError: boolean;
  entryState: QuestEntryState | null;
}): QuestEntryScreenState {
  if (params.isLoading) {
    return {
      kind: "loading",
      title: "퀘스트 정보를 불러오는 중이에요.",
    };
  }

  if (params.hasError || !params.entryState || params.entryState.kind === "unresolved") {
    return {
      kind: "error",
      title: "퀘스트 정보를 불러오지 못했어요.",
      description: "다시 시도해주세요.",
    };
  }

  if (params.entryState.kind === "progress") {
    return {
      kind: "progress",
      progressRoute: params.entryState.progressRoute,
    };
  }

  return params.entryState;
}
