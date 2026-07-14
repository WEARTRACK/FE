import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronRightIcon from "../../../../assets/chevron_right.svg";
import { Button } from "@/components/common/Button";
import { saveTermsAgreement } from "@/features/entry/api/saveTermsAgreement";
import { resetAuthenticatedClientState } from "@/features/entry/utils/resetAuthenticatedClientState";
import { preservePendingNotificationTokenDeletionForMember } from "@/features/notifications/utils/notification-token-sync";
import { resolvePostLoginRoute } from "@/features/entry/utils/resolvePostLoginRoute";
import { fetchOnboardingEntryResolution } from "@/features/onboarding/utils/fetchOnboardingEntryResolution";
import { termsRoutes } from "@/features/terms/routes";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useSessionStore } from "@/stores/useSessionStore";

function AgreementCheckIcon({ checked }: { checked: boolean }) {
  return (
    <View className="h-4 w-4 items-center justify-center rounded-full border border-text-subdued">
      {checked ? <View className="h-3 w-3 rounded-full bg-text-subdued" /> : null}
    </View>
  );
}

function TermsRow({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      className="h-[58px] flex-row items-center justify-between rounded border-[0.5px] border-cool bg-white px-6"
      hitSlop={8}
      onPress={() => {
        if (disabled) {
          return;
        }

        onPress();
      }}
      style={({ pressed }) => ({ opacity: !disabled && pressed ? 0.72 : 1 })}
    >
      <Text className="font-pretendard text-heading text-text-subdued">{label}</Text>
      <ChevronRightIcon height={24} width={24} />
    </Pressable>
  );
}

function getTermsAgreementErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인해주세요.";
    }
  }

  return "동의 처리에 실패했어요. 다시 시도해주세요.";
}

export function TermsAgreementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const submitLockRef = useRef(false);
  const clearSession = useSessionStore((state) => state.clearSession);
  const memberId = useSessionStore((state) => state.memberId);
  const profileCompleted = useSessionStore((state) => state.profileCompleted);
  const persistedAgreement = useSessionStore((state) => state.requiredTermsAgreed);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const [isAgreed, setIsAgreed] = useState(persistedAgreement);
  const resetToAuth = () => {
    if (router.canDismiss()) {
      router.dismissAll();
    }

    router.replace("/auth");
  };
  const handleAuthFailure = async () => {
    try {
      await preservePendingNotificationTokenDeletionForMember(memberId);
    } catch (error) {
      console.warn("[Auth] Failed to preserve pending notification token deletion", error);
    }

    resetAuthenticatedClientState(queryClient);
    clearSession();
    showToast("로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.");
    resetToAuth();
  };
  const saveTermsAgreementMutation = useMutation({
    mutationFn: saveTermsAgreement,
  });
  const isSubmitting = saveTermsAgreementMutation.isPending;

  const handleContinue = () => {
    if (!isAgreed || isSubmitting || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;

    void (async () => {
      try {
        await saveTermsAgreementMutation.mutateAsync();
        updateProfile({ requiredTermsAgreed: true });

        const routeResolution = resolvePostLoginRoute({
          requiredTermsAgreed: true,
          profileCompleted,
        });

        if (!routeResolution.isValid) {
          submitLockRef.current = false;
          router.replace(termsRoutes.authAgreement);
          return;
        }

        if (!routeResolution.requiresOnboardingResolution) {
          router.replace(routeResolution.route as Href);
          return;
        }

        const entryResolution = await fetchOnboardingEntryResolution(queryClient);

        if (entryResolution.shouldShowFetchFailureToast) {
          showToast("온보딩 정보를 불러오지 못했어요. 홈에서 다시 시도해주세요.");
        }

        router.replace(entryResolution.route as Href);
      } catch (error) {
        submitLockRef.current = false;

        if (
          error instanceof ApiError &&
          (error.code === "AUTH_REQUIRED" || error.status === 401 || error.status === 403)
        ) {
          await handleAuthFailure();
          return;
        }

        showToast(getTermsAgreementErrorMessage(error));
      }
    })();
  };

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{ paddingTop: insets.top + 84, paddingBottom: insets.bottom + 24 }}
    >
      <StatusBar style="dark" />

      <View className="flex-1">
        <Text
          accessibilityRole="header"
          className="font-pretendard-semibold text-headline text-text"
        >
          이용 약관 동의
        </Text>

        <View className="mt-[52px] gap-3">
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isAgreed, disabled: isSubmitting }}
            disabled={isSubmitting}
            className="h-[58px] flex-row items-center rounded border-[0.5px] border-bg-dark bg-cool px-6"
            hitSlop={8}
            onPress={() => {
              if (isSubmitting || submitLockRef.current) {
                return;
              }

              setIsAgreed((current) => !current);
            }}
            style={({ pressed }) => ({ opacity: !isSubmitting && pressed ? 0.72 : 1 })}
          >
            <AgreementCheckIcon checked={isAgreed} />
            <Text
              className={[
                "ml-3 font-pretendard text-heading",
                isAgreed ? "text-text" : "text-text-subdued",
              ].join(" ")}
            >
              전체동의
            </Text>
          </Pressable>

          <TermsRow
            disabled={isSubmitting}
            label="[필수] 서비스 이용 약관"
            onPress={() => {
              if (submitLockRef.current) {
                return;
              }

              router.push(termsRoutes.authService);
            }}
          />
          <TermsRow
            disabled={isSubmitting}
            label="[필수] 개인정보 처리 방침"
            onPress={() => {
              if (submitLockRef.current) {
                return;
              }

              router.push(termsRoutes.authPrivacy);
            }}
          />
        </View>
      </View>

      <Button
        label="동의하고 계속하기"
        disabled={!isAgreed || isSubmitting}
        fullWidth
        className="h-[58px]"
        onPress={handleContinue}
      />
    </View>
  );
}
