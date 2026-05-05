import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import ArrowBackIcon from "../../../assets/arrow_back.svg";

const HOME_ROUTE = "/home";

type BackButtonProps = {
  accessibilityLabel?: string;
  onPress?: () => void;
};

export function BackButton({
  accessibilityLabel = "이전 페이지로 돌아가기",
  onPress,
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(HOME_ROUTE);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={12}
      onPress={handlePress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <ArrowBackIcon width={24} height={24} />
    </Pressable>
  );
}
