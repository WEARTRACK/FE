import { Text, View } from "react-native";

import { env } from "@/config/env";
import { useSessionStore } from "@/stores/useSessionStore";

export default function HomeScreen() {
  const incrementLaunchCount = useSessionStore((state) => state.incrementLaunchCount);
  const launchCount = useSessionStore((state) => state.launchCount);

  return (
    <View className="flex-1 bg-surface px-6 pt-24">
      <View className="rounded-3xl bg-brand p-6 shadow-sm">
        <Text className="text-3xl font-semibold text-brand-foreground">WEARTRACK</Text>
        <Text className="mt-2 text-base leading-6 text-brand-foreground">
          Expo Router, NativeWind, TanStack Query, Zustand, Axios, AsyncStorage setup is ready.
        </Text>
      </View>

      <View className="mt-6 rounded-3xl bg-white p-6">
        <Text className="text-sm font-medium uppercase tracking-[1px] text-muted">Environment</Text>
        <Text className="mt-2 text-base text-ink">{env.apiBaseUrl}</Text>
      </View>

      <View className="mt-4 rounded-3xl bg-white p-6">
        <Text className="text-sm font-medium uppercase tracking-[1px] text-muted">
          Zustand Store
        </Text>
        <Text className="mt-2 text-base text-ink">App launches counted locally: {launchCount}</Text>
        <Text
          className="mt-3 text-base font-semibold text-brand-dark"
          onPress={incrementLaunchCount}
        >
          Increase launch count
        </Text>
      </View>
    </View>
  );
}
