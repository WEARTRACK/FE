import { Tabs } from "expo-router";
import { StackActions } from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/constants/colors";
import { TabBarIcon } from "@/features/navigation/components/TabBarIcon";
import { tabsConfig, type TabRouteName } from "@/features/navigation/tabs.config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function resolveActiveTab(routeName: string): TabRouteName | null {
  if (routeName.startsWith("home")) {
    return "home";
  }
  if (routeName.startsWith("closet")) {
    return "closet";
  }
  if (routeName.startsWith("report")) {
    return "report";
  }
  if (routeName.startsWith("mypage")) {
    return "mypage";
  }
  return null;
}

function resolveTabScreenName(tab: TabRouteName): string {
  if (tab === "home") {
    return "home";
  }
  if (tab === "closet" || tab === "report") {
    return tab;
  }
  return `${tab}/index`;
}

type NestedNavigationState = {
  index?: number;
  routes?: {
    name?: string;
    state?: NestedNavigationState;
  }[];
};

function getDeepestActiveRouteName(route: { name?: string; state?: unknown } | undefined) {
  let activeRoute: { name?: string; state?: unknown } | undefined = route;

  while (activeRoute?.state && typeof activeRoute.state === "object") {
    const nestedState = activeRoute.state as NestedNavigationState;
    const nestedRoutes = nestedState.routes;

    if (!nestedRoutes?.length) {
      break;
    }

    activeRoute = nestedRoutes[nestedState.index ?? 0];
  }

  return activeRoute?.name;
}

function MainTabBar({
  state,
  navigation,
  insetsBottom,
}: BottomTabBarProps & { insetsBottom: number }) {
  const tabBarBottomSpacing = insetsBottom + 20;
  const activeTab = resolveActiveTab(state.routeNames[state.index] ?? "");
  const activeRouteName = getDeepestActiveRouteName(state.routes[state.index]);

  if (activeRouteName === "pre-purchase-check") {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: "row",
        height: 56 + tabBarBottomSpacing,
        paddingTop: 8,
        paddingBottom: tabBarBottomSpacing,
        backgroundColor: colors.bg.light,
      }}
    >
      {tabsConfig.map((tab) => {
        const focused = activeTab === tab.name;
        const targetScreenName = resolveTabScreenName(tab.name);
        const targetIndex = state.routeNames.findIndex((name) => name === targetScreenName);
        const isCurrentTabRoute = targetIndex === state.index;

        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={tab.title}
            style={{
              flex: 1,
              minWidth: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              if (targetIndex < 0) {
                return;
              }

              const event = navigation.emit({
                type: "tabPress",
                target: state.routes[targetIndex]?.key,
                canPreventDefault: true,
              });

              if (
                isCurrentTabRoute &&
                (tab.name === "home" || tab.name === "closet") &&
                !event.defaultPrevented
              ) {
                const nestedNavigatorKey = (
                  state.routes[targetIndex]?.state as { key?: string } | undefined
                )?.key;

                if (nestedNavigatorKey) {
                  navigation.dispatch({ ...StackActions.popToTop(), target: nestedNavigatorKey });
                } else {
                  navigation.navigate("home");
                }
                return;
              }

              if (!isCurrentTabRoute && !event.defaultPrevented) {
                navigation.navigate(targetScreenName);
              }
            }}
          >
            <TabBarIcon focused={focused} tab={tab.name} />
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={{
                color: focused ? colors.bg.dark : colors.disabled,
                fontFamily: "PretendardLight",
                fontSize: 10,
                marginTop: tab.labelSpacing,
              }}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();

  const homeTab = tabsConfig.find((tab) => tab.name === "home");
  const otherTabs = tabsConfig.filter((tab) => tab.name !== "home");

  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} insetsBottom={insets.bottom} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg.light },
      }}
    >
      {homeTab ? (
        <Tabs.Screen
          key={homeTab.name}
          name="home"
          options={{
            title: homeTab.title,
            headerShown: false,
          }}
        />
      ) : null}

      {otherTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name === "closet" || tab.name === "report" ? tab.name : `${tab.name}/index`}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}
