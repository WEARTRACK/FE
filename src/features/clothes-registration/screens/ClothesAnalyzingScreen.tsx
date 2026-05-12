import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClothesIcon from "../../../../assets/clothes-icon.svg";
import { uploadClothesPhoto } from "@/features/clothes-registration/api/uploadClothesPhoto";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";

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

    const upload = async () => {
      try {
        const result = await uploadClothesPhoto(imageUri);

        const params = {
          imageUri,
          photoId: String(result.photoId),
          imageUrl: result.imageUrl,
          predictedColor: result.predictedColor ?? "",
          predictedCategory: result.predictedCategory ?? "",
        };

        if (result.analysisStatus === "SUCCESS") {
          router.replace({
            pathname: "/clothes/register/result",
            params,
          });
          return;
        }

        router.replace({
          pathname: "/clothes/register/failure",
          params,
        });
      } catch (error) {
        router.replace({
          pathname: "/clothes/register/failure",
          params: { imageUri },
        });
      }
    };

    void upload();
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
