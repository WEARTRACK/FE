import { useQuery } from "@tanstack/react-query";

import { fetchNotifications } from "@/features/notifications/api/notification-api";
import { notificationQueryKeys } from "@/features/notifications/api/notification-query-keys";
import type { NotificationListQuery } from "@/features/notifications/api/notification-api-types";
import { useSessionStore } from "@/stores/useSessionStore";

export function useNotifications(query: NotificationListQuery = {}) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);
  const page = query.page ?? 0;
  const size = query.size ?? 10;

  return useQuery({
    queryKey: memberId
      ? notificationQueryKeys.list(memberId, page, size)
      : notificationQueryKeys.list(0, page, size),
    queryFn: () => fetchNotifications({ page, size }),
    enabled: Boolean(accessToken && memberId),
    refetchOnMount: true,
  });
}
