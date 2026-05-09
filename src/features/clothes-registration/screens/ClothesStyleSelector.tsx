import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  clothingCategoryRows,
  clothingColors,
} from "@/features/clothes-registration/screens/ClothesStyleData";

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

function getActiveColorText(color: (typeof clothingColors)[number]) {
  return ["Navy", "Black"].includes(color.name) ? "#FFFFFF" : color.borderColor;
}

function ColorChip({ color, selected, onPress }: ColorChipProps) {
  const backgroundColor = selected ? color.backgroundColor : "#BDBDBD";
  const borderColor = selected ? color.borderColor : "#BDBDBD";

  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor,
        borderColor,
        borderRadius: 999,
        borderWidth: 0.5,
        height: 32,
        justifyContent: "center",
        minWidth: 58,
        paddingHorizontal: 18,
      }}
    >
      <Text
        className="font-pretendard text-[12px] leading-[14px]"
        style={{
          color: selected ? getActiveColorText(color) : "#FFFFFF",
        }}
      >
        {color.name}
      </Text>
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
  return (
    <Pressable
      className={[
        "h-[32px] min-w-[58px] items-center justify-center rounded-full border-[0.5px] px-[18px]",
        selected ? "border-primary bg-primary" : "border-primary bg-white",
      ].join(" ")}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text className="font-pretendard text-[12px] leading-[14px] text-accent">{label}</Text>
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
      <View className="mt-[24px] flex-row flex-wrap gap-x-[8px] gap-y-[5px]">
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
      <View className="mt-[21px] gap-[5px]">
        {clothingCategoryRows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-[8px]">
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
