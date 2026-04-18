import { SafeAreaView } from "react-native-safe-area-context";

import { EntryLandingContent } from "@/features/entry/components/EntryLandingContent";

export function AuthChoiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <EntryLandingContent showActions />
    </SafeAreaView>
  );
}
