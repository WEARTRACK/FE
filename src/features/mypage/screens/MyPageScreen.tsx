import { useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronRightIcon from "../../../../assets/chevron_right.svg";
import MyEditIcon from "../../../../assets/my-edit.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { resetAuthenticatedClientState } from "@/features/entry/utils/resetAuthenticatedClientState";
import { logoutMemberSession } from "@/features/mypage/api/memberSessionActions";
import {
  getMemberProfileErrorMessage,
  isMemberProfileAuthError,
} from "@/features/mypage/utils/memberProfileErrors";
import { cleanupCurrentMemberData } from "@/features/mypage/utils/cleanupCurrentMemberData";
import { myPageRoutes } from "@/features/mypage/routes";
import { memberQueryKeys } from "@/features/mypage/hooks/memberQueryKeys";
import { useMemberProfile } from "@/features/mypage/hooks/useMemberProfile";
import {
  deleteNotificationTokenSnapshot,
  getNotificationTokenSnapshot,
  pauseNotificationTokenSync,
  preservePendingNotificationTokenDeletionForMember,
  resumeNotificationTokenSync,
  savePendingNotificationTokenDeletion,
} from "@/features/notifications/utils/notification-token-sync";
import { termsRoutes } from "@/features/terms/routes";
import { showAlert } from "@/lib/ui/showAlert";
import { showToast } from "@/lib/ui/showToast";
import { useSingleFlightController } from "@/lib/ui/singleFlightController";
import { useSessionStore } from "@/stores/useSessionStore";

function MyPageTopSection({ paddingTop, children }: { paddingTop: number; children?: ReactNode }) {
  return (
    <View className="bg-white px-6 pb-[27px]" style={{ paddingTop }}>
      <Text
        accessibilityRole="header"
        className="text-center font-pretendard-semibold text-headline text-text-subdued"
      >
        내 정보
      </Text>

      {children ?? <View className="h-[95px]" />}
    </View>
  );
}

function TermsRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-between"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <Text className="font-pretendard text-body text-text">{label}</Text>
      <ChevronRightIcon width={20} height={20} />
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      className="h-[49px] flex-1 items-center justify-center rounded-xl bg-gray"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: !disabled && !loading && pressed ? 0.72 : 1 })}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.subdued} size="small" />
      ) : (
        <Text className="font-pretendard text-body text-text-subdued">{label}</Text>
      )}
    </Pressable>
  );
}

export function MyPageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const memberId = useSessionStore((state) => state.memberId);
  const accessToken = useSessionStore((state) => state.accessToken);
  const clearSession = useSessionStore((state) => state.clearSession);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const { data: member, error, errorUpdatedAt, isError, isPending, refetch } = useMemberProfile();
  const hasHandledErrorAtRef = useRef(0);
  const hasFocusedRef = useRef(false);
  const logoutController = useSingleFlightController();
  const displayEmail = member?.email || "이메일 정보 없음";

  const resetToAuth = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }

    router.replace("/auth");
  }, [router]);

  const handleAuthFailure = useCallback(() => {
    void (async () => {
      try {
        await preservePendingNotificationTokenDeletionForMember(memberId);
      } catch (error) {
        console.warn("[Auth] Failed to preserve pending notification token deletion", error);
      }

      resetAuthenticatedClientState(queryClient);
      clearSession();
      showToast("로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.");
      resetToAuth();
    })();
  }, [clearSession, memberId, queryClient, resetToAuth]);

  useEffect(() => {
    if (!member) {
      return;
    }

    updateProfile({ nickname: member.nickname });
  }, [member, updateProfile]);

  useEffect(() => {
    if (!isError || errorUpdatedAt === 0 || hasHandledErrorAtRef.current === errorUpdatedAt) {
      return;
    }

    hasHandledErrorAtRef.current = errorUpdatedAt;

    if (isMemberProfileAuthError(error)) {
      handleAuthFailure();
      return;
    }

    showToast(getMemberProfileErrorMessage(error));
  }, [error, errorUpdatedAt, handleAuthFailure, isError]);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken || !memberId) {
        return;
      }

      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return;
      }

      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.detail(memberId) });
    }, [accessToken, memberId, queryClient]),
  );

  if (isPending && !member) {
    return (
      <View className="flex-1 bg-bg-light">
        <StatusBar style="dark" />
        <MyPageTopSection paddingTop={insets.top + 12} />
        <View className="h-[6px] bg-bg-light" />
        <View
          accessible
          accessibilityLabel="내 정보를 불러오는 중입니다."
          accessibilityRole="progressbar"
          accessibilityState={{ busy: true }}
          className="flex-1 items-center justify-center bg-white px-6"
        >
          <ActivityIndicator color={colors.accent} size="small" />
          <Text className="mt-4 font-pretendard text-body text-text-subdued">
            내 정보를 불러오고 있어요.
          </Text>
        </View>
      </View>
    );
  }

  if (!member) {
    return (
      <View className="flex-1 bg-bg-light">
        <StatusBar style="dark" />
        <MyPageTopSection paddingTop={insets.top + 12} />
        <View className="h-[6px] bg-bg-light" />
        <View className="flex-1 justify-center bg-white px-6">
          <Text className="text-center font-pretendard-semibold text-headline text-text">
            내 정보를 불러오지 못했어요.
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-light">
      <StatusBar style="dark" />

      <MyPageTopSection paddingTop={insets.top + 12}>
        <View className="mt-[38px]">
          <View className="flex-row items-center self-start">
            <Text className="font-pretendard-semibold text-headline text-text">
              {member.nickname}
            </Text>
            <Pressable
              accessibilityLabel="닉네임 수정 페이지로 이동"
              accessibilityRole="button"
              className="ml-2"
              hitSlop={8}
              onPress={() => {
                router.push(myPageRoutes.editNickname);
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
            >
              <MyEditIcon width={24} height={24} />
            </Pressable>
          </View>

          <Text className="mt-[11px] font-pretendard text-body text-text-subdued">
            {displayEmail}
          </Text>
        </View>
      </MyPageTopSection>

      <View className="h-[6px] bg-bg-light" />

      <View className="flex-1 bg-white px-6 pt-[22px]">
        <Text className="font-pretendard text-body text-text-subdued">약관 정보</Text>

        <View className="mt-[17px] gap-6">
          <TermsRow
            label="서비스 이용 약관"
            onPress={() => {
              router.push(termsRoutes.myPageService);
            }}
          />
          <TermsRow
            label="개인정보 처리 방침"
            onPress={() => {
              router.push(termsRoutes.myPagePrivacy);
            }}
          />
        </View>

        <View className="mt-[38px] flex-row gap-[11px]">
          <ActionButton
            disabled={logoutController.isPending}
            label="로그아웃"
            loading={logoutController.isPending}
            onPress={() => {
              if (logoutController.isPending) {
                return;
              }

              showAlert({
                title: "로그아웃 하시겠습니까?",
                message: "현재 기기에서 로그인이 해제 됩니다.",
                dismissible: false,
                confirmAction: {
                  label: "로그아웃",
                  beforePress: logoutController.start,
                  onPress: async () => {
                    await logoutController.runAfterStart(async () => {
                      pauseNotificationTokenSync();

                      try {
                        const currentMemberId = memberId;
                        const currentAccessToken = accessToken;
                        const notificationSnapshot =
                          await getNotificationTokenSnapshot(currentMemberId);

                        if (currentAccessToken) {
                          try {
                            await deleteNotificationTokenSnapshot(
                              currentAccessToken,
                              notificationSnapshot,
                              { clearStoredState: false },
                            );
                          } catch (error) {
                            console.warn("[Logout] Failed to delete notification token", error);

                            try {
                              await savePendingNotificationTokenDeletion(notificationSnapshot);
                            } catch (pendingDeleteError) {
                              console.warn(
                                "[Logout] Failed to save pending notification token deletion",
                                pendingDeleteError,
                              );
                            }
                          }

                          try {
                            await logoutMemberSession(currentAccessToken);
                          } catch (error) {
                            console.warn("[Logout] Failed to call logout API", error);
                          }
                        }

                        await cleanupCurrentMemberData({
                          memberId: currentMemberId,
                          queryClient,
                        });
                        showToast("로그아웃되었어요.");
                        resetToAuth();
                      } finally {
                        setTimeout(() => {
                          resumeNotificationTokenSync();
                        }, 0);
                      }
                    });
                  },
                },
                cancelAction: {
                  label: "취소",
                },
              });
            }}
          />
          <ActionButton
            disabled={logoutController.isPending}
            label="회원탈퇴"
            onPress={() => {
              router.push(myPageRoutes.withdraw);
            }}
          />
        </View>
      </View>
    </View>
  );
}
