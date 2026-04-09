import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/auth/sign-in");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand px-6">
      <Text className="text-4xl font-semibold tracking-[3px] text-brand-foreground">WEARTRACK</Text>
      <Text className="mt-3 text-base text-brand-foreground/80">
        Your AI-powered digital closet
      </Text>
      <ActivityIndicator className="mt-8" color="#F8FAFC" />
    </View>
  );
}
