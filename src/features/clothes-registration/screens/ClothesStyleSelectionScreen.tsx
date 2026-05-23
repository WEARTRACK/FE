import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";
import { launchClothesImageLibrary } from "@/features/clothes-registration/utils/launchClothesCamera";
import {
  getParamString,
  normalizeCategoryName,
  normalizeColorName,
} from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { showToast } from "@/lib/ui/showToast";

export function ClothesStyleSelectionScreen() {
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
  const initialColor = normalizeColorName(getParamString(predictedColorParam));
  const initialCategory = normalizeCategoryName(getParamString(predictedCategoryParam));
  const [selectedImageUri, setSelectedImageUri] = useState(imageUri);
  const [selectedImageUrl, setSelectedImageUrl] = useState(imageUrl);
  const [selectedPhotoId, setSelectedPhotoId] = useState(photoId);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const displayImageUri = selectedImageUrl || selectedImageUri;

  const handlePressImage = async () => {
    try {
      const nextImageUri = await launchClothesImageLibrary();

      if (!nextImageUri) {
        return;
      }

      setSelectedImageUri(nextImageUri);
      setSelectedImageUrl(undefined);
      setSelectedPhotoId(undefined);
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24 }}
        contentContainerClassName="px-6 pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <HeaderLogo width={118} height={15} />

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          색상 및 카테고리를 선택해주세요.
        </Text>

        <Pressable
          className="mt-[24px] h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-white"
          onPress={handlePressImage}
          style={({ pressed }) => ({
            opacity: pressed ? 0.72 : 1,
          })}
        >
          {displayImageUri ? (
            <Image className="h-full w-full" resizeMode="cover" source={{ uri: displayImageUri }} />
          ) : (
            <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
              이미지
            </Text>
          )}
        </Pressable>

        <ClothesStyleSelector
          selectedCategory={initialCategory}
          selectedColor={initialColor}
          onChangeCategory={setSelectedCategory}
          onChangeColor={setSelectedColor}
        />
      </ScrollView>

      <View className="px-6">
        <Button
          label="다음"
          href={{
            pathname: "/clothes/register/additional-info",
            params: {
              imageUri: selectedImageUri ?? "",
              imageUrl: selectedImageUrl ?? "",
              photoId: selectedPhotoId ?? "",
              selectedColor,
              selectedCategory,
              entryMode: "manual",
            },
          }}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
