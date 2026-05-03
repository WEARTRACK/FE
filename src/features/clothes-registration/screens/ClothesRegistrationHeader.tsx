import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function ClothesRegistrationHeader({ title = "옷등록" }: { title?: string }) {
  const router = useRouter();

  return (
    <View className="h-[32px] flex-row items-center justify-between">
      <Pressable
        accessibilityLabel="뒤로가기"
        hitSlop={12}
        onPress={() => router.back()}
        style={({ pressed }) => ({
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <Text className="font-pretendard text-[32px] leading-[32px] text-bg-dark">‹</Text>
      </Pressable>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
        {title}
      </Text>
      <View className="w-[32px]" />
    </View>
  );
}
