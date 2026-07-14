import { Href, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import SignupInput from "@/components/common/SignupInput";
import { saveNickname } from "@/features/entry/api/saveNickname";
import { useNicknameFieldState } from "@/features/entry/hooks/useNicknameFieldState";
import { resetAuthenticatedClientState } from "@/features/entry/utils/resetAuthenticatedClientState";
import type { MemberProfile } from "@/features/mypage/api/getMemberProfile";
import { memberQueryKeys } from "@/features/mypage/hooks/memberQueryKeys";
import { preservePendingNotificationTokenDeletionForMember } from "@/features/notifications/utils/notification-token-sync";
import { getOnboardingQuests } from "@/features/onboarding/api/getOnboardingQuests";
import { getOnboardingStatus } from "@/features/onboarding/api/getOnboardingStatus";
import { onboardingQueryKeys } from "@/features/onboarding/hooks/onboardingQueryKeys";
import { resolvePostNicknameEntry } from "@/features/onboarding/utils/resolvePostNicknameEntry";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useSessionStore } from "@/stores/useSessionStore";

export function SetNicknameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const memberId = useSessionStore((state) => state.memberId);
  const clearSession = useSessionStore((state) => state.clearSession);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const submitLockRef = useRef(false);
  const [nickname, setNickname] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const { trimmedNickname, errorMessage, successMessage, canSubmit } = useNicknameFieldState({
    nickname,
    hasInteracted,
  });
  const resetToAuth = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }

    router.replace("/auth");
  }, [router]);
  const handleAuthFailure = useCallback(async () => {
    try {
      await preservePendingNotificationTokenDeletionForMember(memberId);
    } catch (error) {
      console.warn("[Auth] Failed to preserve pending notification token deletion", error);
    }

    resetAuthenticatedClientState(queryClient);
    clearSession();
    showToast("로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.");
    resetToAuth();
  }, [clearSession, memberId, queryClient, resetToAuth]);
  const { mutate: saveNicknameMutate, isPending: isSavingNickname } = useMutation({
    mutationFn: saveNickname,
    onSuccess: async (response) => {
      if (memberId) {
        queryClient.setQueryData<MemberProfile | undefined>(
          memberQueryKeys.detail(memberId),
          (currentMember) =>
            currentMember
              ? {
                  ...currentMember,
                  nickname: response.result.nickname,
                }
              : currentMember,
        );
      }

      updateProfile({
        nickname: response.result.nickname,
        profileCompleted: response.result.profileCompleted,
      });

      if (response.result.profileCompleted) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.status() }),
          queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.quests() }),
        ]);

        const [statusResult, questsResult] = await Promise.allSettled([
          queryClient.fetchQuery({
            queryKey: onboardingQueryKeys.status(),
            queryFn: getOnboardingStatus,
          }),
          queryClient.fetchQuery({
            queryKey: onboardingQueryKeys.quests(),
            queryFn: getOnboardingQuests,
          }),
        ]);

        const onboardingStatus = statusResult.status === "fulfilled" ? statusResult.value : null;
        const onboardingQuests = questsResult.status === "fulfilled" ? questsResult.value : null;

        const entryResolution = resolvePostNicknameEntry({
          status: onboardingStatus,
          quests: onboardingQuests,
        });

        if (entryResolution.shouldShowFetchFailureToast) {
          showToast("온보딩 정보를 불러오지 못했어요. 홈에서 다시 시도해주세요.");
        }

        router.replace(entryResolution.route as Href);
        return;
      }

      showToast("닉네임 저장은 완료됐지만 프로필 설정이 끝나지 않았어요. 다시 시도해주세요.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === "AUTH_REQUIRED" || error.status === 401 || error.status === 403) {
          void handleAuthFailure();
          return;
        }

        if (error.code === "MEMBER_409_1") {
          showToast("이미 사용 중인 닉네임이에요.");
          return;
        }

        if (error.code === "COMMON_400") {
          showToast("닉네임 형식을 다시 확인해주세요.");
          return;
        }

        if (error.code === "NETWORK_ERROR") {
          showToast("네트워크 연결을 확인해주세요.");
          return;
        }
      }

      showToast("저장에 실패했어요. 다시 시도해주세요.");
    },
    onSettled: () => {
      submitLockRef.current = false;
    },
  });

  const handleComplete = () => {
    if (isSavingNickname || submitLockRef.current) {
      return;
    }

    if (!canSubmit) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      return;
    }

    submitLockRef.current = true;
    saveNicknameMutate({ nickname: trimmedNickname });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View
        className="flex-1 bg-bg-light px-6 pt-[131px]"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View>
          <Text className="text-center font-pretendard-semibold text-headline text-text">
            사용하실 닉네임을 입력해주세요.
          </Text>
          <Text className="mt-3 text-center font-pretendard text-subhead text-text-subdued">
            닉네임은 회원가입 이후에도 수정할 수 있습니다.
          </Text>
        </View>

        <View className="mt-[79px]">
          <SignupInput
            {...keyboardAccessory.getInputAccessoryProps(0)}
            label="닉네임"
            placeholder="한글, 영문, 숫자 조합만 가능"
            maxLength={5}
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              if (!hasInteracted) {
                setHasInteracted(true);
              }
            }}
            onBlur={() => {
              if (!hasInteracted) {
                setHasInteracted(true);
              }
            }}
            error={errorMessage}
            isSuccess={Boolean(successMessage)}
            successMessage={successMessage}
            autoCapitalize="none"
            autoCorrect={false}
            labelClassName="mb-1 text-[12px] font-pretendard-semibold"
            inputClassName="h-[46px] px-[12px] py-0 text-[12px]"
            messageTextClassName="text-[10px]"
            counterClassName="text-[10px]"
            successMessageClassName="text-text-subdued"
          />
        </View>

        <View className="mt-auto">
          <Button
            label="옷장 관리 시작하기"
            variant="primary"
            size="lg"
            onPress={handleComplete}
            fullWidth
            disabled={!canSubmit || isSavingNickname}
          />
        </View>
      </View>
      {keyboardAccessory.toolbar}
    </KeyboardAvoidingView>
  );
}
