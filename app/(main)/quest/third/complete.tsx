import type { Href } from "expo-router";

import { QuestCompleteScreen } from "@/features/quest/screens/QuestCompleteScreen";

const closetRoute = "/closet" as Href;

export default function ThirdQuestCompleteRoute() {
  return (
    <QuestCompleteScreen
      description="축하해요! 세 번째 퀘스트를 성공적으로 완료했어요."
      rewards={["지난 주 옷장 활용률 분석 오픈 ", "월간 패션소비 리포트 오픈"]}
      buttonLabel="내 옷장 보러가기"
      buttonHref={closetRoute}
    />
  );
}
