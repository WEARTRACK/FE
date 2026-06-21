import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import ArrowBackIcon from "../../../../assets/arrow_back.svg";

type ClosetRegistrationHeaderProps = {
  title?: string;
  onPressBack?: () => void;
  variant?: "default" | "compact";
};

export function ClosetRegistrationHeader({
  title = "옷장 등록",
  onPressBack,
  variant = "default",
}: ClosetRegistrationHeaderProps) {
  const router = useRouter();
  const isCompact = variant === "compact";

  const handlePressBack = () => {
    if (onPressBack) {
      onPressBack();
      return;
    }

    router.back();
  };

  return (
    <View
      className={
        isCompact
          ? "h-9 flex-row items-center justify-between"
          : "h-[32px] flex-row items-center justify-between"
      }
    >
      <Pressable
        accessibilityLabel="뒤로가기"
        hitSlop={12}
        onPress={handlePressBack}
        style={({ pressed }) => ({
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <ArrowBackIcon width={24} height={24} />
      </Pressable>
      <Text
        className={
          isCompact
            ? "font-pretendard-semibold text-[14px] leading-[20px] text-text"
            : "font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued"
        }
      >
        {title}
      </Text>
      <View className={isCompact ? "w-5" : "w-[32px]"} />
    </View>
  );
}
