import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClothesIconImage from "../../../../assets/clothes-icon.png";
import {
  fetchClothesPhotoAnalysis,
  uploadClothesPhoto,
  type ClothesPhotoAnalysisResult,
  type ClothesPhotoUploadResult,
} from "@/features/clothes-registration/api/uploadClothesPhoto";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";

const ANALYSIS_POLL_INTERVAL_MS = 2000;
const ANALYSIS_TIMEOUT_MS = 60000;
const ANALYSIS_MESSAGES = [
  "AI가 옷을 분석하고 있어요",
  "AI가 색상을 분석하고 있어요",
  "AI가 카테고리를 분석하고 있어요",
];
const MESSAGE_CHANGE_INTERVAL_MS = 4200;
const DOT_CHANGE_INTERVAL_MS = 600;

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
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % ANALYSIS_MESSAGES.length);
    }, MESSAGE_CHANGE_INTERVAL_MS);
    const dotInterval = setInterval(() => {
      setDotCount((currentCount) => (currentCount % 3) + 1);
    }, DOT_CHANGE_INTERVAL_MS);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotInterval);
    };
  }, []);

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
        <Image resizeMode="contain" source={ClothesIconImage} style={{ height: 124, width: 124 }} />

        <Text className="mt-[52px] text-center font-pretendard-bold text-[20px] leading-[28px] text-text">
          {ANALYSIS_MESSAGES[messageIndex]}
          {".".repeat(dotCount)}
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[14px] leading-[20px] text-text-subdued">
          잠시만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}
