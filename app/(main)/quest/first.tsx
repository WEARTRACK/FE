import type { Href } from "expo-router";

import { QuestCardItem, QuestTemplateScreen } from "@/features/quest/screens/QuestTemplateScreen";

const firstQuestProgressRoute = "/quest/first/progress" as Href;

const firstQuestCards: QuestCardItem[] = [
  {
    title: "첫 번째 퀘스트",
    description: "옷장 등록하기",
  },
  {
    title: "두 번째 퀘스트",
    description: "상의 5벌 등록하기",
  },
];

export default function FirstQuestRoute() {
  return <QuestTemplateScreen quests={firstQuestCards} startHref={firstQuestProgressRoute} />;
}
