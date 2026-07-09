import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { colors } from "@/constants/colors";
import type { NotificationSettings } from "@/features/notifications/api/notification-api-types";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/features/notifications/hooks/use-notification-settings";
import { requestNotificationPermission } from "@/features/notifications/notification-permission";
import { showToast } from "@/lib/ui/showToast";

type SettingField = keyof NotificationSettings;

type SettingRowProps = {
  description?: string;
  disabled?: boolean;
  onToggle: () => void;
  title: string;
  value: boolean;
};

type SettingsToggleProps = Pick<SettingRowProps, "disabled" | "onToggle" | "value">;

const TOGGLE_TRACK_WIDTH = 60;
const TOGGLE_TRACK_HEIGHT = 32;
const TOGGLE_THUMB_SIZE = 28;
const TOGGLE_INSET = (TOGGLE_TRACK_HEIGHT - TOGGLE_THUMB_SIZE) / 2;
const TOGGLE_TRANSLATE_X = TOGGLE_TRACK_WIDTH - TOGGLE_THUMB_SIZE - TOGGLE_INSET * 2;

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: false,
  dailyReviewEnabled: false,
  longUnwornClothesEnabled: false,
  fashionReportEnabled: false,
};

function SettingsToggle({ disabled = false, onToggle, value }: SettingsToggleProps) {
  const translateX = useRef(new Animated.Value(value ? TOGGLE_TRANSLATE_X : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? TOGGLE_TRANSLATE_X : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateX, value]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      className="rounded-full"
      disabled={disabled}
      hitSlop={8}
      onPress={onToggle}
      style={{
        backgroundColor: value ? colors.text.DEFAULT : colors.disabled,
        height: TOGGLE_TRACK_HEIGHT,
        opacity: disabled ? 0.5 : 1,
        width: TOGGLE_TRACK_WIDTH,
      }}
    >
      <Animated.View
        className="absolute rounded-full bg-white"
        style={{
          height: TOGGLE_THUMB_SIZE,
          left: TOGGLE_INSET,
          top: TOGGLE_INSET,
          transform: [{ translateX }],
          width: TOGGLE_THUMB_SIZE,
        }}
      />
    </Pressable>
  );
}

function SettingRow({ description, disabled = false, onToggle, title, value }: SettingRowProps) {
  return (
    <View className="h-[98px] flex-row items-center justify-between rounded border border-bg-light bg-white px-6">
      <View className={disabled ? "flex-1 pr-4 opacity-50" : "flex-1 pr-4"}>
        <Text className="font-pretendard text-heading text-text" numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text className="mt-[7px] font-pretendard text-body text-text-subdued" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      <SettingsToggle disabled={disabled} onToggle={onToggle} value={value} />
    </View>
  );
}

function SettingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6 pb-24">
      <Text className="text-center font-pretendard-semibold text-headline text-bg-dark">
        알림 설정을 불러오지 못했어요.
      </Text>
      <Pressable
        accessibilityLabel="알림 설정 다시 불러오기"
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

export default function NotificationSettingsRoute() {
  const insets = useSafeAreaInsets();
  const settingsQuery = useNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings();
  const [draftSettings, setDraftSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const interactionLockedRef = useRef(false);
  const isUpdating = updateSettingsMutation.isPending || isCheckingPermission;

  useEffect(() => {
    if (settingsQuery.data && !updateSettingsMutation.isPending) {
      setDraftSettings(settingsQuery.data);
    }
  }, [settingsQuery.data, updateSettingsMutation.isPending]);

  const updateSettings = (nextSettings: NotificationSettings) => {
    const previousSettings = draftSettings;
    setDraftSettings(nextSettings);
    updateSettingsMutation.mutate(nextSettings, {
      onError: () => {
        setDraftSettings(previousSettings);
        showToast("알림 설정을 저장하지 못했어요.");
      },
      onSettled: () => {
        interactionLockedRef.current = false;
      },
    });
  };

  const handleToggle = async (field: SettingField) => {
    if (isUpdating || interactionLockedRef.current) {
      return;
    }

    interactionLockedRef.current = true;

    if (field === "pushEnabled") {
      const nextPushEnabled = !draftSettings.pushEnabled;

      if (nextPushEnabled) {
        let granted = false;
        setIsCheckingPermission(true);

        try {
          granted = await requestNotificationPermission();
        } catch {
          granted = false;
        } finally {
          setIsCheckingPermission(false);
        }

        if (!granted) {
          interactionLockedRef.current = false;
          showToast("기기 알림 권한을 허용해주세요.");
          void Linking.openSettings().catch(() => undefined);
          return;
        }
      }

      updateSettings({
        ...draftSettings,
        pushEnabled: nextPushEnabled,
      });
      return;
    }

    if (!draftSettings.pushEnabled) {
      interactionLockedRef.current = false;
      return;
    }

    updateSettings({
      ...draftSettings,
      [field]: !draftSettings[field],
    });
  };

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top + 24 }}>
      <View className="h-8 flex-row items-center justify-between px-6">
        <BackButton accessibilityLabel="알림 목록으로 돌아가기" />
        <Text className="font-pretendard-semibold text-headline text-text">알림 설정</Text>
        <View className="h-6 w-6" />
      </View>

      {settingsQuery.isPending ? (
        <View className="flex-1 items-center justify-center pb-24">
          <ActivityIndicator color="#2B2F3A" />
        </View>
      ) : settingsQuery.isError ? (
        <SettingsError onRetry={() => void settingsQuery.refetch()} />
      ) : (
        <View className="mt-[27px]">
          <SettingRow
            disabled={isUpdating}
            onToggle={() => void handleToggle("pushEnabled")}
            title="푸시 알림 받기"
            value={draftSettings.pushEnabled}
          />
          <View className="h-1 bg-bg-light" />
          <SettingRow
            description="4주 이상 미착용 옷 발견 시(매주)"
            disabled={!draftSettings.pushEnabled || isUpdating}
            onToggle={() => void handleToggle("longUnwornClothesEnabled")}
            title="장기 미착용 알림"
            value={draftSettings.longUnwornClothesEnabled}
          />
          <View className="h-1 bg-bg-light" />
          <SettingRow
            description="매주 이번주 옷 기록 안내"
            disabled={!draftSettings.pushEnabled || isUpdating}
            onToggle={() => void handleToggle("dailyReviewEnabled")}
            title="주간 회고 알림"
            value={draftSettings.dailyReviewEnabled}
          />
          <View className="h-1 bg-bg-light" />
          <SettingRow
            description="월간 소비 리포트 생성 시"
            disabled={!draftSettings.pushEnabled || isUpdating}
            onToggle={() => void handleToggle("fashionReportEnabled")}
            title="패션소비 리포트 알림"
            value={draftSettings.fashionReportEnabled}
          />
        </View>
      )}
    </View>
  );
}
