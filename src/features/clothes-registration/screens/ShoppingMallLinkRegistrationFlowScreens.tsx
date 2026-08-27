import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { createClothesFromLink } from "@/features/clothes-registration/api/create-clothes-from-link-api";
import {
  ClosetSelect,
  ClosetSectionSelect,
  PriceField,
  PurchaseDateField,
} from "@/features/clothes-registration/components/AdditionalInfoFields";
import { useClosetList } from "@/features/closet/hooks/use-closet-list";
import { toClosetSectionOptions } from "@/features/closet/utils/closet-section-options";
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
    closetId,
    sectionId,
    setDraft,
    resetDraft,
  } = useShoppingMallRegistrationStore();
  const { data: closets = [], isLoading: isClosetsLoading, error: closetsError } = useClosetList();
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState(
    () => purchaseDate ?? new Date(),
  );
  const [priceInput, setPriceInput] = useState(() => (price === null ? "" : String(price)));
  const [selectedClosetId, setSelectedClosetId] = useState<number | null>(closetId);
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(sectionId);
  const [isSaving, setIsSaving] = useState(false);
  const saveInFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const closetOptions = useMemo(
    () =>
      closets.map((closet, index) => ({
        closetId: closet.closetId,
        label: closet.closetName.trim() || `내 옷장 ${index + 1}`,
      })),
    [closets],
  );
  const selectedCloset = useMemo(
    () => closets.find((closet) => closet.closetId === selectedClosetId) ?? closets[0] ?? null,
    [closets, selectedClosetId],
  );
  const selectedClosetOption = useMemo(
    () => closetOptions.find((option) => option.closetId === selectedCloset?.closetId) ?? null,
    [closetOptions, selectedCloset?.closetId],
  );
  const closetSectionOptions = useMemo(
    () => (selectedCloset ? toClosetSectionOptions(selectedCloset) : []),
    [selectedCloset],
  );
  const selectedSectionOption = useMemo(
    () =>
      closetSectionOptions.find((option) => option.requestSectionId === selectedClosetSectionId) ??
      closetSectionOptions[0] ??
      null,
    [closetSectionOptions, selectedClosetSectionId],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCloset || selectedCloset.closetId === selectedClosetId) {
      return;
    }

    setSelectedClosetId(selectedCloset.closetId);
    setSelectedClosetSectionId(null);
  }, [selectedCloset, selectedClosetId]);

  useEffect(() => {
    const isCurrentSectionValid = closetSectionOptions.some(
      (option) => option.requestSectionId === selectedClosetSectionId,
    );
    if (isCurrentSectionValid) {
      return;
    }

    setSelectedClosetSectionId(closetSectionOptions[0]?.requestSectionId ?? null);
  }, [closetSectionOptions, selectedClosetSectionId]);

  const handleSave = async () => {
    const parsedPrice = priceInput.trim() ? Number(priceInput) : null;

    if (
      isSaving ||
      saveInFlightRef.current ||
      !sourceUrl ||
      !imageUrl ||
      !productName ||
      !color ||
      !category ||
      !selectedCloset ||
      !selectedSectionOption
    ) {
      if (!isSaving) {
        showToast("상품 정보와 보관 옷장 및 칸을 확인해주세요.");
      }
      return;
    }

    if (parsedPrice !== null && (!Number.isInteger(parsedPrice) || parsedPrice < 0)) {
      showToast("가격은 0원 이상의 정수로 입력해주세요.");
      return;
    }

    const nextStorageLocation = selectedSectionOption.label;
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
      sectionId: selectedSectionOption.requestSectionId,
    };

    saveInFlightRef.current = true;
    setIsSaving(true);

    try {
      setDraft({
        price: parsedPrice,
        purchaseDate: selectedPurchaseDate,
        storageLocation: nextStorageLocation,
        closetId: selectedCloset.closetId,
        sectionId: selectedSectionOption.requestSectionId,
      });
      await createClothesFromLink(payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["closet"] }),
      ]);
      resetDraft();

      if (!mountedRef.current) {
        return;
      }

      router.replace(clothesRegistrationRoutes.clothesComplete);

      if (parsedPrice === 0) {
        showToast("가격 미입력 항목은 패션소비 리포트에서 제외됩니다.");
      }
    } catch (error) {
      if (mountedRef.current) {
        showToast(error instanceof Error ? error.message : "저장에 실패했어요. 다시 시도해주세요.");
      }
    } finally {
      saveInFlightRef.current = false;
      if (mountedRef.current) {
        setIsSaving(false);
      }
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

          <View className="mt-[24px]">
            <PriceField onChange={setPriceInput} value={priceInput} />
          </View>

          <View className="mt-[24px]">
            <ClosetSelect
              options={closetOptions}
              selectedOption={selectedClosetOption}
              onSelect={(option) => {
                setSelectedClosetId(option.closetId);
                setSelectedClosetSectionId(null);
              }}
              placeholder={isClosetsLoading ? "보관 옷장을 불러오는 중" : "등록된 옷장이 없습니다."}
              hasError={Boolean(closetsError)}
            />
            {isClosetsLoading ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-text-subdued">
                보관 옷장을 불러오는 중입니다.
              </Text>
            ) : null}
            {closetsError ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-error">
                보관 옷장을 불러오지 못했어요.
              </Text>
            ) : null}
          </View>

          <View className="mt-[24px] pb-[24px]">
            <ClosetSectionSelect
              key={selectedCloset?.closetId ?? "no-closet"}
              options={closetSectionOptions}
              selectedOption={selectedSectionOption}
              onSelect={(option) => setSelectedClosetSectionId(option.requestSectionId)}
              hasError={Boolean(closetsError)}
            />
            {isClosetsLoading ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-text-subdued">
                옷장 보관 칸 정보를 불러오는 중입니다.
              </Text>
            ) : null}
            {closetsError ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-error">
                옷장 보관 칸 정보를 불러오지 못했어요.
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <Button
          label={isSaving ? "저장 중..." : "저장하기"}
          disabled={isSaving || !selectedCloset || !selectedSectionOption}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          onPress={handleSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
