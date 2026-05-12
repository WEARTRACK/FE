import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { launchClothesCamera } from "@/features/clothes-registration/utils/launchClothesCamera";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { showToast } from "@/lib/ui/showToast";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";

export function ClosetPhotoPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUri: imageUriParam } = useLocalSearchParams<{ imageUri?: string }>();
  const imageUri = getParamString(imageUriParam);
  const setClosetDraft = useClosetRegistrationStore((state) => state.setDraft);

  const handleUsePhoto = () => {
    if (!imageUri) {
      showToast("사진을 먼저 촬영해주세요.");
      return;
    }

    setClosetDraft({
      imageUri,
      imageUrl: null,
      predictedSections: [],
      templateId: null,
    });

    router.push({
      pathname: "/closet/register/select",
      params: { imageUri },
    });
  };

  const handleRetakePhoto = async () => {
    try {
      const nextImageUri = await launchClothesCamera();
      if (!nextImageUri) {
        return;
      }

      setClosetDraft({
        imageUri: nextImageUri,
        imageUrl: null,
        predictedSections: [],
        templateId: null,
      });

      router.replace({
        pathname: "/closet/register/preview",
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
      <HeaderLogo width={118} height={15} />

      <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-bg-dark">
        옷장이 촬영됐습니다.
      </Text>

      <View className="mt-[32px] h-[422px] items-center justify-center overflow-hidden bg-white">
        {imageUri ? (
          <Image className="h-full w-full" resizeMode="cover" source={{ uri: imageUri }} />
        ) : (
          <Text className="font-pretendard-semibold text-[20px] leading-[28px] text-disabled">
            이미지
          </Text>
        )}
      </View>

      <View className="mt-auto gap-[10px]">
        <Button
          label="사용하기"
          onPress={handleUsePhoto}
          variant="primary"
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />

        <Button
          label="재촬영하기"
          onPress={handleRetakePhoto}
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
