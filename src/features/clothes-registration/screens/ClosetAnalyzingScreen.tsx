import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import { uploadClosetPhoto } from "@/features/clothes-registration/api/uploadClosetPhoto";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { getRandomTemplateIdsBySectionCounts } from "@/features/clothes-registration/screens/closet-template-data";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";

const DOT_CHANGE_INTERVAL_MS = 600;

export function ClosetAnalyzingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUri: imageUriParam } = useLocalSearchParams<{ imageUri?: string }>();
  const draftImageUri = useClosetRegistrationStore((state) => state.imageUri);
  const setClosetDraft = useClosetRegistrationStore((state) => state.setDraft);
  const imageUri = getParamString(imageUriParam) ?? draftImageUri;
  const hasUploadedRef = useRef(false);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount((currentCount) => (currentCount % 3) + 1);
    }, DOT_CHANGE_INTERVAL_MS);

    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (hasUploadedRef.current) {
      return;
    }

    hasUploadedRef.current = true;

    if (!imageUri) {
      router.replace(clothesRegistrationRoutes.failure);
      return;
    }

    const upload = async () => {
      try {
        const result = await uploadClosetPhoto(imageUri);
        const recommendedTemplateIds = getRandomTemplateIdsBySectionCounts(
          result.recommendedTemplates.map((template) => template.sectionCount),
        );

        setClosetDraft({
          imageUri,
          imageUrl: result.imageUrl,
          detectedSectionCount: result.detectedSectionCount,
          recommendedTemplateIds,
          templateId: null,
        });

        if (result.analysisStatus === "SUCCESS" && recommendedTemplateIds.length > 0) {
          router.replace(clothesRegistrationRoutes.select);
          return;
        }

        router.replace(clothesRegistrationRoutes.failure);
      } catch {
        router.replace(clothesRegistrationRoutes.failure);
      }
    };

    void upload();
  }, [imageUri, router, setClosetDraft]);

  return (
    <View
      className="flex-1 items-center bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="flex-1 items-center justify-center pb-[112px]">
        <ClosetIcon width={124} height={171} />

        <Text className="mt-[52px] text-center font-pretendard-bold text-[20px] leading-[28px] text-text">
          AI가 옷장을 분석하고 있어요{".".repeat(dotCount)}
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          잠시만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}
