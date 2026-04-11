import "../global.css";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/providers/AppProvider";

export default function RootLayout() {
  const [loaded] = useFonts({
    PretendardSemiBold: require("../assets/fonts/Pretendard-SemiBold.otf"),
    PretendardRegular: require("../assets/fonts/Pretendard-Regular.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProvider>
    </SafeAreaProvider>
  );
}
