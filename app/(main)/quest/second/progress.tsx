import { useLocalSearchParams, useRouter } from "expo-router";

import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { useClothesRegistrationGuide } from "@/features/clothes-registration/hooks/useClothesRegistrationGuide";
import { AddQuestItemTile } from "@/features/quest/components/AddQuestItemTile";
import { RegisteredQuestItemTile } from "@/features/quest/components/RegisteredQuestItemTile";
import { useQuestCategoryCount } from "@/features/quest/hooks/useQuestCategoryCount";
import { QuestProgressTemplate } from "@/features/quest/screens/QuestProgressTemplate";

const mockClotheImage = require("../../../../assets/clotheExample.png");
const topCategories = ["tshirt", "shirt", "knit", "hoodie", "vest", "cardigan"] as const;

export default function SecondQuestProgressRoute() {
  const router = useRouter();
  const { mockCount } = useLocalSearchParams<{ mockCount?: string }>();
  const {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  } = useClothesRegistrationGuide();
  const { data: currentTopCount = 0 } = useQuestCategoryCount(topCategories);
  const parsedMockCount = mockCount ? Number(mockCount) : Number.NaN;
  const displayedTopCount = Number.isFinite(parsedMockCount)
    ? parsedMockCount
    : currentTopCount;
  const registeredTopTileCount = Math.min(Math.max(displayedTopCount, 0), 5);
  const isQuestComplete = registeredTopTileCount >= 5;
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
        questIcon="👕"
        questTitle="상의 5벌 등록"
        currentCount={displayedTopCount}
        requiredCount={5}
        gridTitle="등록된 상의"
        actionLabel={isQuestComplete ? "퀘스트 완료!" : "옷 등록하기"}
        onPressAction={handlePressAction}
        progressCardState={isQuestComplete ? "complete" : "default"}
        gridContent={[
          ...Array.from({ length: registeredTopTileCount }, (_, index) => (
            <RegisteredQuestItemTile
              key={`registered-top-${index + 1}`}
              accessibilityLabel={`등록된 상의 ${index + 1}`}
              imageSource={mockClotheImage}
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
