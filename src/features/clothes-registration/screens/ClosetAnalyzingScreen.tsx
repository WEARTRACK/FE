import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

export function ClosetAnalyzingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(clothesRegistrationRoutes.result);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View
      className="flex-1 items-center bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="flex-1 items-center justify-center pb-[112px]">
        <ClosetIcon width={124} height={171} />

        <Text className="font-pretendard-bold mt-[52px] text-center text-[20px] leading-[28px] text-text">
          AI가 옷장을 분석하고 있어요..
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          잠시만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}
