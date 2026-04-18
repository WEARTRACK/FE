import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryLogo } from "@/features/entry/components/EntryLogo";
import { SocialActionButtons } from "@/features/entry/components/SocialActionButtons";

export function SignUpScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <View className="flex-1 items-center justify-center px-6 pb-10 pt-6">
        <View className="items-center">
          <EntryLogo subtitleClassName="mt-7" />
        </View>

        <View className="mt-[102px]">
          <SocialActionButtons mode="signup" />
        </View>
      </View>
    </SafeAreaView>
  );
}
