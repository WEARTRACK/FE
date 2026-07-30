import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import { Button } from "@/components/common/Button";
import { ClosetRegistrationGuideModal } from "@/features/clothes-registration/components/ClosetRegistrationGuideModal";
import { ClosetRegistrationHeader } from "@/features/clothes-registration/screens/ClosetRegistrationHeader";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { showToast } from "@/lib/ui/showToast";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";

function ErrorBadge() {
  return (
    <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-error">
      <Text className="font-pretendard-semibold text-[18px] leading-[28px] text-white">!</Text>
    </View>
  );
}

export function ClosetAnalysisFailureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const setClosetDraft = useClosetRegistrationStore((state) => state.setDraft);

  const handleSelectImage = async (source: "camera" | "library") => {
    setIsGuideVisible(false);

    try {
      const imageUri =
        source === "camera" ? await launchClothesCamera() : await launchClothesImageLibrary();

      if (!imageUri) {
        showToast(
          source === "camera"
            ? "카메라 권한이 필요하거나 촬영이 취소됐어요."
            : "사진 접근 권한이 필요하거나 선택이 취소됐어요.",
        );
        return;
      }

      router.replace({
        pathname: "/closet/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast(
        source === "camera"
          ? "카메라를 실행하지 못했어요. 다시 시도해주세요."
          : "사진을 불러오지 못했어요. 다시 시도해주세요.",
      );
    }
  };

  return (
    <>
      <View
        className="flex-1 bg-bg-light px-6"
        style={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <ClosetRegistrationHeader />

        <View className="flex-1 items-center justify-center pb-[112px]">
          <View>
            <ClosetIcon width={124} height={171} />
            <View className="absolute right-[-7px] top-[-9px]">
              <ErrorBadge />
            </View>
          </View>

          <Text className="mt-[33px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
            분석에 실패했습니다.
          </Text>
          <Text className="mt-[16px] text-center font-pretendard text-[14px] leading-[20px] text-text-subdued">
            재촬영 또는 직접 입력해주세요.
          </Text>
        </View>

        <View className="gap-[8px]">
          <Button
            label="재촬영"
            onPress={() => setIsGuideVisible(true)}
            fullWidth
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />

          <Button
            label="사용자 입력"
            onPress={() => {
              setClosetDraft({
                imageUri: null,
                imageUrl: null,
                detectedSectionCount: null,
                recommendedTemplateIds: [],
                templateId: null,
              });
              router.push({
                pathname: "/closet/register/select",
                params: { mode: "manual" },
              });
            }}
            variant="secondary"
            fullWidth
            className="h-[58px] border-[0.5px] border-text-subdued"
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />
        </View>
      </View>

      <ClosetRegistrationGuideModal
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
        onPressCapture={() => void handleSelectImage("camera")}
        onPressSelectImage={() => void handleSelectImage("library")}
      />
    </>
  );
}
