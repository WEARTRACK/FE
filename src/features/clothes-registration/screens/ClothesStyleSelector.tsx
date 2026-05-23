import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  clothingCategoryRows,
  clothingColors,
} from "@/features/clothes-registration/screens/ClothesStyleData";
import {
  getCategoryChipIcon,
  getColorChipIcon,
} from "@/features/clothes-registration/screens/clothes-style-chip-icons";

type ClothesStyleSelectorProps = {
  selectedColor?: string;
  selectedCategory?: string;
  onChangeCategory?: (category: string) => void;
  onChangeColor?: (color: string) => void;
};

type ColorChipProps = {
  color: (typeof clothingColors)[number];
  selected: boolean;
  onPress: () => void;
};

function ColorChip({ color, selected, onPress }: ColorChipProps) {
  const Icon = getColorChipIcon(color.name, selected);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Icon />
    </Pressable>
  );
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = getCategoryChipIcon(label, selected);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
      <Icon />
    </Pressable>
  );
}

export function ClothesStyleSelector({
  selectedColor = "Black",
  selectedCategory = "T-shirt",
  onChangeCategory,
  onChangeColor,
}: ClothesStyleSelectorProps) {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory);

  return (
    <>
      <Text className="mt-[39px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
        색상
      </Text>
      <View className="mt-[24px] flex-row flex-wrap gap-[6px]">
        {clothingColors.map((color) => (
          <ColorChip
            key={color.name}
            color={color}
            onPress={() => {
              setCurrentColor(color.name);
              onChangeColor?.(color.name);
            }}
            selected={color.name === currentColor}
          />
        ))}
      </View>

      <Text className="mt-[34px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
        카테고리
      </Text>
      <View className="mt-[21px] gap-[6px]">
        {clothingCategoryRows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-[6px]">
            {row.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                onPress={() => {
                  setCurrentCategory(category);
                  onChangeCategory?.(category);
                }}
                selected={category === currentCategory}
              />
            ))}
          </View>
        ))}
      </View>
    </>
  );
}
