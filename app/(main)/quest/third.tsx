import type { Href } from "expo-router";

import {
  QuestCardItem,
  QuestTemplateScreen,
} from "@/features/quest/screens/QuestTemplateScreen";

const thirdQuestProgressRoute = "/quest/third/progress" as Href;

const thirdQuestCards: QuestCardItem[] = [
  {
    title: "세 번째 퀘스트",
    description: "하의 2벌 등록하기",
  },
  {
    title: "Coming soon..",
  },
];

export default function ThirdQuestRoute() {
  return (
    <QuestTemplateScreen
      quests={thirdQuestCards}
      startHref={thirdQuestProgressRoute}
    />
  );
}
