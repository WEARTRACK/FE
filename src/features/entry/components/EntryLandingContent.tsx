import { Href } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/common/Button";
import { EntryLogo } from "@/features/entry/components/EntryLogo";

type EntryLandingContentProps = {
  showActions: boolean;
};

export function EntryLandingContent({ showActions }: EntryLandingContentProps) {
  return (
    <View className="flex-1 px-6 pb-10 pt-6">
      <View className="-mt-48 flex-1 items-center justify-center">
        <EntryLogo subtitleClassName="mt-7" />
      </View>

      {showActions ? (
        <View className="w-[345px] gap-2 self-center">
          <Button
            href={"/auth/sign-in" as Href}
            label="로그인"
            variant="primary"
            size="lg"
            fullWidth
            className="bg-text-subdued"
            textClassName="text-primary"
          />
          <Button
            href={"/auth/sign-up" as Href}
            label="회원가입"
            variant="secondary"
            size="lg"
            fullWidth
            className="border-transparent bg-primary"
            textClassName="text-text"
          />
        </View>
      ) : (
        <View className="h-[118px]" />
      )}
    </View>
  );
}
