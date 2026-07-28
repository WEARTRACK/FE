import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryLogo } from "@/features/entry/components/EntryLogo";
import { resolvePostLoginRoute } from "@/features/entry/utils/resolvePostLoginRoute";
import { fetchOnboardingEntryResolution } from "@/features/onboarding/utils/fetchOnboardingEntryResolution";
import { queryClient } from "@/lib/queryClient";
import { useSessionStore } from "@/stores/useSessionStore";

function waitForMinimumSplashDuration() {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function resolveInitialRoute() {
      await waitForMinimumSplashDuration();

      if (!useSessionStore.persist.hasHydrated()) {
        await useSessionStore.persist.rehydrate();
      }

      const session = useSessionStore.getState();

      if (!session.accessToken && !session.refreshToken) {
        return "/auth" as Href;
      }

      const routeResolution = resolvePostLoginRoute({
        requiredTermsAgreed: session.requiredTermsAgreed,
        profileCompleted: session.profileCompleted,
      });

      if (!routeResolution.isValid) {
        return "/auth" as Href;
      }

      if (!routeResolution.requiresOnboardingResolution) {
        return routeResolution.route;
      }

      const entryResolution = await fetchOnboardingEntryResolution(queryClient);
      const refreshedSession = useSessionStore.getState();

      if (!refreshedSession.accessToken && !refreshedSession.refreshToken) {
        return "/auth" as Href;
      }

      return entryResolution.route;
    }

    void resolveInitialRoute().then((route) => {
      if (active) {
        router.replace(route);
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <View className="flex-1 items-center justify-center px-6">
        <EntryLogo showSubtitle={false} size="splash" />
      </View>
    </SafeAreaView>
  );
}
