import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { socialLogin, type SocialLoginPayload } from "@/features/entry/api/socialLogin";
import { completePostLoginTransition } from "@/features/entry/utils/completePostLoginTransition";
import type { PostLoginIntentSuccessHref } from "@/features/entry/utils/resolvePostLoginRoute";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";
import { useSessionStore } from "@/stores/useSessionStore";

type UseSocialLoginMutationOptions = {
  successHref?: PostLoginIntentSuccessHref;
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
      try {
        await completePostLoginTransition({
          intentSuccessHref: successHref,
          queryClient,
          result,
          setSession,
          setClosetId,
          showLoginFailureToast: () => showToast("로그인에 실패했어요. 다시 시도해주세요."),
          showOnboardingFetchFailureToast: () =>
            showToast("퀘스트 정보를 불러오지 못했어요. 다시 시도해주세요."),
          navigate: (href) => router.replace(href),
        });
      } catch (error) {
        showToast(getSocialLoginErrorMessage(error));
        router.replace("/auth");
      }
    },
    onError: (error) => {
      showToast(getSocialLoginErrorMessage(error));
    },
  });
}
