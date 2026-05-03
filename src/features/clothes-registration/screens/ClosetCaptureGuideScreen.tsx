import { Text, View } from "react-native";

import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesRegistrationRouteScaffold } from "@/features/clothes-registration/screens/ClothesRegistrationRouteScaffold";

export function ClosetCaptureGuideScreen() {
  return (
    <ClothesRegistrationRouteScaffold
      step="1.1.1-A"
      title="옷장 등록하기"
      description="옷장 전체와 보관 칸이 함께 보이도록 촬영하는 단계입니다."
      actions={[
        {
          label: "촬영하기",
          href: clothesRegistrationRoutes.preview,
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

