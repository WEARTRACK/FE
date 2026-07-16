import { useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { ApiError } from "@/lib/api/errors";
import { cleanupCurrentMemberData } from "@/features/mypage/utils/cleanupCurrentMemberData";
import { withdrawMemberSession } from "@/features/mypage/api/memberSessionActions";
import { myPageRoutes } from "@/features/mypage/routes";
import {
  deleteNotificationTokenSnapshot,
  getNotificationTokenSnapshot,
  pauseNotificationTokenSync,
  resumeNotificationTokenSync,
  restoreNotificationTokenSnapshot,
  savePendingNotificationTokenDeletion,
} from "@/features/notifications/utils/notification-token-sync";
import { showAlert } from "@/lib/ui/showAlert";
import { showToast } from "@/lib/ui/showToast";
import { useSingleFlightController } from "@/lib/ui/singleFlightController";
import { useSessionStore } from "@/stores/useSessionStore";

function getWithdrawErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인한 뒤 다시 시도해주세요.";
    }

    return error.message;
  }

  return "회원탈퇴에 실패했어요. 다시 시도해주세요.";
}

export function WithdrawMemberScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const memberId = useSessionStore((state) => state.memberId);
  const accessToken = useSessionStore((state) => state.accessToken);
  const withdrawController = useSingleFlightController();

  const resetToAuth = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }

    router.replace("/auth");
  }, [router]);

  const handleMissingSession = useCallback(async () => {
    await cleanupCurrentMemberData({ memberId, queryClient });
    showToast("로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.");
    resetToAuth();
  }, [memberId, queryClient, resetToAuth]);

  return (
    <View className="flex-1 bg-bg-light">
      <StatusBar style="dark" />

      <View className="relative px-6 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="absolute left-6 z-10" style={{ top: insets.top + 12 }}>
          <BackButton
            accessibilityLabel="마이페이지로 돌아가기"
            onPress={() => {
              if (withdrawController.isPending) {
                return;
              }

              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace(myPageRoutes.home);
            }}
          />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center font-pretendard-semibold text-headline text-text-subdued"
        >
          회원탈퇴
        </Text>
      </View>

      <View className="px-6 pt-8">
        <View className="items-center justify-center rounded-lg border-[0.5px] border-error bg-red-1 px-[27px] py-[24px]">
          <View className="items-start">
            <Text className="font-pretendard text-body text-error">탈퇴시</Text>
            <Text className="font-pretendard text-body text-error">
              옷, 옷장, 착용기록, 패션소비 리포트가 영구삭제됩니다.
            </Text>
          </View>
        </View>

        <Button
          fullWidth
          className="mt-[15px] h-[58px] border-[0.5px] border-bg-dark"
          disabled={withdrawController.isPending}
          label="탈퇴하기"
          onPress={() => {
            if (withdrawController.isPending) {
              return;
            }

            showAlert({
              title: "정말 탈퇴하시겠습니까?",
              message:
                "탈퇴 시 계정은 소프트 삭제되며\n동일 계정으로 7일간 재가입할 수 없고\n회원 정보는 6개월 후 완전히 삭제됩니다.",
              dismissible: false,
              confirmAction: {
                label: "탈퇴하기",
                beforePress: withdrawController.start,
                onPress: async () => {
                  await withdrawController.runAfterStart(async () => {
                    let shouldForceNotificationResync = false;

                    try {
                      pauseNotificationTokenSync();

                      const currentMemberId = memberId;
                      const currentAccessToken = accessToken;

                      if (currentMemberId === null || !currentAccessToken) {
                        await handleMissingSession();
                        return;
                      }

                      const notificationSnapshot =
                        await getNotificationTokenSnapshot(currentMemberId);
                      let didDeleteNotificationToken = false;
                      let shouldSavePendingNotificationDeletion = false;

                      try {
                        try {
                          didDeleteNotificationToken = await deleteNotificationTokenSnapshot(
                            currentAccessToken,
                            notificationSnapshot,
                            { clearStoredState: false },
                          );
                        } catch (error) {
                          shouldSavePendingNotificationDeletion = true;
                          console.warn("[Withdraw] Failed to delete notification token", error);
                        }

                        await withdrawMemberSession(currentAccessToken);
                      } catch (error) {
                        if (didDeleteNotificationToken) {
                          try {
                            await restoreNotificationTokenSnapshot(
                              currentAccessToken,
                              notificationSnapshot,
                            );
                          } catch (restoreError) {
                            shouldForceNotificationResync = true;
                            console.warn(
                              "[Withdraw] Failed to restore notification token",
                              restoreError,
                            );
                          }
                        }

                        showToast(getWithdrawErrorMessage(error));
                        return;
                      }

                      if (shouldSavePendingNotificationDeletion) {
                        try {
                          await savePendingNotificationTokenDeletion(notificationSnapshot);
                        } catch (pendingDeleteError) {
                          console.warn(
                            "[Withdraw] Failed to save pending notification token deletion",
                            pendingDeleteError,
                          );
                        }
                      }

                      await cleanupCurrentMemberData({
                        memberId: currentMemberId,
                        queryClient,
                      });
                      showToast("회원탈퇴가 완료되었어요.");
                      resetToAuth();
                    } finally {
                      setTimeout(() => {
                        resumeNotificationTokenSync({
                          forceResync: shouldForceNotificationResync,
                        });
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
          textClassName="font-pretendard-semibold text-button-lg text-text"
          variant="secondary"
        />
      </View>
    </View>
  );
}
