import type { SvgProps } from "react-native-svg";

import CoatTagIcon from "../../../../assets/category/coat-active.svg";
import CardiganTagIcon from "../../../../assets/category/cardigan-active.svg";
import DressTagIcon from "../../../../assets/category/dress-active.svg";
import HoodieTagIcon from "../../../../assets/category/hoodie-active.svg";
import JacketTagIcon from "../../../../assets/category/jacket-active.svg";
import KnitTagIcon from "../../../../assets/category/knit-active.svg";
import PaddingTagIcon from "../../../../assets/category/padding-active.svg";
import PantsTagIcon from "../../../../assets/category/pants-active.svg";
import ShirtTagIcon from "../../../../assets/category/shirt-active.svg";
import ShortsTagIcon from "../../../../assets/category/shorts-active.svg";
import SkirtTagIcon from "../../../../assets/category/skirt-active.svg";
import TshirtTagIcon from "../../../../assets/category/tshirt-active.svg";
import VestTagIcon from "../../../../assets/category/vest-active.svg";
import BeigeTagIcon from "../../../../assets/color/beige-active.svg";
import BlackTagIcon from "../../../../assets/color/black-active.svg";
import BlueTagIcon from "../../../../assets/color/blue-active.svg";
import BrownTagIcon from "../../../../assets/color/brown-active.svg";
import GrayTagIcon from "../../../../assets/color/gray-active.svg";
import GreenTagIcon from "../../../../assets/color/green-active.svg";
import NavyTagIcon from "../../../../assets/color/navy-active.svg";
import OrangeTagIcon from "../../../../assets/color/orange-active.svg";
import PinkTagIcon from "../../../../assets/color/pink-active.svg";
import PurpleTagIcon from "../../../../assets/color/purple-active.svg";
import RedTagIcon from "../../../../assets/color/red-active.svg";
import WhiteTagIcon from "../../../../assets/color/white-active.svg";
import YellowTagIcon from "../../../../assets/color/yellow-active.svg";

const colorIconMap: Record<string, React.ComponentType<SvgProps>> = {
  red: RedTagIcon,
  orange: OrangeTagIcon,
  yellow: YellowTagIcon,
  green: GreenTagIcon,
  navy: NavyTagIcon,
  purple: PurpleTagIcon,
  white: WhiteTagIcon,
  blue: BlueTagIcon,
  pink: PinkTagIcon,
  brown: BrownTagIcon,
  gray: GrayTagIcon,
  black: BlackTagIcon,
  beige: BeigeTagIcon,
};

const categoryIconMap: Record<string, React.ComponentType<SvgProps>> = {
  tshirt: TshirtTagIcon,
  tee: TshirtTagIcon,
  knit: KnitTagIcon,
  knite: KnitTagIcon,
  hoodie: HoodieTagIcon,
  vest: VestTagIcon,
  cardigan: CardiganTagIcon,
  pants: PantsTagIcon,
  dress: DressTagIcon,
  shirt: ShirtTagIcon,
  shorts: ShortsTagIcon,
  jacket: JacketTagIcon,
  coat: CoatTagIcon,
  skirt: SkirtTagIcon,
  padding: PaddingTagIcon,
  outer: JacketTagIcon,
};

export function getColorIcon(color: string) {
  const normalized = color.trim().toLowerCase();
  return colorIconMap[normalized] ?? GrayTagIcon;
}

export function getCategoryIcon(category: string) {
  const normalized = category.trim().toLowerCase();
  return categoryIconMap[normalized] ?? ShirtTagIcon;
}
