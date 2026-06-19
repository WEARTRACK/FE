import { useLocalSearchParams, useRouter } from "expo-router";

import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { useClothesRegistrationGuide } from "@/features/clothes-registration/hooks/useClothesRegistrationGuide";
import { AddQuestItemTile } from "@/features/quest/components/AddQuestItemTile";
import { RegisteredQuestItemTile } from "@/features/quest/components/RegisteredQuestItemTile";
import { useQuestCategoryCount } from "@/features/quest/hooks/useQuestCategoryCount";
import { QuestProgressTemplate } from "@/features/quest/screens/QuestProgressTemplate";

const mockClotheImage = require("../../../../assets/clotheExample.png");
const bottomCategories = ["pants", "shorts", "skirt"] as const;

export default function ThirdQuestProgressRoute() {
  const router = useRouter();
  const { mockCount } = useLocalSearchParams<{ mockCount?: string }>();
  const {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  } = useClothesRegistrationGuide();
  const { data: currentBottomCount = 0 } = useQuestCategoryCount(bottomCategories);
  const parsedMockCount = mockCount ? Number(mockCount) : Number.NaN;
  const displayedBottomCount = Number.isFinite(parsedMockCount)
    ? parsedMockCount
    : currentBottomCount;
  const registeredBottomTileCount = Math.min(Math.max(displayedBottomCount, 0), 2);
  const isQuestComplete = registeredBottomTileCount >= 2;
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
        requiredCount={2}
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
