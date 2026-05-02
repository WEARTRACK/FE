import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/common/Button";

export function ClosetStatsPlaceholderScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg-light px-6 pb-8 pt-20">
      <Text className="font-pretendard-semibold text-headline text-text-subdued">옷장 전체 정보</Text>

      <View className="mt-6 rounded-2xl bg-white p-5">
        <Text className="font-pretendard text-body text-text-subdued">
          1.3.2 통계 페이지는 아직 구현 전입니다.
        </Text>
        <Text className="mt-2 font-pretendard text-body text-text-subdued">
          Task 1에서는 옷장 열기 버튼 라우팅 경로만 먼저 연결했습니다.
        </Text>
      </View>

      <View className="mt-auto">
        <Button
          fullWidth
          label="내 옷장으로"
          onPress={() => router.replace("/closet")}
          size="lg"
          variant="secondary"
        />
      </View>
    </View>
  );
}
