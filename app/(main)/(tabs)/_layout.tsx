import { Tabs } from "expo-router";
import { useMemo } from "react";

import { colors } from "@/constants/colors";
import { TabBarIcon } from "@/features/navigation/components/TabBarIcon";
import { tabsConfig, type TabRouteName } from "@/features/navigation/tabs.config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();

  const tabBarBottomSpacing = useMemo(() => insets.bottom + 20, [insets.bottom]);

  const tabBarItemStyle = {
    flex: 1,
    minWidth: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  const baseTabLabelStyle = {
    fontFamily: "PretendardLight",
    fontSize: 10,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg.light },
        tabBarActiveTintColor: colors.bg.dark,
        tabBarInactiveTintColor: colors.disabled,
        tabBarStyle: {
          height: 56 + tabBarBottomSpacing,
          paddingTop: 8,
          paddingBottom: tabBarBottomSpacing,
        },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontFamily: "PretendardLight",
          fontSize: 10,
        },
      }}
    >
      {tabsConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={`${tab.name}/index`}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon tab={tab.name as TabRouteName} focused={focused} />
            ),
            tabBarItemStyle,
            tabBarLabelStyle: {
              ...baseTabLabelStyle,
              marginTop: tab.labelSpacing,
            },
          }}
        />
      ))}
    </Tabs>
  );
}
