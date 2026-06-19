import type { Href } from "expo-router";

import { QuestCompleteScreen } from "@/features/quest/screens/QuestCompleteScreen";

const closetRoute = "/closet" as Href;

export default function SecondQuestCompleteRoute() {
  return (
    <QuestCompleteScreen
      description="축하해요! 두 번째 퀘스트를 성공적으로 완료했어요."
      rewards={["색상 또는 카테고리로 옷 찾기 오픈", "주간 옷장 분석 리포트 오픈"]}
      buttonLabel="내 옷장 보러가기"
      buttonHref={closetRoute}
    />
  );
}
