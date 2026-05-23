import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClothesIcon from "../../../../assets/clothes-icon.svg";
import {
  fetchClothesPhotoAnalysis,
  uploadClothesPhoto,
  type ClothesPhotoAnalysisResult,
  type ClothesPhotoUploadResult,
} from "@/features/clothes-registration/api/uploadClothesPhoto";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";

const ANALYSIS_POLL_INTERVAL_MS = 2000;
const ANALYSIS_TIMEOUT_MS = 60000;

function delay(durationMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function isAnalysisFailed(status: string) {
  return status === "FAIL" || status === "FAILED";
}

function createAnalysisParams(
  imageUri: string,
  uploadResult: ClothesPhotoUploadResult,
  analysisResult?: ClothesPhotoAnalysisResult,
) {
  return {
    imageUri,
    photoId: String(analysisResult?.photoId ?? uploadResult.photoId),
    imageUrl: analysisResult?.imageUrl ?? uploadResult.imageUrl,
    predictedColor: analysisResult?.predictedColor ?? uploadResult.predictedColor ?? "",
    predictedCategory: analysisResult?.predictedCategory ?? uploadResult.predictedCategory ?? "",
  };
}

export function ClothesAnalyzingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUri: imageUriParam } = useLocalSearchParams<{ imageUri?: string }>();
  const imageUri = getParamString(imageUriParam);
  const hasUploadedRef = useRef(false);

  useEffect(() => {
    if (hasUploadedRef.current) {
      return;
    }

    hasUploadedRef.current = true;

    if (!imageUri) {
      router.replace("/clothes/register/failure");
      return;
    }

    let isActive = true;

    const upload = async () => {
      try {
        const uploadResult = await uploadClothesPhoto(imageUri);
        const uploadParams = createAnalysisParams(imageUri, uploadResult);

        if (!isActive) {
          return;
        }

        if (uploadResult.analysisStatus === "SUCCESS") {
          router.replace({
            pathname: "/clothes/register/result",
            params: uploadParams,
          });
          return;
        }

        if (isAnalysisFailed(uploadResult.analysisStatus)) {
          router.replace({
            pathname: "/clothes/register/failure",
            params: uploadParams,
          });
          return;
        }

        const startedAt = Date.now();

        while (isActive && Date.now() - startedAt < ANALYSIS_TIMEOUT_MS) {
          await delay(ANALYSIS_POLL_INTERVAL_MS);

          if (!isActive) {
            return;
          }

          const analysisResult = await fetchClothesPhotoAnalysis(uploadResult.photoId);
          const analysisParams = createAnalysisParams(imageUri, uploadResult, analysisResult);

          if (analysisResult.analysisStatus === "SUCCESS") {
            router.replace({
              pathname: "/clothes/register/result",
              params: analysisParams,
            });
            return;
          }

          if (isAnalysisFailed(analysisResult.analysisStatus)) {
            router.replace({
              pathname: "/clothes/register/failure",
              params: analysisParams,
            });
            return;
          }
        }

        if (isActive) {
          router.replace({
            pathname: "/clothes/register/failure",
            params: uploadParams,
          });
        }
      } catch {
        if (isActive) {
          router.replace({
            pathname: "/clothes/register/failure",
            params: { imageUri },
          });
        }
      }
    };

    void upload();

    return () => {
      isActive = false;
    };
  }, [imageUri, router]);

  return (
    <View
      className="flex-1 items-center bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="flex-1 items-center justify-center pb-[112px]">
        <ClothesIcon width={124} height={124} />

        <Text className="mt-[52px] text-center font-pretendard-bold text-[20px] leading-[28px] text-text">
          AI가 옷을 분석하고 있어요..
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          잠시만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}
