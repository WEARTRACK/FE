import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronRightIcon from "../../../../assets/chevron_right.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

export function ShoppingMallTermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 84,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-1">
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
          이용 약관 동의
        </Text>
        <Text className="mt-[18px] font-pretendard text-[13px] leading-[20px] text-text-subdued">
          외부 쇼핑몰 연동을 위한 약관에 동의해주세요.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isAgreed }}
          className={[
            "mt-[52px] h-[62px] flex-row items-center justify-between rounded-lg border-[0.5px] bg-white px-[25px]",
            isAgreed ? "border-text-subdued" : "border-cool",
          ].join(" ")}
          onPress={() => setIsAgreed((current) => !current)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <Text className="font-pretendard text-[14px] leading-[20px] text-text-subdued">
            [필수] 외부 쇼핑몰 연동 약관
          </Text>
          <ChevronRightIcon width={24} height={24} />
        </Pressable>
      </View>

      <Button
        label="동의하고 계속하기"
        disabled={!isAgreed}
        fullWidth
        className="h-[62px]"
        textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        onPress={() => router.push(clothesRegistrationRoutes.shoppingMallLink)}
      />
    </View>
  );
}
