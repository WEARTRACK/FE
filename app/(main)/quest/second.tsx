import type { Href } from "expo-router";

import { QuestCardItem, QuestTemplateScreen } from "@/features/quest/screens/QuestTemplateScreen";

const secondQuestProgressRoute = "/quest/second/progress" as Href;

const secondQuestCards: QuestCardItem[] = [
  {
    title: "두 번째 퀘스트",
    description: "상의 5벌 등록하기",
  },
  {
    title: "세 번째 퀘스트",
    description: "하의 2벌 등록하기",
  },
];

export default function SecondQuestRoute() {
  return <QuestTemplateScreen quests={secondQuestCards} startHref={secondQuestProgressRoute} />;
}
