import { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";

type WeeklyReviewRouteScaffoldProps = PropsWithChildren<{
  title: string;
  onBackPress?: () => void;
}>;

export function WeeklyReviewRouteScaffold({
  children,
  title,
  onBackPress,
}: WeeklyReviewRouteScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-light px-6" style={{ paddingTop: insets.top + 24 }}>
      <View className="h-8 flex-row items-center justify-between">
        <BackButton accessibilityLabel="이전 화면으로 돌아가기" onPress={onBackPress} />
        <Text className="font-pretendard-semibold text-headline text-text-subdued">
          {title}
        </Text>
        <View className="w-6" />
      </View>

      <View className="flex-1">{children}</View>
    </View>
  );
}
