import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import {
  createClothes,
  toClothesCategoryValue,
  toClothesColorValue,
} from "@/features/clothes-registration/api/createClothes";
import { useClothesStorageSections } from "@/features/clothes-registration/hooks/use-clothes-storage-sections";
import { uploadClothesPhoto } from "@/features/clothes-registration/api/uploadClothesPhoto";
import {
  getParamString,
  normalizeCategoryName,
  normalizeColorName,
} from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { showToast } from "@/lib/ui/showToast";
import type { ClosetSectionOption } from "@/features/closet/utils/closet-section-options";
import { queryClient } from "@/lib/queryClient";

function formatPrice(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function AnalysisResultHeader({
  imageSource,
  color,
  category,
  showAnalysis = true,
}: {
  imageSource?: string;
  color: string;
  category: string;
  showAnalysis?: boolean;
}) {
  return (
    <View className="mt-[24px] flex-row items-start">
      <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-white">
        {imageSource ? (
          <Image className="h-full w-full" resizeMode="cover" source={{ uri: imageSource }} />
        ) : (
          <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
            이미지
          </Text>
        )}
      </View>

      {showAnalysis ? (
        <View className="ml-[18px]">
          <Text className="font-pretendard text-[12px] leading-[20px] text-bg-dark">
            AI 분석 결과
          </Text>
          <View className="mt-[8px] flex-row gap-[6px]">
            <View className="h-[32px] min-w-[70px] items-center justify-center rounded-full bg-bg-dark px-[18px]">
              <Text className="font-pretendard text-[12px] leading-[16px] text-white">{color}</Text>
            </View>
            <View className="h-[32px] min-w-[78px] items-center justify-center rounded-full bg-primary px-[18px]">
              <Text className="font-pretendard text-[12px] leading-[16px] text-accent">
                {category}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function LabeledInput({
  label,
  value,
  placeholder,
  unit,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  unit?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View>
      <Text className="font-pretendard-semibold text-[16px] leading-[24px] text-text">{label}</Text>
      <View className="mt-[14px] flex-row items-center">
        <TextInput
          className="h-[44px] flex-1 rounded-lg border-[0.5px] border-disabled bg-white px-[20px] font-pretendard text-[12px] text-text"
          keyboardType="number-pad"
          onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={colors.disabled}
          style={{ includeFontPadding: false, lineHeight: 16, paddingBottom: 2, paddingTop: 0 }}
          value={value}
        />
        {unit ? (
          <Text className="ml-[10px] font-pretendard text-[12px] leading-[20px] text-bg-dark">
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ClosetSelect({
  options,
  selectedOption,
  onSelect,
}: {
  options: ClosetSectionOption[];
  selectedOption: ClosetSectionOption | null;
  onSelect: (option: ClosetSectionOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mt-[28px]">
      <Text className="font-pretendard-semibold text-[16px] leading-[24px] text-text">
        옷장 보관 칸
      </Text>

      <View
        className={[
          "mt-[14px] overflow-hidden rounded-lg border-[0.5px] border-disabled bg-white",
          open ? "pb-[7px]" : "",
        ].join(" ")}
      >
        <Pressable
          className="h-[44px] flex-row items-center justify-between px-[20px]"
          disabled={options.length === 0}
          onPress={() => setOpen((current) => !current)}
        >
          <Text className="font-pretendard text-[12px] leading-[20px] text-text">
            {selectedOption?.label ?? "보관 칸을 불러오는 중"}
          </Text>
          <Text className="font-pretendard text-[18px] leading-[20px] text-disabled">⌄</Text>
        </Pressable>

        {open && options.length > 0 ? (
          <ScrollView className="max-h-[220px]" contentContainerClassName="px-[20px]">
            {options.map((option) => (
              <Pressable
                key={option.templateSectionId}
                className="h-[41px] justify-center border-t-[0.5px] border-disabled"
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                <Text className="font-pretendard text-[12px] leading-[20px] text-disabled">
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

export function ClothesAdditionalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    imageUri: imageUriParam,
    imageUrl: imageUrlParam,
    photoId: photoIdParam,
    predictedColor: predictedColorParam,
    predictedCategory: predictedCategoryParam,
    selectedColor: selectedColorParam,
    selectedCategory: selectedCategoryParam,
    entryMode: entryModeParam,
  } = useLocalSearchParams<{
    imageUri?: string;
    imageUrl?: string;
    photoId?: string;
    predictedColor?: string;
    predictedCategory?: string;
    selectedColor?: string;
    selectedCategory?: string;
    entryMode?: string;
  }>();
  const imageUri = getParamString(imageUriParam);
  const imageUrl = getParamString(imageUrlParam);
  const photoId = Number(getParamString(photoIdParam));
  const predictedColor = normalizeColorName(getParamString(predictedColorParam));
  const predictedCategory = normalizeCategoryName(getParamString(predictedCategoryParam));
  const selectedColor = normalizeColorName(getParamString(selectedColorParam) ?? predictedColor);
  const selectedCategory = normalizeCategoryName(
    getParamString(selectedCategoryParam) ?? predictedCategory,
  );
  const {
    options: closetSectionOptions,
    isLoading: isClosetSectionsLoading,
    error: closetSectionsError,
  } = useClothesStorageSections();
  const isManualEntry = getParamString(entryModeParam) === "manual";
  const [price, setPrice] = useState("");
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(null);
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
    if (isSaving) {
      return;
    }

    const priceValue = Number(price);

    if ((!Number.isFinite(photoId) || photoId <= 0 || !imageUrl) && !imageUri) {
      showToast("사진 업로드 정보를 확인할 수 없어요. 다시 시도해주세요.");
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      showToast("가격을 입력해주세요.");
      return;
    }

    if (!selectedClosetOption) {
      showToast(closetSectionsError ? "옷장 보관 칸 정보를 불러오지 못했어요." : "보관 칸을 선택해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const uploadedPhoto =
        Number.isFinite(photoId) && photoId > 0 && imageUrl
          ? { photoId, imageUrl }
          : await uploadClothesPhoto(imageUri ?? "");

      await createClothes({
        photoId: uploadedPhoto.photoId,
        imageUrl: uploadedPhoto.imageUrl,
        color: toClothesColorValue(selectedColor),
        category: toClothesCategoryValue(selectedCategory),
        price: priceValue,
        sectionId: selectedClosetOption.requestSectionId,
      });

      await queryClient.invalidateQueries({ queryKey: ["home-summary"] });
      router.replace("/clothes/register/complete");
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
        <HeaderLogo width={118} height={15} />

        <Text className="mt-[34px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          추가정보를 입력해주세요.
        </Text>

        <AnalysisResultHeader
          category={selectedCategory}
          color={selectedColor}
          imageSource={imageUrl || imageUri}
          showAnalysis={!isManualEntry}
        />

        <View className="mt-[34px]">
          <LabeledInput
            label="가격"
            onChangeText={setPrice}
            placeholder="숫자만 입력 가능"
            unit="원"
            value={formatPrice(price)}
          />

          <ClosetSelect
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
              옷장 보관 칸 정보를 불러오지 못했어요. 임시 데이터 또는 API 연결 상태를 확인해주세요.
            </Text>
          ) : null}
        </View>

        <View className="mt-auto">
          <Button
            label={isSaving ? "저장 중..." : "저장하기"}
            disabled={isSaving}
            fullWidth
            className="h-[58px]"
            onPress={handleSave}
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
