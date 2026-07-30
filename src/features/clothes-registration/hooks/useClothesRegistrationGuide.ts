import { type Href, useRouter } from "expo-router";
import { useState } from "react";

import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { showToast } from "@/lib/ui/showToast";
import {
  type QuestRegistrationKind,
  useQuestRegistrationStore,
} from "@/stores/useQuestRegistrationStore";

type UseClothesRegistrationGuideOptions = {
  questRegistration?: {
    kind: Extract<QuestRegistrationKind, "top" | "bottom">;
    returnRoute: Href;
  };
};

export function useClothesRegistrationGuide(options?: UseClothesRegistrationGuideOptions) {
  const router = useRouter();
  const startQuestRegistration = useQuestRegistrationStore((state) => state.startRegistration);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);

  const openClothesGuide = () => {
    setIsClothesGuideVisible(true);
  };

  const closeClothesGuide = () => {
    setIsClothesGuideVisible(false);
  };

  const handlePressClothesCapture = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
        return;
      }

      if (options?.questRegistration) {
        startQuestRegistration(options.questRegistration);
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressClothesImageSelect = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      if (options?.questRegistration) {
        startQuestRegistration(options.questRegistration);
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressShoppingMallLink = () => {
    setIsClothesGuideVisible(false);

    if (options?.questRegistration) {
      startQuestRegistration(options.questRegistration);
    }

    router.push(clothesRegistrationRoutes.shoppingMallLink);
  };

  return {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    handlePressShoppingMallLink,
    isClothesGuideVisible,
    openClothesGuide,
  };
}
