import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryLogo } from "@/features/entry/components/EntryLogo";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/auth" as Href);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <View className="flex-1 items-center justify-center px-6">
        <EntryLogo showSubtitle={false} size="splash" />
      </View>
    </SafeAreaView>
  );
}
