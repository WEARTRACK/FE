import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";

type QuestQueryStateScreenProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function QuestQueryStateScreen({
  title,
  description,
  actionLabel,
  onPressAction,
}: QuestQueryStateScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 70,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-center font-pretendard-semibold text-headline text-text">
          {title}
        </Text>
        {description ? (
          <Text className="mt-[15px] text-center font-pretendard text-body text-text-subdued">
            {description}
          </Text>
        ) : null}
      </View>

      {actionLabel && onPressAction ? (
        <Button fullWidth label={actionLabel} className="h-[58px]" onPress={onPressAction} />
      ) : null}
    </View>
  );
}
