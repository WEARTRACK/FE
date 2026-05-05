import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";

export function ClothesStyleSelectionScreen() {
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

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          색상 및 카테고리를 선택해주세요.
        </Text>

        <View className="mt-[24px] h-[88px] w-[88px] items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white">
          <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
            이미지
          </Text>
        </View>

        <ClothesStyleSelector />
      </ScrollView>

      <View className="px-6">
        <Button
          label="저장하기"
          href={clothesRegistrationRoutes.clothesComplete}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
