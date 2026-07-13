import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ImagePlaceholderIcon from "../../../../assets/image-placeholder.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import {
  ClosetSectionSelect,
  PriceField,
  PurchaseDateField,
} from "@/features/clothes-registration/components/AdditionalInfoFields";
import { useClothesStorageSections } from "@/features/clothes-registration/hooks/use-clothes-storage-sections";
import { ClothesStyleSelector } from "@/features/clothes-registration/screens/ClothesStyleSelector";

function ManualHeader() {
  return (
    <View className="h-[32px] flex-row items-center justify-between">
      <BackButton />
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
        옷 등록
      </Text>
      <View className="w-[24px]" />
    </View>
  );
}

function ProductThumb() {
  return (
    <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-[#F4F6F8]">
      <ImagePlaceholderIcon height={40} width={40} />
    </View>
  );
}

export function ShoppingMallManualStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedCategory, setSelectedCategory] = useState("T-shirt");

  return (
    <View className="flex-1 bg-bg-light">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24 }}
        contentContainerClassName="px-6 pb-[24px]"
        showsVerticalScrollIndicator={false}
      >
        <ManualHeader />

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          색상 및 카테고리를 선택해주세요.
        </Text>

        <View className="mt-[24px]">
          <ProductThumb />
        </View>

        <ClothesStyleSelector
          selectedCategory={selectedCategory}
          selectedColor={selectedColor}
          onChangeCategory={setSelectedCategory}
          onChangeColor={setSelectedColor}
          variant="grouped"
        />
      </ScrollView>

      <View className="z-20 px-6" style={{ paddingBottom: insets.bottom + 20 }}>
        <Button
          label="다음"
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
          onPress={() => router.push("/clothes/register/shopping-mall/manual-details" as Href)}
        />
      </View>
    </View>
  );
}

export function ShoppingMallManualDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    options: closetSectionOptions,
    isLoading: isClosetSectionsLoading,
    error: closetSectionsError,
  } = useClothesStorageSections();
  const [purchaseDate, setPurchaseDate] = useState(() => new Date());
  const [price, setPrice] = useState("");
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(null);
  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const selectedClosetOption = useMemo(
    () =>
      closetSectionOptions.find((option) => option.requestSectionId === selectedClosetSectionId) ??
      closetSectionOptions[0] ??
      null,
    [closetSectionOptions, selectedClosetSectionId],
  );
  const canGoNext = price.trim().length > 0 && Boolean(selectedClosetOption);

  useEffect(() => {
    if (selectedClosetSectionId !== null || closetSectionOptions.length === 0) {
      return;
    }

    setSelectedClosetSectionId(closetSectionOptions[0].requestSectionId);
  }, [closetSectionOptions, selectedClosetSectionId]);

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
        <ManualHeader />

        <Text className="mt-[24px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          추가정보를 입력해주세요.
        </Text>

        <View className="mt-[24px]">
          <ProductThumb />
        </View>

        <View className="mt-[34px]">
          <PurchaseDateField onChange={setPurchaseDate} value={purchaseDate} />
        </View>

        <View className="mt-[34px]">
          <PriceField
            inputProps={keyboardAccessory.getInputAccessoryProps(0)}
            onChange={setPrice}
            value={price}
          />
        </View>

        <View className="mt-[24px]">
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

        <View className="mt-auto">
          <Button
            label="저장하기"
            disabled={!canGoNext}
            fullWidth
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
            onPress={() => router.replace("/clothes/register/complete")}
          />
        </View>
      </View>
      {keyboardAccessory.toolbar}
    </KeyboardAvoidingView>
  );
}
