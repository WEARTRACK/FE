import { Href, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { socialLogin, type SocialLoginPayload } from "@/features/entry/api/socialLogin";
import { isValidClosetId } from "@/features/closet/utils/closet-id";
import { fetchOnboardingEntryResolution } from "@/features/onboarding/utils/fetchOnboardingEntryResolution";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";
import { useSessionStore } from "@/stores/useSessionStore";

type UseSocialLoginMutationOptions = {
  successHref?: Href;
};

function getSocialLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인해주세요.";
    }
  }

  return "로그인에 실패했어요. 다시 시도해주세요.";
}

export function useSocialLoginMutation({ successHref }: UseSocialLoginMutationOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);
  const setClosetId = useClosetStore((state) => state.setClosetId);

  return useMutation({
    mutationFn: (payload: SocialLoginPayload) => socialLogin(payload),
    onSuccess: async (result) => {
      setSession(result);
      if (isValidClosetId(result.closetId) || result.closetId === null) {
        setClosetId(result.closetId);
      }

      let nextHref = successHref ?? (result.profileCompleted ? "/home" : "/auth/set-nickname");

      if (result.profileCompleted && nextHref === "/home") {
        const entryResolution = await fetchOnboardingEntryResolution(queryClient);

        if (entryResolution.shouldShowFetchFailureToast) {
          showToast("퀘스트 정보를 불러오지 못했어요. 다시 시도해주세요.");
        }

        nextHref = entryResolution.route;
      }

      router.replace(nextHref as Href);
    },
    onError: (error) => {
      showToast(getSocialLoginErrorMessage(error));
    },
  });
}
