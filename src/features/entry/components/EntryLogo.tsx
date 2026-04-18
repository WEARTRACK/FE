import { Text, View } from "react-native";

import MainLogo from "../../../../assets/mainLogo.svg";

type EntryLogoProps = {
  subtitle?: string;
  showSubtitle?: boolean;
  size?: "splash" | "default";
  subtitleClassName?: string;
};

export function EntryLogo({
  subtitle = "스마트한 옷장 관리를 시작",
  showSubtitle = true,
  size = "default",
  subtitleClassName,
}: EntryLogoProps) {
  const logoSize = size === "splash" ? { width: 183, height: 124 } : { width: 183, height: 124 };

  return (
    <View className="items-center">
      <MainLogo width={logoSize.width} height={logoSize.height} />
      {showSubtitle ? (
        <Text
          className={[
            "mt-5 font-pretendard text-[16px] leading-[20px] tracking-[-0.5px] text-primary",
            subtitleClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
