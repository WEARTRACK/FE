import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/colors";
import { socialLogin, type SocialAuthProvider } from "@/features/entry/api/socialLogin";
import {
  clearSocialAuthIntent,
  getSocialAuthIntent,
} from "@/features/entry/oauth/socialAuthIntentStorage";
import { completePostLoginTransition } from "@/features/entry/utils/completePostLoginTransition";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";
import { useSessionStore } from "@/stores/useSessionStore";

const providers: SocialAuthProvider[] = ["GOOGLE", "KAKAO", "NAVER", "APPLE"];

function normalizeValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveProvider(value: string | string[] | undefined): SocialAuthProvider | null {
  const normalizedProvider = normalizeValue(value)?.toUpperCase();

  return providers.find((provider) => provider === normalizedProvider) ?? null;
}

function getSocialLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.code === "NETWORK_ERROR") {
    return "네트워크 연결을 확인해주세요.";
  }

  return "로그인에 실패했어요. 다시 시도해주세요.";
}

export function SocialAuthCallbackScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const hasHandledCallbackRef = useRef(false);
  const setSession = useSessionStore((state) => state.setSession);
  const setClosetId = useClosetStore((state) => state.setClosetId);

  useEffect(() => {
    if (hasHandledCallbackRef.current) {
      return;
    }

    const provider = resolveProvider(params.provider);
    const handoffToken = normalizeValue(params.handoff) ?? normalizeValue(params.handoffToken);

    if (!provider || !handoffToken) {
      hasHandledCallbackRef.current = true;
      showToast("로그인에 실패했어요. 다시 시도해주세요.");
      router.replace("/auth");
      return;
    }

    hasHandledCallbackRef.current = true;
    const validProvider = provider;
    const validHandoffToken = handoffToken;

    async function completeSocialLogin() {
      try {
        const intent = await getSocialAuthIntent();
        const result = await socialLogin({
          provider: validProvider,
          handoffToken: validHandoffToken,
        });
        await clearSocialAuthIntent();

        await completePostLoginTransition({
          intentSuccessHref: intent?.successHref,
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
        await clearSocialAuthIntent();
        showToast(getSocialLoginErrorMessage(error));
        router.replace("/auth");
      }
    }

    void completeSocialLogin();
  }, [
    params.handoff,
    params.handoffToken,
    params.provider,
    queryClient,
    router,
    setClosetId,
    setSession,
  ]);

  return (
    <View className="flex-1 items-center justify-center bg-bg-light">
      <ActivityIndicator color={colors.bg.dark} />
    </View>
  );
}
