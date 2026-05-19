import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ClothesRegistrationRouteScaffold } from "@/features/clothes-registration/screens/ClothesRegistrationRouteScaffold";
import { launchClothesCamera } from "@/features/clothes-registration/utils/launchClothesCamera";
import { showToast } from "@/lib/ui/showToast";

export function ClosetCaptureGuideScreen() {
  const router = useRouter();

  const handleTakePhoto = async () => {
    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        return;
      }

      router.push({
        pathname: "/closet/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <ClothesRegistrationRouteScaffold
      step="1.1.1-A"
      title="옷장 등록하기"
      description="옷장 전체와 보관 칸이 함께 보이도록 촬영하는 단계입니다."
      actions={[
        {
          label: "촬영하기",
          onPress: handleTakePhoto,
        },
      ]}
    >
      <View className="items-center rounded-lg bg-white px-6 py-8">
        <View className="h-[220px] w-[160px] items-center justify-center rounded-lg bg-cool">
          <Text className="font-pretendard text-body text-text-subdued">촬영 안내 이미지</Text>
        </View>
        <Text className="mt-6 text-center font-pretendard text-body text-text">
          옷장 이미지가 잘 보이도록 정면에서 촬영해주세요.
        </Text>
      </View>
    </ClothesRegistrationRouteScaffold>
  );
}
