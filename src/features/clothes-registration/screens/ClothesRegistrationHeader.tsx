import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import ArrowBackIcon from "../../../../assets/arrow_back.svg";

export function ClothesRegistrationHeader({ title = "옷 등록" }: { title?: string }) {
  const router = useRouter();

  return (
    <View className="h-[32px] flex-row items-center justify-between">
      <Pressable
        accessibilityLabel="뒤로가기"
        hitSlop={12}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace("/home");
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <ArrowBackIcon width={24} height={24} />
      </Pressable>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
        {title}
      </Text>
      <View className="w-[32px]" />
    </View>
  );
}
