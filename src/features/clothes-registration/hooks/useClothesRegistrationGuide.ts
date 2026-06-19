import { useRouter } from "expo-router";
import { useState } from "react";

import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { showToast } from "@/lib/ui/showToast";

export function useClothesRegistrationGuide() {
  const router = useRouter();
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

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  return {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  };
}
