import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import { Button } from "@/components/common/Button";

export type QuestCardItem = {
  title: string;
  description?: string;
  kind?: "available" | "completed" | "locked" | "coming-soon";
};

type QuestTemplateScreenProps = {
  quests: QuestCardItem[];
  startHref?: Href;
  startLabel?: string;
  initialSelectedQuestIndex?: number | null;
  selectableQuestIndexes?: number[];
  onPressStart?: (selectedQuestIndex: number | null) => void;
  onPressQuestCard?: (quest: QuestCardItem, index: number) => void;
};

function QuestCard({
  quest,
  isSelected,
  isSelectable,
  onPress,
}: {
  quest: QuestCardItem;
  isSelected: boolean;
  isSelectable: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={isSelectable ? "button" : undefined}
      accessibilityState={{ disabled: !isSelectable, selected: isSelected }}
      className={[
        "h-[85px] justify-center rounded-[4px] border-[0.5px] px-[24px]",
        isSelected ? "border-bg-dark bg-cool" : "border-cool bg-white",
      ].join(" ")}
      disabled={!isSelectable}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed && isSelectable ? 0.72 : 1,
      })}
    >
      <View className="flex-row items-center">
        <Text className="font-pretendard text-heading text-text">{quest.title}</Text>
      </View>

      {quest.description ? (
        <Text className="mt-[7px] font-pretendard text-subhead text-text-subdued">
          {quest.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function QuestTemplateScreen({
  quests,
  startHref,
  startLabel = "퀘스트 시작하기",
  initialSelectedQuestIndex = null,
  selectableQuestIndexes = [0],
  onPressStart,
  onPressQuestCard,
}: QuestTemplateScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedQuestIndex, setSelectedQuestIndex] = useState<number | null>(initialSelectedQuestIndex);

  const isStartDisabled = selectedQuestIndex === null;

  const handlePressStart = () => {
    if (isStartDisabled) {
      return;
    }

    if (onPressStart) {
      onPressStart(selectedQuestIndex);
      return;
    }

    if (!startHref) {
      return;
    }

    router.push(startHref);
  };

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 70,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="items-center">
        <ClosetIcon width={92} height={126} />

        <Text className="mt-[29px] font-pretendard-semibold text-headline text-text">
          옷장을 채워볼까요?
        </Text>
        <Text className="mt-[15px] font-pretendard text-body text-text-subdued">
          퀘스트를 완료하고 나만의 옷장을 만들어보세요.
        </Text>
      </View>

      <View className="mt-[26px] gap-[9px]">
        {quests.map((quest, index) => {
          const isSelectable = selectableQuestIndexes.includes(index);

          return (
            <QuestCard
              key={`${quest.title}-${index}`}
              quest={quest}
              isSelectable={isSelectable}
              isSelected={selectedQuestIndex === index}
              onPress={() => {
                setSelectedQuestIndex(index);
                onPressQuestCard?.(quest, index);
              }}
            />
          );
        })}
      </View>

      <Button
        disabled={isStartDisabled}
        fullWidth
        label={startLabel}
        className="mt-[59px] h-[58px]"
        onPress={handlePressStart}
      />
    </View>
  );
}
