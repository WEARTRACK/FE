import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { colors } from "@/constants/colors";
import { hasValidAuthenticatedSession } from "@/stores/sessionState";
import { useSessionStore } from "@/stores/useSessionStore";

export default function MainLayout() {
  const hasSession = useSessionStore(hasValidAuthenticatedSession);
  const [hasHydrated, setHasHydrated] = useState(useSessionStore.persist.hasHydrated());

  useEffect(() => {
    let active = true;
    const markHydrated = () => {
      if (active) {
        setHasHydrated(true);
      }
    };
    const unsubscribe = useSessionStore.persist.onFinishHydration(() => {
      markHydrated();
    });

    if (!useSessionStore.persist.hasHydrated()) {
      void Promise.resolve(useSessionStore.persist.rehydrate())
        .catch(() => undefined)
        .then(markHydrated);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!hasHydrated) {
    return null;
  }

  if (!hasSession) {
    return <Redirect href="/auth" />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.light },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
