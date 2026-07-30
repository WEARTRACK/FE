import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import { Button } from "@/components/common/Button";
import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { useClothesRegistrationGuide } from "@/features/clothes-registration/hooks/useClothesRegistrationGuide";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";

export function ClothesRegistrationCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    closeClothesGuide,
    handlePressClothesCapture,
    handlePressClothesImageSelect,
    isClothesGuideVisible,
    openClothesGuide,
  } = useClothesRegistrationGuide();

  const handlePressShoppingMallLink = () => {
    closeClothesGuide();
    router.push(clothesRegistrationRoutes.shoppingMallLink);
  };

  return (
    <>
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
            <View className="absolute right-[20px] top-[-9px]">
              <CheckActiveIcon width={28} height={28} />
            </View>
          </View>

          <Text className="mt-[42px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
            옷 등록이 완료됐습니다.
          </Text>
        </View>

        <View className="gap-[8px]">
          <Button
            label="내 옷장 확인하기"
            href="/closet"
            fullWidth
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />

          <Button
            label="옷 추가하기"
            onPress={openClothesGuide}
            variant="secondary"
            fullWidth
            className="h-[58px] border-[0.5px] border-text-subdued"
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />
        </View>
      </View>

      <ClothesRegistrationGuideModal
        visible={isClothesGuideVisible}
        onClose={closeClothesGuide}
        onPressCapture={handlePressClothesCapture}
        onPressSelectImage={handlePressClothesImageSelect}
        onPressShoppingMallLink={handlePressShoppingMallLink}
      />
    </>
  );
}
