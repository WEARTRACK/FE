import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import BlackActiveIcon from "../../../../assets/color/black-active.svg";
import BlackInactiveIcon from "../../../../assets/color/black-inactive.svg";
import BeigeActiveIcon from "../../../../assets/color/beige-active.svg";
import BeigeInactiveIcon from "../../../../assets/color/beige-inactive.svg";
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
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import type { ClosetCategory, ClosetColor } from "@/features/closet/types/closet-item";

type SearchSelectMode = "color" | "category";

const colorRows: ClosetColor[][] = [
  ["red", "pink", "orange", "yellow"],
  ["green", "blue", "navy", "purple"],
  ["white", "beige", "gray", "brown"],
  ["black"],
];

const categoryRows: ClosetCategory[][] = [
  ["tshirt", "shirt", "knit"],
  ["hoodie", "vest", "cardigan"],
  ["pants", "shorts", "skirt", "dress"],
  ["jacket", "coat", "padding"],
];

const colorActiveIconMap: Record<ClosetColor, React.ComponentType<SvgProps>> = {
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

const colorInactiveIconMap: Record<ClosetColor, React.ComponentType<SvgProps>> = {
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

const categoryActiveIconMap: Record<ClosetCategory, React.ComponentType<SvgProps>> = {
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

const categoryInactiveIconMap: Record<ClosetCategory, React.ComponentType<SvgProps>> = {
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

function pickSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function isSelectMode(value: string | null): value is SearchSelectMode {
  return value === "color" || value === "category";
}

export function ClosetSearchSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const localSearchParams = useLocalSearchParams<{ mode?: string | string[]; entryKey?: string | string[] }>();

  const mode = useMemo(() => {
    const parsed = pickSingle(localSearchParams.mode);
    return isSelectMode(parsed) ? parsed : null;
  }, [localSearchParams.mode]);

  const [selectedColor, setSelectedColor] = useState<ClosetColor | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClosetCategory | null>(null);
  const lastEntryKeyRef = useRef<string | null>(null);
  const entryKey = useMemo(() => pickSingle(localSearchParams.entryKey), [localSearchParams.entryKey]);

  useEffect(() => {
    if (!entryKey) {
      return;
    }
    if (lastEntryKeyRef.current !== entryKey) {
      lastEntryKeyRef.current = entryKey;
      setSelectedColor(null);
      setSelectedCategory(null);
    }
  }, [entryKey]);

  if (!mode) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-light px-6">
        <Text className="font-pretendard text-body text-text-subdued">유효하지 않은 검색 모드입니다.</Text>
      </View>
    );
  }

  const isColorMode = mode === "color";

  return (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-10" style={{ top: insets.top + 15 }}>
        <BackButton accessibilityLabel="메인홈으로 돌아가기" />
      </View>

      <View className="absolute left-0 right-0" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard text-headline text-text-subdued">
          {isColorMode ? "색상으로 찾기" : "카테고리로 찾기"}
        </Text>
      </View>

      <Text className="font-pretendard-semibold text-headline text-text" style={{ marginTop: insets.top + 67 }}>
        {isColorMode ? "색상을 선택해주세요." : "카테고리를 선택해주세요."}
      </Text>

      <View className="mt-6 items-start">
        {(isColorMode ? colorRows : categoryRows).map((row, rowIndex, rows) => (
          <View
            key={`row-${rowIndex}`}
            className="flex-row self-start justify-start"
            style={{ marginBottom: rowIndex === rows.length - 1 ? 0 : 6 }}
          >
            {row.map((item, itemIndex) => {
              const chipSpacingStyle = { marginRight: itemIndex === row.length - 1 ? 0 : 6 };

              if (isColorMode) {
                const color = item as ClosetColor;
                const Icon =
                  selectedColor === color ? colorActiveIconMap[color] : colorInactiveIconMap[color];
                return (
                  <View key={color} style={chipSpacingStyle}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedColor === color }}
                      onPress={() => setSelectedColor(color)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                      })}
                    >
                      <Icon />
                    </Pressable>
                  </View>
                );
              }

              const category = item as ClosetCategory;
              const Icon =
                selectedCategory === category
                  ? categoryActiveIconMap[category]
                  : categoryInactiveIconMap[category];
              return (
                <View key={category} style={chipSpacingStyle}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedCategory === category }}
                    onPress={() => setSelectedCategory(category)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Icon />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className="absolute left-6 right-6" style={{ bottom: 8 }}>
        <Button
          className="rounded-[10px]"
          fullWidth
          label="내 옷 찾기"
          onPress={() => {
            if (isColorMode) {
              if (!selectedColor) {
                return;
              }
              router.push({
                pathname: "/home/search/results",
                params: { mode: "color", value: selectedColor },
              });
              return;
            }

            if (!selectedCategory) {
              return;
            }
            router.push({
              pathname: "/home/search/results",
              params: { mode: "category", value: selectedCategory },
            });
          }}
          disabled={isColorMode ? !selectedColor : !selectedCategory}
          size="lg"
          variant="primary"
        />
      </View>
    </View>
  );
}
