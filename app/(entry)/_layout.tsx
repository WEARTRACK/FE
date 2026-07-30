import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/constants/colors";

export default function EntryLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.dark },
        }}
      />
    </>
  );
}
