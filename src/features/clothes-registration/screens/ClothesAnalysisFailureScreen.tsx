import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClothesIcon from "../../../../assets/clothes-icon.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";

function ErrorBadge() {
  return (
    <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-error">
      <Text className="font-pretendard-semibold text-[18px] leading-[28px] text-white">!</Text>
    </View>
  );
}

export function ClothesAnalysisFailureScreen() {
  const insets = useSafeAreaInsets();

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
          <ClothesIcon width={170} height={157} />
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
          href={clothesRegistrationRoutes.clothesPreview}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />

        <Button
          label="사용자 입력"
          href={clothesRegistrationRoutes.clothesAdditionalInfo}
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
