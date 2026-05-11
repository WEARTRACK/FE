import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

export function ClosetPhotoPreviewScreen() {
  const insets = useSafeAreaInsets();

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

      <View className="mt-[32px] h-[422px] items-center justify-center bg-white">
        <Text className="font-pretendard-semibold text-[20px] leading-[28px] text-disabled">
          이미지
        </Text>
      </View>

      <View className="mt-auto gap-[10px]">
        <Button
          label="사용하기"
          // Temporary template-selection flow until closet AI analysis is restored.
          href={clothesRegistrationRoutes.select}
          variant="primary"
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />

        <Button
          label="재촬영하기"
          href="/home"
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
