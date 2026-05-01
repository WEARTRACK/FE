import { Href } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";

import { env } from "@/config/env";
import type { SocialAuthProvider } from "@/features/entry/api/socialLogin";
import { useSocialLoginMutation } from "@/features/entry/hooks/useSocialLoginMutation";
import { parseOAuthCallback } from "@/features/entry/oauth/parseOAuthCallback";
import { showToast } from "@/lib/ui/showToast";

type UseSocialAuthFlowParams = {
  successHref?: Href;
};

export function useSocialAuthFlow({ successHref }: UseSocialAuthFlowParams = {}) {
  const socialLoginMutation = useSocialLoginMutation({ successHref });
  const handledCallbackUrlsRef = useRef(new Set<string>());

  const buildAuthorizeEndpoint = useCallback((provider: SocialAuthProvider) => {
    const url = new URL(`/api/auth/social/authorize/${provider.toLowerCase()}`, env.apiBaseUrl);
    url.searchParams.set("client", "MOBILE");
    return url.toString();
  }, []);

  const handleOAuthCallback = useCallback(
    async (callbackUrl: string) => {
      if (handledCallbackUrlsRef.current.has(callbackUrl)) {
        return;
      }

      const result = parseOAuthCallback(callbackUrl);

      if (!result) {
        return;
      }

      handledCallbackUrlsRef.current.add(callbackUrl);

      if (result.type === "error") {
        showToast("로그인에 실패했어요. 다시 시도해주세요.");
        return;
      }

      socialLoginMutation.mutate({
        provider: result.provider,
        handoffToken: result.handoffToken,
      });
    },
    [socialLoginMutation],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleOAuthCallback(url);
    });

    void Linking.getInitialURL().then((url) => {
      if (url) {
        void handleOAuthCallback(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleOAuthCallback]);

  const startSocialAuth = useCallback(async (provider: SocialAuthProvider) => {
    try {
      await Linking.openURL(buildAuthorizeEndpoint(provider));
    } catch {
      showToast("로그인에 실패했어요. 다시 시도해주세요.");
    }
  }, [buildAuthorizeEndpoint]);

  return {
    isPending: socialLoginMutation.isPending,
    startSocialAuth,
  };
}
