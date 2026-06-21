import type { Href } from "expo-router";

import { QuestCompleteScreen } from "@/features/quest/screens/QuestCompleteScreen";

const closetRoute = "/closet" as Href;

export default function FirstQuestCompleteRoute() {
  return (
    <QuestCompleteScreen
      description="축하해요! 첫 번째 퀘스트를 성공적으로 완료했어요."
      rewards={["옷 등록 오픈", "카테고리 별 내 옷 차트 오픈"]}
      buttonLabel="내 옷장 보러가기"
      buttonHref={closetRoute}
    />
  );
}
