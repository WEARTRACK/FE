import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClothesIconImage from "../../../../assets/clothes-icon.png";
import { Button } from "@/components/common/Button";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";
import { launchClothesCamera } from "@/features/clothes-registration/utils/launchClothesCamera";
import {
  getParamString,
  normalizeCategoryName,
  normalizeColorName,
} from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { showToast } from "@/lib/ui/showToast";

function ErrorBadge() {
  return (
    <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-error">
      <Text className="font-pretendard-semibold text-[18px] leading-[28px] text-white">!</Text>
    </View>
  );
}

export function ClothesAnalysisFailureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    imageUri: imageUriParam,
    imageUrl: imageUrlParam,
    photoId: photoIdParam,
    predictedColor: predictedColorParam,
    predictedCategory: predictedCategoryParam,
  } = useLocalSearchParams<{
    imageUri?: string;
    imageUrl?: string;
    photoId?: string;
    predictedColor?: string;
    predictedCategory?: string;
  }>();
  const imageUri = getParamString(imageUriParam);
  const imageUrl = getParamString(imageUrlParam);
  const photoId = getParamString(photoIdParam);
  const predictedColor = normalizeColorName(getParamString(predictedColorParam));
  const predictedCategory = normalizeCategoryName(getParamString(predictedCategoryParam));

  const handleRetakePhoto = async () => {
    try {
      const nextImageUri = await launchClothesCamera();

      if (!nextImageUri) {
        return;
      }

      router.replace({
        pathname: "/clothes/register/preview",
        params: { imageUri: nextImageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <ClothesRegistrationHeader />

      <View className="flex-1 items-center justify-center pb-[112px]">
        <View>
          <Image
            resizeMode="contain"
            source={ClothesIconImage}
            style={{ height: 157, width: 170 }}
          />
          <View className="absolute right-[20px] top-[-7px]">
            <ErrorBadge />
          </View>
        </View>

        <Text className="mt-[40px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
          분석에 실패했습니다.
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          재촬영 또는 직접 입력해주세요.
        </Text>
      </View>

      <View className="gap-[8px]">
        <Button
          label="재촬영"
          onPress={handleRetakePhoto}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />

        <Button
          label="사용자 입력"
          href={{
            pathname: "/clothes/register/style",
            params: {
              imageUri: imageUri ?? "",
              imageUrl: imageUrl ?? "",
              photoId: photoId ?? "",
              predictedColor,
              predictedCategory,
            },
          }}
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
