import { Href, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import ClosetExample from "../../../../assets/closetExample.svg";
import { ClosetRegistrationGuideModal } from "@/features/clothes-registration/components/ClosetRegistrationGuideModal";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { useOnboardingQuestProgress } from "@/features/onboarding/hooks/useOnboardingQuestProgress";
import { QuestProgressTemplate } from "@/features/quest/screens/QuestProgressTemplate";
import { QuestQueryStateScreen } from "@/features/quest/screens/QuestQueryStateScreen";
import { showToast } from "@/lib/ui/showToast";

function RegisteredClosetTile() {
  return (
    <View className="relative h-[110px] w-[110px] overflow-hidden rounded-[13.2px] border-[1.1px] border-bg-dark bg-cool">
      <View className="absolute left-0 top-[-24px]">
        <ClosetExample width={110} height={158} />
      </View>
      <View className="absolute right-[14px] top-[8px]">
        <CheckActiveIcon width={31} height={31} />
      </View>
    </View>
  );
}

export function FirstQuestProgressScreen() {
  const router = useRouter();
  const onboardingState = useOnboardingQuestProgress("REGISTER_CLOSET");
  const [isClosetGuideVisible, setIsClosetGuideVisible] = useState(false);
  const isLoading =
    onboardingState.statusQuery.isPending || onboardingState.questsQuery.isPending;
  const hasError = onboardingState.statusQuery.isError || onboardingState.questsQuery.isError;
  const quest = onboardingState.quest;
  const currentClosetCount = Math.min(quest?.currentCount ?? 0, quest?.requiredCount ?? 1);
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

  const handleOpenClosetGuide = () => {
    if (isQuestComplete) {
      return;
    }

    setIsClosetGuideVisible(true);
  };

  const handleCompleteQuest = () => {
    router.replace("/quest/first/complete");
  };

  return (
    <>
      <QuestProgressTemplate
        headerTitle="첫번째 퀘스트"
        questIcon="👕"
        questTitle={isQuestComplete ? "옷장 등록 완료!" : "옷장 등록"}
        currentCount={currentClosetCount}
        requiredCount={quest.requiredCount}
        gridTitle="등록된 옷장"
        actionLabel={isQuestComplete ? "퀘스트 완료!" : "옷장 등록하기"}
        onPressAction={isQuestComplete ? handleCompleteQuest : handleOpenClosetGuide}
        progressCardState={isQuestComplete ? "complete" : "default"}
        gridContent={isQuestComplete ? <RegisteredClosetTile /> : undefined}
      />

      <ClosetRegistrationGuideModal
        visible={isClosetGuideVisible}
        onClose={() => setIsClosetGuideVisible(false)}
        onPressCapture={() => {
          void (async () => {
            setIsClosetGuideVisible(false);

            try {
              const imageUri = await launchClothesCamera();

              if (!imageUri) {
                showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
                return;
              }

              router.push({
                pathname: "/closet/register/preview",
                params: { imageUri },
              });
            } catch {
              showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
            }
          })();
        }}
        onPressSelectImage={() => {
          void (async () => {
            setIsClosetGuideVisible(false);

            try {
              const imageUri = await launchClothesImageLibrary();

              if (!imageUri) {
                showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
                return;
              }

              router.push({
                pathname: "/closet/register/preview",
                params: { imageUri },
              });
            } catch {
              showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
            }
          })();
        }}
      />
    </>
  );
}
