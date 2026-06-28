import type { SvgProps } from "react-native-svg";

import CardiganActiveIcon from "../../../../assets/category/cardigan-active.svg";
import CardiganInactiveIcon from "../../../../assets/category/cardigan-inactive.svg";
import CoatActiveIcon from "../../../../assets/category/coat-active.svg";
import CoatInactiveIcon from "../../../../assets/category/coat-inactive.svg";
import DressActiveIcon from "../../../../assets/category/dress-active.svg";
import DressInactiveIcon from "../../../../assets/category/dress-inactive.svg";
import HoodieActiveIcon from "../../../../assets/category/hoodie-active.svg";
import HoodieInactiveIcon from "../../../../assets/category/hoodie-inactive.svg";
import JacketActiveIcon from "../../../../assets/category/jacket-active.svg";
import JacketInactiveIcon from "../../../../assets/category/jacket-inactive.svg";
import KnitActiveIcon from "../../../../assets/category/knit-active.svg";
import KnitInactiveIcon from "../../../../assets/category/knit-inactive.svg";
import PaddingActiveIcon from "../../../../assets/category/padding-active.svg";
import PaddingInactiveIcon from "../../../../assets/category/padding-inactive.svg";
import PantsActiveIcon from "../../../../assets/category/pants-active.svg";
import PantsInactiveIcon from "../../../../assets/category/pants-inactive.svg";
import ShirtActiveIcon from "../../../../assets/category/shirt-active.svg";
import ShirtInactiveIcon from "../../../../assets/category/shirt-inactive.svg";
import ShortsActiveIcon from "../../../../assets/category/shorts-active.svg";
import ShortsInactiveIcon from "../../../../assets/category/shorts-inactive.svg";
import SkirtActiveIcon from "../../../../assets/category/skirt-active.svg";
import SkirtInactiveIcon from "../../../../assets/category/skirt-inactive.svg";
import TshirtActiveIcon from "../../../../assets/category/tshirt-active.svg";
import TshirtInactiveIcon from "../../../../assets/category/tshirt-inactive.svg";
import VestActiveIcon from "../../../../assets/category/vest-active.svg";
import VestInactiveIcon from "../../../../assets/category/vest-inactive.svg";
import BeigeActiveIcon from "../../../../assets/color/beige-active.svg";
import BeigeInactiveIcon from "../../../../assets/color/beige-inactive.svg";
import BlackActiveIcon from "../../../../assets/color/black-active.svg";
import BlackInactiveIcon from "../../../../assets/color/black-inactive.svg";
import BlueActiveIcon from "../../../../assets/color/blue-active.svg";
import BlueInactiveIcon from "../../../../assets/color/blue-inactive.svg";
import BrownActiveIcon from "../../../../assets/color/brown-active.svg";
import BrownInactiveIcon from "../../../../assets/color/brown-inactive.svg";
import GrayActiveIcon from "../../../../assets/color/gray-active.svg";
import GrayInactiveIcon from "../../../../assets/color/gray-inactive.svg";
import GreenActiveIcon from "../../../../assets/color/green-active.svg";
import GreenInactiveIcon from "../../../../assets/color/green-inactive.svg";
import NavyActiveIcon from "../../../../assets/color/navy-active.svg";
import NavyInactiveIcon from "../../../../assets/color/navy-inactive.svg";
import OrangeActiveIcon from "../../../../assets/color/orange-active.svg";
import OrangeInactiveIcon from "../../../../assets/color/orange-inactive.svg";
import PinkActiveIcon from "../../../../assets/color/pink-active.svg";
import PinkInactiveIcon from "../../../../assets/color/pink-inactive.svg";
import PurpleActiveIcon from "../../../../assets/color/purple-active.svg";
import PurpleInactiveIcon from "../../../../assets/color/purple-inactive.svg";
import RedActiveIcon from "../../../../assets/color/red-active.svg";
import RedInactiveIcon from "../../../../assets/color/red-inactive.svg";
import WhiteActiveIcon from "../../../../assets/color/white-active.svg";
import WhiteInactiveIcon from "../../../../assets/color/white-inactive.svg";
import YellowActiveIcon from "../../../../assets/color/yellow-active.svg";
import YellowInactiveIcon from "../../../../assets/color/yellow-inactive.svg";

type ChipIcon = React.ComponentType<SvgProps>;

const colorActiveIconMap: Record<string, ChipIcon> = {
  red: RedActiveIcon,
  pink: PinkActiveIcon,
  orange: OrangeActiveIcon,
  yellow: YellowActiveIcon,
  green: GreenActiveIcon,
  blue: BlueActiveIcon,
  navy: NavyActiveIcon,
  purple: PurpleActiveIcon,
  white: WhiteActiveIcon,
  beige: BeigeActiveIcon,
  gray: GrayActiveIcon,
  brown: BrownActiveIcon,
  black: BlackActiveIcon,
};

const colorInactiveIconMap: Record<string, ChipIcon> = {
  red: RedInactiveIcon,
  pink: PinkInactiveIcon,
  orange: OrangeInactiveIcon,
  yellow: YellowInactiveIcon,
  green: GreenInactiveIcon,
  blue: BlueInactiveIcon,
  navy: NavyInactiveIcon,
  purple: PurpleInactiveIcon,
  white: WhiteInactiveIcon,
  beige: BeigeInactiveIcon,
  gray: GrayInactiveIcon,
  brown: BrownInactiveIcon,
  black: BlackInactiveIcon,
};

const categoryActiveIconMap: Record<string, ChipIcon> = {
  tshirt: TshirtActiveIcon,
  shirt: ShirtActiveIcon,
  knit: KnitActiveIcon,
  hoodie: HoodieActiveIcon,
  vest: VestActiveIcon,
  cardigan: CardiganActiveIcon,
  pants: PantsActiveIcon,
  shorts: ShortsActiveIcon,
  skirt: SkirtActiveIcon,
  dress: DressActiveIcon,
  jacket: JacketActiveIcon,
  coat: CoatActiveIcon,
  padding: PaddingActiveIcon,
};

const categoryInactiveIconMap: Record<string, ChipIcon> = {
  tshirt: TshirtInactiveIcon,
  shirt: ShirtInactiveIcon,
  knit: KnitInactiveIcon,
  hoodie: HoodieInactiveIcon,
  vest: VestInactiveIcon,
  cardigan: CardiganInactiveIcon,
  pants: PantsInactiveIcon,
  shorts: ShortsInactiveIcon,
  skirt: SkirtInactiveIcon,
  dress: DressInactiveIcon,
  jacket: JacketInactiveIcon,
  coat: CoatInactiveIcon,
  padding: PaddingInactiveIcon,
};

function toKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

export function getColorChipIcon(color: string, selected: boolean) {
  const key = toKey(color);
  if (selected) {
    return colorActiveIconMap[key] ?? GrayActiveIcon;
  }
  return colorInactiveIconMap[key] ?? GrayInactiveIcon;
}

export function getCategoryChipIcon(category: string, selected: boolean) {
  const key = toKey(category);
  if (selected) {
    return categoryActiveIconMap[key] ?? ShirtActiveIcon;
  }
  return categoryInactiveIconMap[key] ?? ShirtInactiveIcon;
}
