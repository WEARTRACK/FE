import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import SignupInput from "@/components/common/SignupInput";
import { saveNickname } from "@/features/entry/api/saveNickname";
import { useNicknameFieldState } from "@/features/entry/hooks/useNicknameFieldState";
import { resetAuthenticatedClientState } from "@/features/entry/utils/resetAuthenticatedClientState";
import type { MemberProfile } from "@/features/mypage/api/getMemberProfile";
import {
  getMemberProfileErrorMessage,
  isMemberProfileAuthError,
} from "@/features/mypage/utils/memberProfileErrors";
import { memberQueryKeys } from "@/features/mypage/hooks/memberQueryKeys";
import { useMemberProfile } from "@/features/mypage/hooks/useMemberProfile";
import { myPageRoutes } from "@/features/mypage/routes";
import { preservePendingNotificationTokenDeletionForMember } from "@/features/notifications/utils/notification-token-sync";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useSessionStore } from "@/stores/useSessionStore";

export function EditNicknameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const memberId = useSessionStore((state) => state.memberId);
  const clearSession = useSessionStore((state) => state.clearSession);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const { data: member, error, errorUpdatedAt, isError, isPending, refetch } = useMemberProfile();
  const [nickname, setNickname] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const submitLockRef = useRef(false);
  const hasInitializedNicknameRef = useRef(false);
  const hasHandledErrorAtRef = useRef(0);
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

  useEffect(() => {
    if (!isError || errorUpdatedAt === 0 || hasHandledErrorAtRef.current === errorUpdatedAt) {
      return;
    }

    hasHandledErrorAtRef.current = errorUpdatedAt;

    if (isMemberProfileAuthError(error)) {
      void handleAuthFailure();
      return;
    }

    showToast(
      getMemberProfileErrorMessage(error, "닉네임 정보를 불러오지 못했어요. 다시 시도해주세요."),
    );
  }, [error, errorUpdatedAt, handleAuthFailure, isError]);

  useEffect(() => {
    if (!member || hasInitializedNicknameRef.current) {
      return;
    }

    hasInitializedNicknameRef.current = true;
    setNickname(member.nickname);
  }, [member]);

  const initialNickname = member?.nickname.trim() ?? "";
  const { trimmedNickname, hasChanged, errorMessage, successMessage, canSubmit } =
    useNicknameFieldState({
      nickname,
      hasInteracted,
      initialNickname,
    });

  const { mutate: saveNicknameMutate, isPending: isSavingNickname } = useMutation({
    mutationFn: saveNickname,
    onSuccess: (response) => {
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
      showToast("닉네임이 변경되었습니다.");

      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace(myPageRoutes.home);
    },
    onError: (nextError) => {
      if (nextError instanceof ApiError) {
        if (
          nextError.code === "AUTH_REQUIRED" ||
          nextError.status === 401 ||
          nextError.status === 403
        ) {
          void handleAuthFailure();
          return;
        }

        if (nextError.code === "MEMBER_409_1") {
          showToast("이미 사용 중인 닉네임이에요.");
          return;
        }

        if (nextError.code === "COMMON_400") {
          showToast("닉네임 형식을 다시 확인해주세요.");
          return;
        }

        if (nextError.code === "NETWORK_ERROR") {
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(myPageRoutes.home);
  };

  const handleSave = () => {
    if (isSavingNickname || isPending || submitLockRef.current) {
      return;
    }

    if (!hasChanged && initialNickname.length > 0) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      return;
    }

    if (!canSubmit) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      return;
    }

    submitLockRef.current = true;

    saveNicknameMutate({
      nickname: trimmedNickname,
    });
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1 bg-bg-light">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View
          className="flex-1 px-6"
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <View className="h-8 flex-row items-center justify-between">
            <BackButton accessibilityLabel="마이페이지로 돌아가기" onPress={handleBack} />
            <Text className="font-pretendard-semibold text-headline text-text">닉네임 수정</Text>
            <View className="w-6" />
          </View>

          {isPending && !member ? (
            <View
              accessible
              accessibilityLabel="현재 닉네임을 불러오는 중입니다."
              accessibilityRole="progressbar"
              accessibilityState={{ busy: true }}
              className="flex-1 items-center justify-center"
            >
              <Text className="font-pretendard text-body text-text-subdued">
                현재 닉네임을 불러오고 있어요.
              </Text>
            </View>
          ) : !member ? (
            <View className="flex-1 justify-center">
              <Text className="text-center font-pretendard-semibold text-headline text-text">
                닉네임 정보를 불러오지 못했어요.
              </Text>
              <Text className="mt-3 text-center font-pretendard text-body text-text-subdued">
                잠시 후 다시 시도해주세요.
              </Text>
              <Button
                fullWidth
                className="mt-8 h-[58px]"
                label="다시 시도"
                onPress={() => {
                  void refetch();
                }}
              />
            </View>
          ) : (
            <>
              <View className="mt-[57px]">
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
                  fullWidth
                  disabled={!canSubmit || isSavingNickname}
                  label="완료"
                  onPress={handleSave}
                  variant="primary"
                />
              </View>
            </>
          )}
        </View>
        {keyboardAccessory.toolbar}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
