import { useRouter, type Href } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import type { NotificationItem } from "@/features/notifications/api/notification-api-types";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { formatNotificationTime } from "@/features/notifications/utils/notification-time";

import QuestionIcon from "../../../assets/question-icon.svg";
import SettingIcon from "../../../assets/setting-icon.svg";

const NOTIFICATION_LIST_QUERY = {
  page: 0,
  size: 10,
} as const;

const NOTIFICATION_SETTINGS_ROUTE = "/notifications/settings" as Href;

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const timeText = formatNotificationTime(notification.sentAt);

  return (
    <View className="border-gray h-[98px] justify-center rounded-lg border bg-white px-8">
      <Text className="font-pretendard text-heading text-text" numberOfLines={1}>
        {notification.title}
      </Text>

      <View className="mt-[14px] flex-row items-center gap-3">
        <Text className="flex-1 font-pretendard text-body text-text-subdued" numberOfLines={1}>
          {notification.body}
        </Text>
        {timeText ? (
          <Text className="font-pretendard-light text-caption text-text-subdued" numberOfLines={1}>
            {timeText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function EmptyNotifications() {
  return (
    <View className="flex-1 items-center justify-center pb-16">
      <QuestionIcon width={225} height={225} />
      <Text className="mt-3 text-center font-pretendard-semibold text-headline text-bg-dark">
        아직 알림이 없어요.
      </Text>
    </View>
  );
}

function NotificationError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6 pb-24">
      <Text className="text-center font-pretendard-semibold text-headline text-bg-dark">
        알림을 불러오지 못했어요.
      </Text>
      <Pressable
        accessibilityLabel="알림 다시 불러오기"
        accessibilityRole="button"
        className="mt-4 rounded-lg bg-text px-5 py-3"
        onPress={onRetry}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <Text className="font-pretendard text-heading text-white">다시 시도</Text>
      </Pressable>
    </View>
  );
}

export default function NotificationsRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const notificationsQuery = useNotifications(NOTIFICATION_LIST_QUERY);
  const notifications = useMemo(
    () =>
      [...(notificationsQuery.data?.notifications ?? [])].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
      ),
    [notificationsQuery.data?.notifications],
  );

  return (
    <View className="flex-1 bg-bg-light px-6" style={{ paddingTop: insets.top + 24 }}>
      <View className="h-8 flex-row items-center justify-between">
        <BackButton accessibilityLabel="홈으로 돌아가기" />
        <Text className="font-pretendard-semibold text-headline text-text">알림</Text>
        <View className="h-6 w-6 items-center justify-center">
          <Pressable
            accessibilityLabel="알림 설정으로 이동"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.push(NOTIFICATION_SETTINGS_ROUTE)}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          >
            <SettingIcon width={24} height={24} />
          </Pressable>
        </View>
      </View>

      {notificationsQuery.isPending ? (
        <View className="flex-1 items-center justify-center pb-24">
          <ActivityIndicator color="#2B2F3A" />
        </View>
      ) : notificationsQuery.isError ? (
        <NotificationError onRetry={() => void notificationsQuery.refetch()} />
      ) : (
        <FlatList
          contentContainerClassName={notifications.length ? "pt-[27px] pb-10" : "flex-1"}
          data={notifications}
          ItemSeparatorComponent={() => <View className="h-2" />}
          keyExtractor={(item) => String(item.notificationId)}
          ListEmptyComponent={EmptyNotifications}
          refreshControl={
            <RefreshControl
              refreshing={notificationsQuery.isRefetching}
              onRefresh={() => void notificationsQuery.refetch()}
              tintColor="#2B2F3A"
            />
          }
          renderItem={({ item }) => <NotificationCard notification={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
