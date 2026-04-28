import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";

export function SignUpSuccessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6 pt-[235px]"
      style={{ paddingBottom: insets.bottom + 20 }}
    >
      <StatusBar style="dark" />

      <ClosetIcon width={124} height={171} style={{ alignSelf: "center" }} />

      <Text className="mt-[46px] text-center font-pretendard-semibold text-[28px] leading-[34px] text-text">
        만나서 반가워요!
      </Text>
      <Text className="mt-3 text-center font-pretendard text-[14px] leading-[22px] text-text-subdued">
        WEARTRACK과 함께{"\n"}스마트한 옷장 관리를 시작해볼까요?
      </Text>

      <View className="mt-auto">
        <Link href="/auth/set-nickname" replace asChild>
          <Pressable className="h-[56px] items-center justify-center rounded-[12px] bg-bg-dark">
            <Text className="font-pretendard-semibold text-button-lg text-white">
              시작하기
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
