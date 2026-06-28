import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { AddQuestItemTile } from "@/features/quest/components/AddQuestItemTile";

type QuestProgressTemplateProps = {
  headerTitle: string;
  questTitle: string;
  currentCount: number;
  requiredCount: number;
  gridTitle: string;
  actionLabel: string;
  onPressAction: () => void;
  actionDisabled?: boolean;
  progressCardState?: "default" | "complete";
  gridContent?: ReactNode;
};

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function QuestProgressCard({
  title,
  currentCount,
  requiredCount,
  state = "default",
}: {
  title: string;
  currentCount: number;
  requiredCount: number;
  state?: "default" | "complete";
}) {
  const boundedCurrentCount = Math.min(Math.max(currentCount, 0), requiredCount);
  const progress = requiredCount > 0 ? clampProgress(currentCount / requiredCount) : 0;

  return (
    <View
      className={[
        "h-[85px] rounded-[4px] px-[23px] pt-[18px]",
        state === "complete"
          ? "border border-blue-4 bg-blue-1"
          : "border-[0.5px] border-cool bg-white",
      ].join(" ")}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="font-pretendard text-heading text-text">{title}</Text>
        </View>
        <Text className="font-pretendard text-heading text-text">
          {boundedCurrentCount}/{requiredCount}
        </Text>
      </View>

      <View className="mt-[11px] h-[10px] overflow-hidden rounded-full bg-blue-1">
        {progress > 0 ? (
          <View className="h-full rounded-full bg-blue-4" style={{ width: `${progress * 100}%` }} />
        ) : null}
      </View>
    </View>
  );
}

export function QuestProgressTemplate({
  headerTitle,
  questTitle,
  currentCount,
  requiredCount,
  gridTitle,
  actionLabel,
  onPressAction,
  actionDisabled = false,
  progressCardState = "default",
  gridContent,
}: QuestProgressTemplateProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="h-9 flex-row items-center justify-between">
        <BackButton accessibilityLabel="퀘스트 안내 화면으로 돌아가기" />
        <Text className="font-pretendard-semibold text-headline text-text-subdued">
          {headerTitle}
        </Text>
        <View className="w-6" />
      </View>

      <View className="mt-[32px]">
        <QuestProgressCard
          title={questTitle}
          currentCount={currentCount}
          requiredCount={requiredCount}
          state={progressCardState}
        />
      </View>

      <View className="mt-[32px]">
        <Text className="font-pretendard-semibold text-headline text-text">{gridTitle}</Text>
        <View className="mt-[24px] flex-row flex-wrap gap-[8px]">
          {gridContent ?? <AddQuestItemTile label={actionLabel} onPress={onPressAction} />}
        </View>
      </View>

      <View className="flex-1" />

      <Button
        disabled={actionDisabled}
        fullWidth
        label={actionLabel}
        className="h-[58px]"
        onPress={onPressAction}
      />
    </View>
  );
}
