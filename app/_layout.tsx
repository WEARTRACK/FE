import "../global.css";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/providers/AppProvider";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PretendardLight: require("../assets/fonts/Pretendard-Light.otf"),
    PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
    PretendardRegular: require("../assets/fonts/Pretendard-Regular.otf"),
  });

  const layout = (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProvider>
    </SafeAreaProvider>
  );

  if (error) {
    console.error("Failed to load custom fonts", error);
  }

  if (!loaded && !error) {
    return layout;
  }

  return layout;
}
