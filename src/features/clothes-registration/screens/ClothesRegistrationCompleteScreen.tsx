import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import { Button } from "@/components/common/Button";
import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";

export function ClothesRegistrationCompleteScreen() {
  const insets = useSafeAreaInsets();
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);

  const handlePressClothesCapture = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressClothesImageSelect = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressShoppingMallLink = () => {
    setIsClothesGuideVisible(false);
    router.push(clothesRegistrationRoutes.shoppingMallTerms);
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
