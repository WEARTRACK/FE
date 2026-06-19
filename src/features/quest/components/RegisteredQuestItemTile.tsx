import { Image, type ImageSourcePropType, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import { colors } from "@/constants/colors";

type RegisteredQuestItemTileProps = {
  accessibilityLabel: string;
  imageSource: ImageSourcePropType;
  isComplete: boolean;
};

export function RegisteredQuestItemTile({
  accessibilityLabel,
  imageSource,
  isComplete,
}: RegisteredQuestItemTileProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={[
        "relative h-[110px] w-[110px] overflow-hidden rounded-[13.2px] bg-cool",
        isComplete ? "border-[1.1px] border-bg-dark" : "",
      ].join(" ")}
    >
      <Image className="h-full w-full" resizeMode="cover" source={imageSource} />

      {isComplete ? (
        <View className="absolute right-[8px] top-[8px]">
          <CheckActiveIcon width={31} height={31} />
        </View>
      ) : (
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
              strokeWidth="0.55"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}
