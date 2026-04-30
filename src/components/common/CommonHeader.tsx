import { Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../assets/headerLogo.svg";

type CommonHeaderProps = {
  homeHref?: Href;
};

export function CommonHeader({ homeHref = "/home" as Href }: CommonHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-bg-light px-6"
      style={{
        height: insets.top + 24 + 15,
        paddingTop: insets.top + 24,
      }}
    >
      <Pressable
        accessibilityLabel="홈으로 이동"
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => router.replace(homeHref)}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <HeaderLogo width={118} height={15} />
      </Pressable>
    </View>
  );
}
