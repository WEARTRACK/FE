import { Href, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { socialLogin, type SocialLoginPayload } from "@/features/entry/api/socialLogin";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
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
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: SocialLoginPayload) => socialLogin(payload),
    onSuccess: (result) => {
      setSession(result);

      const nextHref = successHref ?? (result.profileCompleted ? "/home" : "/auth/set-nickname");
      router.replace(nextHref as Href);
    },
    onError: (error) => {
      showToast(getSocialLoginErrorMessage(error));
    },
  });
}
