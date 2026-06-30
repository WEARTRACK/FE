import type { Href } from "expo-router";

import type { QuestCardItem } from "@/features/quest/screens/QuestTemplateScreen";
import type { OnboardingDerivedState } from "@/features/onboarding/utils/onboardingDerivedState";

export type QuestEntryState =
  | {
      kind: "template";
      templateRoute: Href;
    }
  | {
      kind: "waiting";
      quests: QuestCardItem[];
    }
  | {
      kind: "completed";
      quests: QuestCardItem[];
    }
  | {
      kind: "unresolved";
    };

function createComingSoonQuestCard(): QuestCardItem {
  return {
    title: "Coming soon..",
    kind: "coming-soon",
  };
}

export function resolveQuestEntryState(state: OnboardingDerivedState): QuestEntryState {
  if (state.currentAvailableQuest) {
    return {
      kind: "template",
      templateRoute: state.currentAvailableQuest.templateRoute,
    };
  }

  if (state.isWaitingForNextQuest && state.latestCompletedQuest && state.nextLockedQuest) {
    return {
      kind: "waiting",
      quests: [
        {
          title: state.latestCompletedQuest.title,
          description: state.latestCompletedQuest.description,
          kind: "completed",
        },
        {
          title: state.nextLockedQuest.title,
          description: state.nextLockedQuest.description,
          kind: "locked",
        },
      ],
    };
  }

  if (state.isOnboardingCompleted && state.latestCompletedQuest) {
    return {
      kind: "completed",
      quests: [
        {
          title: state.latestCompletedQuest.title,
          description: state.latestCompletedQuest.description,
          kind: "completed",
        },
        createComingSoonQuestCard(),
      ],
    };
  }

  return {
    kind: "unresolved",
  };
}
