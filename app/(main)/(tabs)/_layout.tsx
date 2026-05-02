import { Tabs } from "expo-router";
import { useMemo } from "react";

import { CommonHeader } from "@/components/common/CommonHeader";
import { colors } from "@/constants/colors";
import { TabBarIcon } from "@/features/navigation/components/TabBarIcon";
import { tabsConfig, type TabRouteName } from "@/features/navigation/tabs.config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();

  const tabBarBottomSpacing = useMemo(() => insets.bottom + 20, [insets.bottom]);
  const homeTab = tabsConfig.find((tab) => tab.name === "home");
  const otherTabs = tabsConfig.filter((tab) => tab.name !== "home");

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
          backgroundColor: colors.bg.light,
        },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontFamily: "PretendardLight",
          fontSize: 10,
        },
      }}
    >
      {homeTab ? (
        <Tabs.Screen
          key={homeTab.name}
          name={`${homeTab.name}/index`}
          options={{
            title: homeTab.title,
            header: () => <CommonHeader />,
            headerShown: true,
            tabBarIcon: ({ focused }) => <TabBarIcon tab={homeTab.name} focused={focused} />,
            tabBarItemStyle,
            tabBarLabelStyle: {
              ...baseTabLabelStyle,
              marginTop: homeTab.labelSpacing,
            },
          }}
        />
      ) : null}

      {otherTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name === "closet" ? "closet" : `${tab.name}/index`}
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
