import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import { uploadClosetPhoto } from "@/features/clothes-registration/api/uploadClosetPhoto";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { getClosetTemplateRequestId } from "@/features/clothes-registration/screens/closet-template-data";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";
import {
  parseNumericParam,
  serializePredictedSections,
} from "@/features/clothes-registration/utils/closetRegistrationParams";

export function ClosetAnalyzingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUri: imageUriParam, templateId: templateIdParam } = useLocalSearchParams<{
    imageUri?: string;
    templateId?: string;
  }>();
  const imageUri = getParamString(imageUriParam);
  const rawTemplateId = getParamString(templateIdParam);
  const templateId =
    parseNumericParam(templateIdParam) ?? getClosetTemplateRequestId(rawTemplateId ?? undefined);
  const hasUploadedRef = useRef(false);

  useEffect(() => {
    if (hasUploadedRef.current) {
      return;
    }

    hasUploadedRef.current = true;

    if (!imageUri || templateId === null) {
      router.replace(clothesRegistrationRoutes.failure);
      return;
    }

    const upload = async () => {
      try {
        const result = await uploadClosetPhoto(imageUri, templateId);

        const params = {
          imageUri,
          imageUrl: result.imageUrl,
          templateId: String(result.templateId),
          predictedSectionCount:
            result.predictedSectionCount === null ? "" : String(result.predictedSectionCount),
          predictedSections: serializePredictedSections(result.predictedSections),
        };

        if (result.analysisStatus === "SUCCESS") {
          router.replace({
            pathname: "/closet/register/result",
            params,
          });
          return;
        }

        router.replace({
          pathname: "/closet/register/failure",
          params,
        });
      } catch {
        router.replace({
          pathname: "/closet/register/failure",
          params: { imageUri },
        });
      }
    };

    void upload();
  }, [imageUri, router, templateId]);

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

        <Text className="font-pretendard-bold mt-[52px] text-center text-[20px] leading-[28px] text-text">
          AI가 옷장을 분석하고 있어요..
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          잠시만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}
