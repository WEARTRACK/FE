import type { QuestCardItem } from "@/features/quest/screens/QuestTemplateScreen";

export function getQuestEntryCardAlertMessage(quest: Pick<QuestCardItem, "kind">) {
  if (quest.kind === "completed") {
    return "이미 완료한 퀘스트예요.";
  }

  return "다음 퀘스트는 아직 열리지 않았어요.\n새로운 퀘스트가 열리면 알려드릴게요.";
}

export function getQuestEntryActionAlertMessage() {
  return "현재 진행할 수 있는 퀘스트가 없어요.\n새로운 퀘스트가 열리면 알려드릴게요.";
}
