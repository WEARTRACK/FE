import { cleanupCurrentMemberData } from "@/features/mypage/utils/cleanupCurrentMemberData";
import { queryClient } from "@/lib/queryClient";
import { useSessionStore } from "@/stores/useSessionStore";

let sessionExpirationPromise: Promise<void> | null = null;

export function expireCurrentSession() {
  if (!sessionExpirationPromise) {
    const memberId = useSessionStore.getState().memberId;

    sessionExpirationPromise = cleanupCurrentMemberData({
      memberId,
      queryClient,
    }).finally(() => {
      sessionExpirationPromise = null;
    });
  }

  return sessionExpirationPromise;
}
