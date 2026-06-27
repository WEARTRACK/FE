import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { createClothesFromLink } from "@/features/clothes-registration/api/create-clothes-from-link-api";
import {
  ClosetSectionSelect,
  PriceField,
  PurchaseDateField,
} from "@/features/clothes-registration/components/AdditionalInfoFields";
import { useClothesStorageSections } from "@/features/clothes-registration/hooks/use-clothes-storage-sections";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";
import {
  clothingCategoryGroups,
  clothingColors,
} from "@/features/clothes-registration/screens/ClothesStyleData";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";
import { queryClient } from "@/lib/queryClient";
import { showToast } from "@/lib/ui/showToast";
import { useShoppingMallRegistrationStore } from "@/stores/useShoppingMallRegistrationStore";

function normalizedStyleValue(value: string) {
  return value.toLowerCase().replace(/[\s_-]/g, "");
}

function getSupportedColor(value: string | null) {
  if (!value) {
    return null;
  }

  return (
    clothingColors.find((color) => color.name.toLowerCase() === value.toLowerCase())?.name ?? null
  );
}

function getSupportedCategory(value: string | null) {
  if (!value) {
    return null;
  }

  const categories = clothingCategoryGroups.flatMap((group) => group.categories);
  const normalizedValue = normalizedStyleValue(value);

  return categories.find((category) => normalizedStyleValue(category) === normalizedValue) ?? null;
}

function ProductThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-white">
      {imageUrl && !hasImageError ? (
        <Image
          className="h-full w-full"
          resizeMode="cover"
          source={{ uri: imageUrl }}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <Text className="font-pretendard text-[13px] leading-[18px] text-disabled">
          이미지 없음
        </Text>
      )}
    </View>
  );
}

function formatDateForRequest(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function ShoppingMallLinkStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { imageUrl, productName, color, category, setDraft } = useShoppingMallRegistrationStore();
  const [selectedColor, setSelectedColor] = useState(() => getSupportedColor(color));
  const [selectedCategory, setSelectedCategory] = useState(() => getSupportedCategory(category));

  const canContinue = Boolean(imageUrl && productName && selectedColor && selectedCategory);

  const handleContinue = () => {
    if (!canContinue || !selectedColor || !selectedCategory) {
      return;
    }

    setDraft({
      color: selectedColor,
      category: selectedCategory,
    });
    router.push(clothesRegistrationRoutes.shoppingMallDetails);
  };

  return (
    <View className="flex-1 bg-bg-light">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24 }}
        contentContainerClassName="px-6 pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <ClothesRegistrationHeader />

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          색상 및 카테고리를 선택해주세요.
        </Text>

        <View className="mt-[24px]">
          <ProductThumbnail imageUrl={imageUrl} />
        </View>

        <ClothesStyleSelector
          selectedCategory={selectedCategory}
          selectedColor={selectedColor}
          onChangeCategory={setSelectedCategory}
          onChangeColor={setSelectedColor}
          variant="grouped"
        />
      </ScrollView>

      <View className="px-6" style={{ paddingBottom: insets.bottom + 20 }}>
        <Button
          label="다음"
          disabled={!canContinue}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

export function ShoppingMallLinkDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    sourceUrl,
    imageUrl,
    productName,
    price,
    color,
    category,
    purchaseDate,
    sectionId,
    setDraft,
    resetDraft,
  } = useShoppingMallRegistrationStore();
  const {
    options: closetSectionOptions,
    isLoading: isClosetSectionsLoading,
    error: closetSectionsError,
  } = useClothesStorageSections();
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState(
    () => purchaseDate ?? new Date(),
  );
  const [priceInput, setPriceInput] = useState(() => (price === null ? "" : String(price)));
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(sectionId);
  const [isSaving, setIsSaving] = useState(false);
  const selectedClosetOption = useMemo(
    () =>
      closetSectionOptions.find((option) => option.requestSectionId === selectedClosetSectionId) ??
      closetSectionOptions[0] ??
      null,
    [closetSectionOptions, selectedClosetSectionId],
  );

  useEffect(() => {
    if (selectedClosetSectionId !== null || closetSectionOptions.length === 0) {
      return;
    }

    setSelectedClosetSectionId(closetSectionOptions[0].requestSectionId);
  }, [closetSectionOptions, selectedClosetSectionId]);

  const handleSave = async () => {
    const parsedPrice = priceInput.trim() ? Number(priceInput) : null;

    if (
      isSaving ||
      !sourceUrl ||
      !imageUrl ||
      !productName ||
      !color ||
      !category ||
      !selectedClosetOption
    ) {
      if (!isSaving) {
        showToast("상품 정보와 옷장 보관 칸을 확인해주세요.");
      }
      return;
    }

    if (parsedPrice !== null && (!Number.isInteger(parsedPrice) || parsedPrice < 0)) {
      showToast("가격은 0원 이상의 정수로 입력해주세요.");
      return;
    }

    const nextStorageLocation = selectedClosetOption.label;
    const payload = {
      sourceUrl,
      productName,
      imageUrl,
      imageType: "EXTERNAL_URL" as const,
      price: parsedPrice,
      color,
      category,
      purchaseDate: formatDateForRequest(selectedPurchaseDate),
      storageLocation: nextStorageLocation,
      sectionId: selectedClosetOption.requestSectionId,
    };

    setIsSaving(true);

    try {
      setDraft({
        price: parsedPrice,
        purchaseDate: selectedPurchaseDate,
        storageLocation: nextStorageLocation,
        sectionId: selectedClosetOption.requestSectionId,
      });
      await createClothesFromLink(payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["closet"] }),
      ]);
      resetDraft();
      router.replace(clothesRegistrationRoutes.clothesComplete);

      if (parsedPrice === 0) {
        showToast("가격 미입력 항목은 패션소비 리포트에서 제외됩니다.");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View
        className="flex-1 bg-bg-light px-6"
        style={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <ClothesRegistrationHeader />

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          추가정보를 입력해주세요.
        </Text>

        <View className="mt-[24px]">
          <ProductThumbnail imageUrl={imageUrl} />
        </View>

        <ScrollView className="mt-[34px]" showsVerticalScrollIndicator={false}>
          <PurchaseDateField onChange={setSelectedPurchaseDate} value={selectedPurchaseDate} />

          <View className="mt-[34px]">
            <PriceField onChange={setPriceInput} value={priceInput} />
          </View>

          <View className="mt-[24px] pb-[24px]">
            <ClosetSectionSelect
              options={closetSectionOptions}
              selectedOption={selectedClosetOption}
              onSelect={(option) => setSelectedClosetSectionId(option.requestSectionId)}
            />
            {isClosetSectionsLoading ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-text-subdued">
                옷장 보관 칸 정보를 불러오는 중입니다.
              </Text>
            ) : null}
            {closetSectionsError ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-error">
                옷장 보관 칸 정보를 불러오지 못했어요.
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <Button
          label={isSaving ? "저장 중..." : "저장하기"}
          disabled={isSaving || !selectedClosetOption}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
