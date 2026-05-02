import { Pressable } from "react-native";

import ArrowBackIcon from "../../../assets/arrow_back.svg";

type BackButtonProps = {
  accessibilityLabel?: string;
  onPress: () => void;
};

export function BackButton({
  accessibilityLabel = "이전 페이지로 돌아가기",
  onPress,
}: BackButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <ArrowBackIcon width={24} height={24} />
    </Pressable>
  );
}
