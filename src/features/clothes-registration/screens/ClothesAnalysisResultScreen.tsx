import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";
import {
  getCategoryChipIcon,
  getColorChipIcon,
} from "@/features/clothes-registration/screens/clothes-style-chip-icons";
import {
  getParamString,
  normalizeCategoryName,
  normalizeColorName,
} from "@/features/clothes-registration/utils/clothesAnalysisParams";

function AnalysisResultHeader({
  imageSource,
  color,
  category,
}: {
  imageSource?: string;
  color: string;
  category: string;
}) {
  const ColorIcon = getColorChipIcon(color, true);
  const CategoryIcon = getCategoryChipIcon(category, true);

  return (
    <View className="items-top mt-[24px] flex-row">
      <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-white">
        {imageSource ? (
          <Image className="h-full w-full" resizeMode="cover" source={{ uri: imageSource }} />
        ) : (
          <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
            이미지
          </Text>
        )}
      </View>

      <View className="ml-[18px]">
        <Text className="font-pretendard text-[12px] leading-[20px] text-bg-dark">
          AI 분석 결과
        </Text>
        <View className="mt-[8px] flex-row gap-[6px]">
          <ColorIcon />
          <CategoryIcon />
        </View>
      </View>
    </View>
  );
}

export function ClothesAnalysisResultScreen() {
  const insets = useSafeAreaInsets();
  const {
    imageUri: imageUriParam,
    imageUrl: imageUrlParam,
    photoId: photoIdParam,
    predictedColor: predictedColorParam,
    predictedCategory: predictedCategoryParam,
  } = useLocalSearchParams<{
    imageUri?: string;
    imageUrl?: string;
    photoId?: string;
    predictedColor?: string;
    predictedCategory?: string;
  }>();
  const imageUri = getParamString(imageUriParam);
  const imageUrl = getParamString(imageUrlParam);
  const photoId = getParamString(photoIdParam);
  const predictedColor = normalizeColorName(getParamString(predictedColorParam));
  const predictedCategory = normalizeCategoryName(getParamString(predictedCategoryParam));
  const [selectedColor, setSelectedColor] = useState(predictedColor);
  const [selectedCategory, setSelectedCategory] = useState(predictedCategory);
  const nextParams = {
    imageUri: imageUri ?? "",
    imageUrl: imageUrl ?? "",
    photoId: photoId ?? "",
    predictedColor,
    predictedCategory,
    selectedColor,
    selectedCategory,
  };

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24 }}
        contentContainerClassName="px-6 pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <ClothesRegistrationHeader />

        <Text className="mt-[34px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          분석이 완료됐습니다.
        </Text>

        <AnalysisResultHeader
          category={predictedCategory}
          color={predictedColor}
          imageSource={imageUrl ?? imageUri}
        />

        <ClothesStyleSelector
          selectedCategory={predictedCategory}
          selectedColor={predictedColor}
          onChangeCategory={setSelectedCategory}
          onChangeColor={setSelectedColor}
        />
      </ScrollView>

      <View className="px-6">
        <Button
          label="다음"
          href={{
            pathname: "/clothes/register/additional-info",
            params: nextParams,
          }}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
