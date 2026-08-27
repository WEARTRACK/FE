import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from "@/features/notifications/api/notification-api";
import { notificationQueryKeys } from "@/features/notifications/api/notification-query-keys";
import type { NotificationSettings } from "@/features/notifications/api/notification-api-types";
import { refreshNotificationTokenSync } from "@/features/notifications/utils/notification-token-sync";
import { useSessionStore } from "@/stores/useSessionStore";

export function useNotificationSettings() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId
      ? notificationQueryKeys.settings(memberId)
      : notificationQueryKeys.settings(0),
    queryFn: fetchNotificationSettings,
    enabled: Boolean(accessToken && memberId),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const memberId = useSessionStore((state) => state.memberId);

  return useMutation<NotificationSettings, Error, NotificationSettings>({
    mutationFn: updateNotificationSettings,
    onSuccess: (settings) => {
      if (!memberId) {
        return;
      }

      queryClient.setQueryData(notificationQueryKeys.settings(memberId), settings);
      refreshNotificationTokenSync();
    },
  });
}
