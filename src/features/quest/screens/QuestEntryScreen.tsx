import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { useOnboardingDerivedState } from "@/features/onboarding/hooks/useOnboardingDerivedState";
import { resolveQuestEntryState } from "@/features/onboarding/utils/resolveQuestEntryState";
import { QuestQueryStateScreen } from "@/features/quest/screens/QuestQueryStateScreen";
import { QuestCardItem, QuestTemplateScreen } from "@/features/quest/screens/QuestTemplateScreen";
import {
  getQuestEntryActionAlertMessage,
  getQuestEntryCardAlertMessage,
} from "@/features/quest/utils/getQuestEntryAlertMessage";
import { resolveQuestEntryScreenState } from "@/features/quest/utils/resolveQuestEntryScreenState";
import { showAlert } from "@/lib/ui/showAlert";

function QuestEntryErrorScreen({ onRetry }: { onRetry: () => void }) {
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
          퀘스트 정보를 불러오지 못했어요.
        </Text>
        <Text className="mt-[15px] text-center font-pretendard text-body text-text-subdued">
          다시 시도해주세요.
        </Text>
      </View>

      <Button fullWidth label="다시 시도" className="h-[58px]" onPress={onRetry} />
    </View>
  );
}

export function QuestEntryScreen() {
  const onboardingState = useOnboardingDerivedState();
  const screenState = resolveQuestEntryScreenState({
    isLoading: onboardingState.statusQuery.isPending || onboardingState.questsQuery.isPending,
    hasError: onboardingState.statusQuery.isError || onboardingState.questsQuery.isError,
    entryState: resolveQuestEntryState(onboardingState),
  });

  if (screenState.kind === "loading") {
    return <QuestQueryStateScreen title={screenState.title} />;
  }

  if (screenState.kind === "error") {
    return (
      <QuestEntryErrorScreen
        onRetry={() => {
          void onboardingState.statusQuery.refetch();
          void onboardingState.questsQuery.refetch();
        }}
      />
    );
  }

  if (screenState.kind === "template") {
    return <Redirect href={screenState.templateRoute} />;
  }

  if (screenState.kind === "waiting" || screenState.kind === "completed") {
    const handlePressQuestCard = (quest: QuestCardItem) => {
      showAlert({
        title: getQuestEntryCardAlertMessage(quest),
      });
    };

    return (
      <QuestTemplateScreen
        quests={screenState.quests}
        initialSelectedQuestIndex={0}
        selectableQuestIndexes={[0, 1]}
        onPressQuestCard={handlePressQuestCard}
        onPressStart={() => {
          showAlert({
            title: getQuestEntryActionAlertMessage(),
          });
        }}
      />
    );
  }

  return (
    <QuestEntryErrorScreen
      onRetry={() => {
        void onboardingState.statusQuery.refetch();
        void onboardingState.questsQuery.refetch();
      }}
    />
  );
}
