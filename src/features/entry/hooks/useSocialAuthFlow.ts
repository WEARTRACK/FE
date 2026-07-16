import { useCallback } from "react";
import { Linking } from "react-native";

import { env } from "@/config/env";
import type { SocialAuthProvider } from "@/features/entry/api/socialLogin";
import { saveSocialAuthIntent } from "@/features/entry/oauth/socialAuthIntentStorage";
import type { PostLoginIntentSuccessHref } from "@/features/entry/utils/resolvePostLoginRoute";
import { showToast } from "@/lib/ui/showToast";

type UseSocialAuthFlowParams = {
  successHref?: PostLoginIntentSuccessHref;
};

export function useSocialAuthFlow({ successHref }: UseSocialAuthFlowParams = {}) {
  const buildAuthorizeEndpoint = useCallback((provider: SocialAuthProvider) => {
    const url = new URL(`/api/auth/social/authorize/${provider.toLowerCase()}`, env.apiBaseUrl);
    url.searchParams.set("client", "MOBILE");
    return url.toString();
  }, []);

  const startSocialAuth = useCallback(
    async (provider: SocialAuthProvider) => {
      try {
        await saveSocialAuthIntent({
          successHref: successHref ?? null,
        });
        await Linking.openURL(buildAuthorizeEndpoint(provider));
      } catch {
        showToast("로그인에 실패했어요. 다시 시도해주세요.");
      }
    },
    [buildAuthorizeEndpoint, successHref],
  );

  return {
    isPending: false,
    startSocialAuth,
  };
}
