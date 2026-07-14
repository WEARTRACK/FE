import type { QueryClient } from "@tanstack/react-query";

import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";
import { useClosetStore } from "@/stores/useClosetStore";
import { useQuestRegistrationStore } from "@/stores/useQuestRegistrationStore";
import { useShoppingMallRegistrationStore } from "@/stores/useShoppingMallRegistrationStore";

export function resetAuthenticatedClientState(queryClient: QueryClient) {
  queryClient.clear();
  useClosetStore.getState().clearCloset();
  useClosetRegistrationStore.getState().resetDraft();
  useShoppingMallRegistrationStore.getState().resetDraft();
  useQuestRegistrationStore.getState().resetState();
}
