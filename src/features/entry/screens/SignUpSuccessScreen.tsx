import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { termsRoutes } from "@/features/terms/routes";
import ClosetIcon from "../../../../assets/closet-icon.svg";

export function SignUpSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center bg-bg-light px-6 pt-[235px]"
      style={{ paddingBottom: insets.bottom + 20 }}
    >
      <StatusBar style="dark" />

      <ClosetIcon width={123.82} height={171.25} style={{ alignSelf: "center" }} />

      <Text className="mt-[46px] text-center font-pretendard-semibold text-[28px] leading-[34px] tracking-[-0.5px] text-text">
        만나서 반가워요!
      </Text>
      <Text className="mt-3 text-center font-pretendard text-[14px] leading-[22px] tracking-[-0.5px] text-text-subdued">
        WEARTRACK과 함께{"\n"}스마트한 옷장 관리를 시작해볼까요?
      </Text>

      <View className="mt-auto w-full">
        <Button
          label="시작하기"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => {
            router.replace(termsRoutes.authAgreement);
          }}
        />
      </View>
    </View>
  );
}
