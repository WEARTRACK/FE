import { useQuery } from "@tanstack/react-query";

import { getMemberProfile } from "@/features/mypage/api/getMemberProfile";
import { memberQueryKeys } from "@/features/mypage/hooks/memberQueryKeys";
import { useSessionStore } from "@/stores/useSessionStore";

export function useMemberProfile() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);

  return useQuery({
    queryKey: memberId ? memberQueryKeys.detail(memberId) : memberQueryKeys.detail(0),
    queryFn: getMemberProfile,
    enabled: Boolean(accessToken && memberId),
    retry: false,
    refetchOnMount: true,
  });
}
