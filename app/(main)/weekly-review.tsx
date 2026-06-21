import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";

export default function WeeklyReviewRoute() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-light px-6" style={{ paddingTop: insets.top + 24 }}>
      <View className="h-8 flex-row items-center justify-between">
        <BackButton accessibilityLabel="홈으로 돌아가기" />
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
          주간 회고
        </Text>
        <View className="w-6" />
      </View>
    </View>
  );
}
