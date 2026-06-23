import { Stack } from "expo-router";

import { CommonHeader } from "@/components/common/CommonHeader";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <CommonHeader
              hasNew={{ notification: false, quest: false, weeklyReview: false }}
              showActions
            />
          ),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
