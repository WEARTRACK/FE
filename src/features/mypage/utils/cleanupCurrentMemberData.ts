import type { QueryClient } from "@tanstack/react-query";

import { clearShoppingMallTermsAgreement } from "@/features/clothes-registration/data/shopping-mall-terms-agreement";
import { clearSocialAuthIntent } from "@/features/entry/oauth/socialAuthIntentStorage";
import { clearNotificationTokenSyncStateForMember } from "@/features/notifications/utils/notification-token-sync";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";
import { useClosetStore } from "@/stores/useClosetStore";
import { useQuestRegistrationStore } from "@/stores/useQuestRegistrationStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useShoppingMallRegistrationStore } from "@/stores/useShoppingMallRegistrationStore";

type CleanupCurrentMemberDataParams = {
  memberId: number | null;
  queryClient: QueryClient;
};

async function runCleanupStep(label: string, task: () => unknown | Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.warn(`[AuthCleanup] Failed to clear ${label}`, error);
  }
}

export async function cleanupCurrentMemberData({
  memberId,
  queryClient,
}: CleanupCurrentMemberDataParams) {
  await runCleanupStep("query cache", () => {
    queryClient.clear();
  });
  await runCleanupStep("closet store", () => {
    useClosetStore.getState().clearCloset();
  });
  await runCleanupStep("closet registration draft", () => {
    useClosetRegistrationStore.getState().resetDraft();
  });
  await runCleanupStep("shopping mall registration draft", () => {
    useShoppingMallRegistrationStore.getState().resetDraft();
  });
  await runCleanupStep("quest registration state", () => {
    useQuestRegistrationStore.getState().resetState();
  });
  await runCleanupStep("social auth intent", clearSocialAuthIntent);
  await runCleanupStep("notification token sync state", () =>
    clearNotificationTokenSyncStateForMember(memberId),
  );

  if (memberId !== null) {
    await runCleanupStep("shopping mall terms agreement", () =>
      clearShoppingMallTermsAgreement(memberId),
    );
  }

  await runCleanupStep("session", () => {
    useSessionStore.getState().clearSession();
  });
}
