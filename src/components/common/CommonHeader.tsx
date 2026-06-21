import { Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../assets/headerLogo.svg";
import NotificationDotIcon from "../../../assets/notification-dot.svg";
import NotificationIcon from "../../../assets/notification.svg";
import QuestIcon from "../../../assets/quest.svg";
import WeeklyReviewIcon from "../../../assets/weekly-review.svg";

type CommonHeaderProps = {
  homeHref?: Href;
  showActions?: boolean;
  hasNew?: {
    notification?: boolean;
    quest?: boolean;
    weeklyReview?: boolean;
  };
};

function HeaderActionButton({
  accessibilityLabel,
  hasNew = false,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  hasNew?: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-8 w-8 items-center justify-center"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      {icon}
      {hasNew ? (
        <View className="absolute right-[-1px] top-[1px]">
          <NotificationDotIcon height={10} width={10} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function CommonHeader({
  homeHref = "/home" as Href,
  hasNew,
  showActions = false,
}: CommonHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-bg-light px-6"
      style={{
        height: insets.top + 24 + (showActions ? 24 : 15),
        paddingTop: insets.top + 24,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="홈으로 이동"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.replace(homeHref)}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
        >
          <HeaderLogo width={118} height={15} />
        </Pressable>

        {showActions ? (
          <View className="flex-row gap-2">
            <HeaderActionButton
              accessibilityLabel="주간 회고로 이동"
              hasNew={hasNew?.weeklyReview}
              icon={<WeeklyReviewIcon height={24} width={24} />}
              onPress={() => router.push("/weekly-review")}
            />
            <HeaderActionButton
              accessibilityLabel="알림으로 이동"
              hasNew={hasNew?.notification}
              icon={<NotificationIcon height={24} width={24} />}
              onPress={() => router.push("/notifications")}
            />
            <HeaderActionButton
              accessibilityLabel="퀘스트로 이동"
              hasNew={hasNew?.quest}
              icon={<QuestIcon height={24} width={24} />}
              onPress={() => router.push("/quest/first")}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
