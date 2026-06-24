import { Stack } from "expo-router";

import { CommonHeader } from "@/components/common/CommonHeader";
import { useOnboardingStatus } from "@/features/onboarding/hooks/useOnboardingStatus";

export default function HomeLayout() {
  const onboardingStatusQuery = useOnboardingStatus();

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <CommonHeader
              hasNew={{
                notification: false,
                quest: onboardingStatusQuery.data?.hasNewQuest ?? false,
                weeklyReview: false,
              }}
              showActions
            />
          ),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
