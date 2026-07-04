import { PropsWithChildren, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { useNotificationSetup } from "@/features/notifications/useNotificationSetup";
import { env } from "@/config/env";
import { queryClient } from "@/lib/queryClient";
import { useClosetStore } from "@/stores/useClosetStore";
import { useSessionStore } from "@/stores/useSessionStore";

export function AppProvider({ children }: PropsWithChildren) {
  useNotificationSetup();

  useEffect(() => {
    if (!env.enableTestAccessToken || !env.testAccessToken || !env.testMemberId) {
      return;
    }

    let isActive = true;
    const testAccessToken = env.testAccessToken;
    const testMemberId = env.testMemberId;
    const testClosetId = env.testClosetId;

    async function hydrateTestSession() {
      if (!useSessionStore.persist.hasHydrated()) {
        await useSessionStore.persist.rehydrate();
      }

      if (!useClosetStore.persist.hasHydrated()) {
        await useClosetStore.persist.rehydrate();
      }

      if (!isActive) {
        return;
      }

      const session = useSessionStore.getState();
      if (!session.accessToken) {
        session.setSession({
          memberId: testMemberId,
          nickname: "테스트",
          profileCompleted: true,
          accessToken: testAccessToken,
          refreshToken: "test-refresh-token",
        });
      }

      if (testClosetId && useClosetStore.getState().closetId === null) {
        useClosetStore.getState().setClosetId(testClosetId);
      }
    }

    void hydrateTestSession();

    return () => {
      isActive = false;
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
