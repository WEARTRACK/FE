import { Tabs } from "expo-router";
import { useMemo } from "react";

import { colors } from "@/constants/colors";
import { TabBarIcon } from "@/features/navigation/components/TabBarIcon";
import { tabsConfig, type TabRouteName } from "@/features/navigation/tabs.config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();

  const tabBarBottomSpacing = useMemo(() => insets.bottom + 20, [insets.bottom]);

  const getTab = (name: TabRouteName) => {
    return tabsConfig.find((tab) => tab.name === name);
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
      <Tabs.Screen
        name="home/index"
        options={{
          title: getTab("home")?.title,
          tabBarIcon: ({ focused }) => <TabBarIcon tab="home" focused={focused} />,
          tabBarItemStyle: {
            flex: 1,
            minWidth: 44,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontFamily: "PretendardLight",
            fontSize: 10,
            marginTop: getTab("home")?.labelSpacing,
          },
        }}
      />
      <Tabs.Screen
        name="closet/index"
        options={{
          title: getTab("closet")?.title,
          tabBarIcon: ({ focused }) => <TabBarIcon tab="closet" focused={focused} />,
          tabBarItemStyle: {
            flex: 1,
            minWidth: 44,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontFamily: "PretendardLight",
            fontSize: 10,
            marginTop: getTab("closet")?.labelSpacing,
          },
        }}
      />
      <Tabs.Screen
        name="report/index"
        options={{
          title: getTab("report")?.title,
          tabBarIcon: ({ focused }) => <TabBarIcon tab="report" focused={focused} />,
          tabBarItemStyle: {
            flex: 1,
            minWidth: 44,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontFamily: "PretendardLight",
            fontSize: 10,
            marginTop: getTab("report")?.labelSpacing,
          },
        }}
      />
      <Tabs.Screen
        name="mypage/index"
        options={{
          title: getTab("mypage")?.title,
          tabBarIcon: ({ focused }) => <TabBarIcon tab="mypage" focused={focused} />,
          tabBarItemStyle: {
            flex: 1,
            minWidth: 44,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontFamily: "PretendardLight",
            fontSize: 10,
            marginTop: getTab("mypage")?.labelSpacing,
          },
        }}
      />
    </Tabs>
  );
}
