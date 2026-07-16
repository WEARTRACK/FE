import { Href, Redirect, useRouter } from "expo-router";

import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { useClothesRegistrationGuide } from "@/features/clothes-registration/hooks/useClothesRegistrationGuide";
import { useOnboardingQuestProgress } from "@/features/onboarding/hooks/useOnboardingQuestProgress";
import { AddQuestItemTile } from "@/features/quest/components/AddQuestItemTile";
import { RegisteredQuestItemTile } from "@/features/quest/components/RegisteredQuestItemTile";
import { QuestProgressTemplate } from "@/features/quest/screens/QuestProgressTemplate";
import { QuestQueryStateScreen } from "@/features/quest/screens/QuestQueryStateScreen";
import { useQuestRegistrationStore } from "@/stores/useQuestRegistrationStore";

export default function SecondQuestProgressRoute() {
  const router = useRouter();
  const onboardingState = useOnboardingQuestProgress("REGISTER_TOP");
  const {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  } = useClothesRegistrationGuide({
    questRegistration: {
      kind: "top",
      returnRoute: "/quest/second/progress",
    },
  });
  const registeredTopItems = useQuestRegistrationStore((state) => state.registeredItemsByKind.top);
  const isLoading = onboardingState.statusQuery.isPending || onboardingState.questsQuery.isPending;
  const hasError = onboardingState.statusQuery.isError || onboardingState.questsQuery.isError;
  const quest = onboardingState.quest;
  const displayedTopCount = Math.max(quest?.currentCount ?? 0, registeredTopItems.length);
  const isQuestComplete =
    (quest?.completed ?? false) || displayedTopCount >= (quest?.requiredCount ?? 1);

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
      router.replace("/quest/second/complete");
      return;
    }

    openClothesGuide();
  };

  return (
    <>
      <QuestProgressTemplate
        headerTitle="두번째 퀘스트"
        questTitle="상의 5벌 등록"
        currentCount={displayedTopCount}
        requiredCount={quest.requiredCount}
        gridTitle="등록된 상의"
        actionLabel={isQuestComplete ? "퀘스트 완료!" : "옷 등록하기"}
        onPressAction={handlePressAction}
        progressCardState={isQuestComplete ? "complete" : "default"}
        gridContent={[
          ...registeredTopItems
            .slice(0, quest.requiredCount)
            .map((item, index) => (
              <RegisteredQuestItemTile
                key={item.id}
                accessibilityLabel={`등록된 상의 ${index + 1}`}
                imageSource={{ uri: item.imageUri }}
                isComplete={isQuestComplete}
              />
            )),
          !isQuestComplete ? (
            <AddQuestItemTile
              key="add-registered-top"
              label="상의 추가 등록하기"
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
