import { Pressable, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { colors } from "@/constants/colors";

type AddQuestItemTileProps = {
  label: string;
  onPress: () => void;
};

export function AddQuestItemTile({ label, onPress }: AddQuestItemTileProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="relative h-[110px] w-[110px] items-center justify-center rounded-[13.2px] bg-white"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View className="absolute inset-0">
        <Svg height="110" width="110">
          <Rect
            x="0.275"
            y="0.275"
            width="109.45"
            height="109.45"
            rx="13.2"
            fill="none"
            stroke={colors.text.subdued}
            strokeDasharray="4 4"
            strokeWidth="0.55"
          />
        </Svg>
      </View>
      <Text className="font-pretendard text-[28px] leading-[28px] text-text-subdued">+</Text>
    </Pressable>
  );
}
