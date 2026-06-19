import { Href } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CompleteIcon from "../../../../assets/quest-complete-icon.svg";
import { Button } from "@/components/common/Button";

type QuestCompleteScreenProps = {
  description: string;
  rewards: string[];
  buttonLabel: string;
  buttonHref: Href;
};

export function QuestCompleteScreen({
  description,
  rewards,
  buttonLabel,
  buttonHref,
}: QuestCompleteScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="items-center pt-[172px]">
        <CompleteIcon width={104} height={112} />

        <Text className="mt-[48px] text-center font-pretendard-semibold text-headline text-text">
          퀘스트 완료!
        </Text>
        <Text className="mt-[15px] text-center font-pretendard text-body text-text-subdued">
          {description}
        </Text>
      </View>

      <View className="mt-[26px] h-[105px] rounded-[4px] border-[0.5px] border-cool bg-white px-[24px] pt-[19px]">
        <Text className="font-pretendard text-heading text-text">🎁 획득한 보상</Text>

        <View className="mt-[7px] gap-0">
          {rewards.map((reward) => (
            <View key={reward} className="flex-row">
              <Text className="w-[21px] font-pretendard text-body text-text-subdued">•</Text>
              <Text className="font-pretendard text-body text-text-subdued">{reward}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button fullWidth href={buttonHref} label={buttonLabel} className="mt-[26px] h-[58px]" />
    </View>
  );
}
