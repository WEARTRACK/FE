import { tabsConfig, type TabRouteName } from "@/features/navigation/tabs.config";

type TabBarIconProps = {
  tab: TabRouteName;
  focused: boolean;
};

export function TabBarIcon({ tab, focused }: TabBarIconProps) {
  const tabMeta = tabsConfig.find((item) => item.name === tab);
  const IconComponent = focused ? tabMeta?.icons.active : tabMeta?.icons.inactive;

  if (!tabMeta || !IconComponent) {
    return null;
  }

  return <IconComponent width={tabMeta.iconSize} height={tabMeta.iconSize} />;
}
