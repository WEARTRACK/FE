import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";

function AnalysisResultHeader() {
  return (
    <View className="items-top mt-[24px] flex-row">
      <View className="h-[100px] w-[100px] items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white">
        <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
          이미지
        </Text>
      </View>

      <View className="ml-[18px]">
        <Text className="font-pretendard text-[12px] leading-[20px] text-bg-dark">
          AI 분석 결과
        </Text>
        <View className="mt-[8px] flex-row gap-[6px]">
          <View className="h-[32px] min-w-[70px] items-center justify-center rounded-full bg-bg-dark px-[18px]">
            <Text className="font-pretendard text-[12px] leading-[16px] text-white">Black</Text>
          </View>
          <View className="h-[32px] min-w-[78px] items-center justify-center rounded-full bg-primary px-[18px]">
            <Text className="font-pretendard text-[12px] leading-[16px] text-accent">T-shirt</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ClothesAnalysisResultScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24 }}
        contentContainerClassName="px-6 pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <HeaderLogo width={118} height={15} />

        <Text className="mt-[34px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          분석이 완료됐습니다.
        </Text>

        <AnalysisResultHeader />

        <ClothesStyleSelector />
      </ScrollView>

      <View className="px-6">
        <Button
          label="다음"
          href={clothesRegistrationRoutes.clothesAdditionalInfo}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
