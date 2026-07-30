import {
  clothingCategories,
  clothingColors,
} from "@/features/clothes-registration/screens/ClothesStyleData";

export function getParamString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeColorName(value: string | null | undefined) {
  if (!value) {
    return "Black";
  }

  const matchedColor = clothingColors.find(
    (color) => color.name.toLowerCase() === value.toLowerCase(),
  );

  return matchedColor?.name ?? "Black";
}

export function normalizeCategoryName(value: string | null | undefined) {
  if (!value) {
    return "T-shirt";
  }

  const normalizedValue = value.toLowerCase().replace(/[\s_-]/g, "");
  const matchedCategory = clothingCategories.find(
    (category) => category.toLowerCase().replace(/[\s_-]/g, "") === normalizedValue,
  );

  return matchedCategory ?? "T-shirt";
}
