import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import ClosetActiveIcon from "../../../assets/nav-closet-active.svg";
import ClosetInactiveIcon from "../../../assets/nav-closet-inactive.svg";
import HomeActiveIcon from "../../../assets/nav-home-active.svg";
import HomeInactiveIcon from "../../../assets/nav-home-inactive.svg";
import ProfileActiveIcon from "../../../assets/nav-profile-active.svg";
import ProfileInactiveIcon from "../../../assets/nav-profile-inactive.svg";
import ReportActiveIcon from "../../../assets/nav-report-active.svg";
import ReportInactiveIcon from "../../../assets/nav-report-inactive.svg";

type TabIconPair = {
  active: ComponentType<SvgProps>;
  inactive: ComponentType<SvgProps>;
};

export type TabRouteName = "home" | "closet" | "report" | "mypage";

export const tabsConfig: {
  name: TabRouteName;
  title: string;
  icons: TabIconPair;
  iconSize: number;
  labelSpacing: number;
}[] = [
  {
    name: "home",
    title: "홈",
    icons: { active: HomeActiveIcon, inactive: HomeInactiveIcon },
    iconSize: 24,
    labelSpacing: 1,
  },
  {
    name: "closet",
    title: "내 옷장",
    icons: { active: ClosetActiveIcon, inactive: ClosetInactiveIcon },
    iconSize: 26,
    labelSpacing: 1,
  },
  {
    name: "report",
    title: "리포트",
    icons: { active: ReportActiveIcon, inactive: ReportInactiveIcon },
    iconSize: 26,
    labelSpacing: 1,
  },
  {
    name: "mypage",
    title: "마이페이지",
    icons: { active: ProfileActiveIcon, inactive: ProfileInactiveIcon },
    iconSize: 26,
    labelSpacing: 0,
  },
];
