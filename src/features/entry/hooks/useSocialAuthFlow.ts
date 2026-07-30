import { useCallback, useState } from "react";

import type { SocialAuthProvider } from "@/features/entry/api/socialLogin";
import { useSocialLoginMutation } from "@/features/entry/hooks/useSocialLoginMutation";
import {
  createNativeSocialLoginPayload,
  isNativeSocialAuthCancelledError,
} from "@/features/entry/oauth/nativeSocialAuth";
import { saveSocialAuthIntent } from "@/features/entry/oauth/socialAuthIntentStorage";
import type { PostLoginIntentSuccessHref } from "@/features/entry/utils/resolvePostLoginRoute";
import { showToast } from "@/lib/ui/showToast";

type UseSocialAuthFlowParams = {
  successHref?: PostLoginIntentSuccessHref;
};

export function useSocialAuthFlow({ successHref }: UseSocialAuthFlowParams = {}) {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const socialLoginMutation = useSocialLoginMutation({ successHref });

  const startSocialAuth = useCallback(
    async (provider: SocialAuthProvider) => {
      if (isAuthorizing || socialLoginMutation.isPending) {
        return;
      }

      setIsAuthorizing(true);

      try {
        await saveSocialAuthIntent({
          successHref: successHref ?? null,
        });
        const payload = await createNativeSocialLoginPayload(provider);
        try {
          await socialLoginMutation.mutateAsync(payload);
        } catch {
          // useSocialLoginMutation shows the API failure toast.
        }
      } catch (error) {
        if (isNativeSocialAuthCancelledError(error)) {
          return;
        }

        showToast("로그인에 실패했어요. 다시 시도해주세요.");
      } finally {
        setIsAuthorizing(false);
      }
    },
    [isAuthorizing, socialLoginMutation, successHref],
  );

  return {
    isPending: isAuthorizing || socialLoginMutation.isPending,
    startSocialAuth,
  };
}
