import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import ClosetIcon from "../../../../assets/closet-icon.svg";
import { Button } from "@/components/common/Button";

export function ClosetRegistrationCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="h-[32px] flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="뒤로가기"
          hitSlop={12}
          onPress={() => router.replace("/home")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text className="font-pretendard text-[32px] leading-[32px] text-bg-dark">‹</Text>
        </Pressable>
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          옷장등록
        </Text>
        <View className="w-[32px]" />
      </View>

      <View className="flex-1 items-center justify-center pb-[112px]">
        <View>
          <ClosetIcon width={124} height={171} />
          <View className="absolute right-[-7px] top-[-9px]">
            <CheckActiveIcon width={28} height={28} />
          </View>
        </View>

        <Text className="mt-[30px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
          옷장 등록이 완료됐습니다.
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
          label="옷 등록하러 가기"
          href="/clothes/register"
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
