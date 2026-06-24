import { Href, Redirect, useRouter } from "expo-router";

import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { useClothesRegistrationGuide } from "@/features/clothes-registration/hooks/useClothesRegistrationGuide";
import { useOnboardingQuestProgress } from "@/features/onboarding/hooks/useOnboardingQuestProgress";
import { AddQuestItemTile } from "@/features/quest/components/AddQuestItemTile";
import { RegisteredQuestItemTile } from "@/features/quest/components/RegisteredQuestItemTile";
import { QuestProgressTemplate } from "@/features/quest/screens/QuestProgressTemplate";
import { QuestQueryStateScreen } from "@/features/quest/screens/QuestQueryStateScreen";

const mockClotheImage = require("../../../../assets/clotheExample.png");

export default function ThirdQuestProgressRoute() {
  const router = useRouter();
  const onboardingState = useOnboardingQuestProgress("REGISTER_BOTTOM");
  const {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  } = useClothesRegistrationGuide();
  const isLoading =
    onboardingState.statusQuery.isPending || onboardingState.questsQuery.isPending;
  const hasError = onboardingState.statusQuery.isError || onboardingState.questsQuery.isError;
  const quest = onboardingState.quest;
  const displayedBottomCount = quest?.currentCount ?? 0;
  const registeredBottomTileCount = Math.min(
    Math.max(displayedBottomCount, 0),
    quest?.requiredCount ?? 0,
  );
  const isQuestComplete = quest?.completed ?? false;

  if (isLoading) {
    return <QuestQueryStateScreen title="퀘스트 정보를 불러오는 중이에요." />;
  }

  if (hasError || !quest) {
    return (
      <QuestQueryStateScreen
        title="퀘스트 정보를 불러오지 못했어요."
        description="다시 시도해주세요."
        actionLabel="다시 시도"
        onPressAction={() => {
          void onboardingState.statusQuery.refetch();
          void onboardingState.questsQuery.refetch();
        }}
      />
    );
  }

  if (onboardingState.shouldRedirectToQuestEntry) {
    return <Redirect href={"/quest" as Href} />;
  }

  const handlePressAction = () => {
    if (isQuestComplete) {
      router.replace("/quest/third/complete");
      return;
    }

    openClothesGuide();
  };

  return (
    <>
      <QuestProgressTemplate
        headerTitle="세번째 퀘스트"
        questIcon="👖"
        questTitle="하의 2벌 등록"
        currentCount={displayedBottomCount}
        requiredCount={quest.requiredCount}
        gridTitle="등록된 하의"
        actionLabel={isQuestComplete ? "퀘스트 완료!" : "옷 등록하기"}
        onPressAction={handlePressAction}
        progressCardState={isQuestComplete ? "complete" : "default"}
        gridContent={[
          ...Array.from({ length: registeredBottomTileCount }, (_, index) => (
            <RegisteredQuestItemTile
              key={`registered-bottom-${index + 1}`}
              accessibilityLabel={`등록된 하의 ${index + 1}`}
              imageSource={mockClotheImage}
              isComplete={isQuestComplete}
            />
          )),
          !isQuestComplete ? (
            <AddQuestItemTile
              key="add-registered-bottom"
              label="하의 추가 등록하기"
              onPress={openClothesGuide}
            />
          ) : null,
        ]}
      />

      <ClothesRegistrationGuideModal
        visible={isClothesGuideVisible}
        onClose={closeClothesGuide}
        onPressCapture={handlePressClothesCapture}
        onPressSelectImage={handlePressClothesImageSelect}
      />
    </>
  );
}
