export const notificationQueryKeys = {
  all: ["notifications"] as const,
  member: (memberId: number) => [...notificationQueryKeys.all, "member", memberId] as const,
  list: (memberId: number, page: number, size: number) =>
    [...notificationQueryKeys.member(memberId), "list", page, size] as const,
  settings: (memberId: number) => [...notificationQueryKeys.member(memberId), "settings"] as const,
};
