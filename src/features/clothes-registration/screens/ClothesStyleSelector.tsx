import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  clothingCategoryGroups,
  clothingCategoryRows,
  clothingColors,
  splitIntoChipRows,
} from "@/features/clothes-registration/screens/ClothesStyleData";
import {
  getCategoryChipIcon,
  getColorChipIcon,
} from "@/features/clothes-registration/screens/clothes-style-chip-icons";

type ClothesStyleSelectorProps = {
  selectedColor?: string | null;
  selectedCategory?: string | null;
  onChangeCategory?: (category: string) => void;
  onChangeColor?: (color: string) => void;
  variant?: "compact" | "grouped";
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
  selectedColor,
  selectedCategory,
  onChangeCategory,
  onChangeColor,
  variant = "compact",
}: ClothesStyleSelectorProps) {
  const [uncontrolledColor, setUncontrolledColor] = useState("Black");
  const [uncontrolledCategory, setUncontrolledCategory] = useState("T-shirt");
  const currentColor = selectedColor === undefined ? uncontrolledColor : selectedColor;
  const currentCategory = selectedCategory === undefined ? uncontrolledCategory : selectedCategory;

  return (
    <>
      <Text className="mt-[39px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
        색상
      </Text>
      {variant === "grouped" ? (
        <View className="mt-[24px] gap-[8px]">
          {splitIntoChipRows(clothingColors).map((row, rowIndex) => (
            <View
              key={`color-row-${rowIndex + 1}`}
              className={row.length === 4 ? "flex-row justify-between" : "flex-row gap-[8px]"}
            >
              {row.map((color) => (
                <ColorChip
                  key={color.name}
                  color={color}
                  onPress={() => {
                    setUncontrolledColor(color.name);
                    onChangeColor?.(color.name);
                  }}
                  selected={color.name === currentColor}
                />
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-[24px] flex-row flex-wrap gap-[6px]">
          {clothingColors.map((color) => (
            <ColorChip
              key={color.name}
              color={color}
              onPress={() => {
                setUncontrolledColor(color.name);
                onChangeColor?.(color.name);
              }}
              selected={color.name === currentColor}
            />
          ))}
        </View>
      )}

      <Text
        className={[
          "font-pretendard-semibold text-[20px] leading-[24px] text-text",
          variant === "grouped" ? "mt-[27px]" : "mt-[34px]",
        ].join(" ")}
      >
        카테고리
      </Text>
      {variant === "grouped" ? (
        <View className="mt-[20px]">
          {clothingCategoryGroups.map((group) => (
            <View key={group.title} className="mb-[30px]">
              <Text className="font-pretendard text-[15px] leading-[20px] text-text">
                {group.title}
              </Text>
              <View className="mt-[10px] gap-[8px]">
                {splitIntoChipRows(group.categories).map((row, rowIndex) => (
                  <View
                    key={`${group.title}-row-${rowIndex + 1}`}
                    className={
                      row.length === 4 ? "flex-row justify-between" : "flex-row gap-[14px]"
                    }
                  >
                    {row.map((category) => (
                      <CategoryChip
                        key={category}
                        label={category}
                        onPress={() => {
                          setUncontrolledCategory(category);
                          onChangeCategory?.(category);
                        }}
                        selected={category === currentCategory}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-[21px] gap-[6px]">
          {clothingCategoryRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-[6px]">
              {row.map((category) => (
                <CategoryChip
                  key={category}
                  label={category}
                  onPress={() => {
                    setUncontrolledCategory(category);
                    onChangeCategory?.(category);
                  }}
                  selected={category === currentCategory}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </>
  );
}
