import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import {
  ClosetSelect,
  ClosetSectionSelect,
  PriceField,
  PurchaseDateField,
} from "@/features/clothes-registration/components/AdditionalInfoFields";
import {
  createClothes,
  toClothesCategoryValue,
  toClothesColorValue,
} from "@/features/clothes-registration/api/createClothes";
import { uploadClothesPhoto } from "@/features/clothes-registration/api/uploadClothesPhoto";
import { useClosetList } from "@/features/closet/hooks/use-closet-list";
import { toClosetSectionOptions } from "@/features/closet/utils/closet-section-options";
import {
  getCategoryChipIcon,
  getColorChipIcon,
} from "@/features/clothes-registration/screens/clothes-style-chip-icons";
import { ClothesRegistrationHeader } from "@/features/clothes-registration/screens/ClothesRegistrationHeader";
import {
  getParamString,
  normalizeCategoryName,
  normalizeColorName,
} from "@/features/clothes-registration/utils/clothesAnalysisParams";
import { invalidateRegistrationQueries } from "@/features/onboarding/utils/invalidateRegistrationQueries";
import {
  clothesLimitMessage,
  getClosetClothesCount,
  hasReachedClothesLimit,
} from "@/features/clothes-registration/utils/clothesLimit";
import { colors } from "@/constants/colors";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";
import { useQuestRegistrationStore } from "@/stores/useQuestRegistrationStore";

function formatDateForRequest(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function TextInfoField({
  label,
  value,
  placeholder,
  onChange,
  inputProps,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  inputProps?: TextInputProps & { ref?: (input: TextInput | null) => void };
}) {
  return (
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">{label}</Text>
      <TextInput
        className="mt-[14px] h-[50px] rounded-lg border-[0.5px] border-disabled bg-white px-[20px] font-pretendard text-[14px] leading-[17px] text-text"
        maxLength={100}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.disabled}
        returnKeyType="next"
        style={{ includeFontPadding: false, paddingBottom: 2, paddingTop: 0 }}
        value={value}
        {...inputProps}
      />
    </View>
  );
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
  const ColorIcon = getColorChipIcon(color, true);
  const CategoryIcon = getCategoryChipIcon(category, true);

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
          <Text className="font-pretendard text-[14px] leading-[20px] text-bg-dark">
            AI 분석 결과
          </Text>
          <View className="mt-[8px] flex-row gap-[6px]">
            <ColorIcon />
            <CategoryIcon />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function ClothesAdditionalInfoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const completeActiveQuestRegistration = useQuestRegistrationStore(
    (state) => state.completeActiveRegistration,
  );
  const activeClosetId = useClosetStore((state) => state.closetId);
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
  const { data: closets = [], isLoading: isClosetsLoading, error: closetsError } = useClosetList();
  const isManualEntry = getParamString(entryModeParam) === "manual";
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date());
  const [price, setPrice] = useState("");
  const [selectedClosetId, setSelectedClosetId] = useState<number | null>(activeClosetId);
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isServerLimitExceeded, setIsServerLimitExceeded] = useState(false);
  const keyboardAccessory = useKeyboardAccessoryNavigation(3);
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
  const selectedClosetClothesCount = selectedCloset
    ? getClosetClothesCount(selectedCloset.sections)
    : 0;
  const isClothesLimitReached =
    hasReachedClothesLimit(selectedClosetClothesCount) || isServerLimitExceeded;

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
    if (isSaving || isClothesLimitReached) {
      return;
    }

    const priceValue = Number(price);
    const trimmedProductName = productName.trim();
    const trimmedBrandName = brandName.trim();

    if ((!Number.isFinite(photoId) || photoId <= 0 || !imageUrl) && !imageUri) {
      showToast("사진 업로드 정보를 확인할 수 없어요. 다시 시도해주세요.");
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      showToast("가격을 입력해주세요.");
      return;
    }

    if (!selectedCloset) {
      showToast(closetsError ? "보관 옷장을 불러오지 못했어요." : "보관 옷장을 선택해주세요.");
      return;
    }

    if (!selectedSectionOption) {
      showToast(
        closetsError ? "옷장 보관 칸 정보를 불러오지 못했어요." : "보관 칸을 선택해주세요.",
      );
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
        productName: trimmedProductName,
        brandName: trimmedBrandName,
        color: toClothesColorValue(selectedColor),
        category: toClothesCategoryValue(selectedCategory),
        purchaseDate: formatDateForRequest(purchaseDate),
        price: priceValue,
        closetId: selectedCloset.closetId,
        sectionId: selectedSectionOption.requestSectionId,
      });

      await invalidateRegistrationQueries(queryClient);
      const questReturnRoute = completeActiveQuestRegistration(uploadedPhoto.imageUrl ?? imageUri);

      if (questReturnRoute) {
        router.replace(questReturnRoute);
        return;
      }

      router.replace("/clothes/register/complete");
    } catch (error) {
      if (error instanceof ApiError && error.code === "CLOTHES_4003") {
        setIsServerLimitExceeded(true);
        return;
      }

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
        className="flex-1 bg-bg-light"
        style={{
          paddingTop: insets.top + 24,
        }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          contentContainerClassName="px-6"
          showsVerticalScrollIndicator={false}
        >
          <ClothesRegistrationHeader />

          <Text
            className={[
              "font-pretendard-semibold text-[20px] leading-[24px] text-text",
              isManualEntry ? "mt-[24px]" : "mt-[34px]",
            ].join(" ")}
          >
            추가정보를 입력해주세요.
          </Text>

          <AnalysisResultHeader
            category={selectedCategory}
            color={selectedColor}
            imageSource={imageUrl || imageUri}
            showAnalysis={!isManualEntry}
          />

          <View className="mt-[34px]">
            <TextInfoField
              inputProps={keyboardAccessory.getInputAccessoryProps(0)}
              label="옷 이름"
              onChange={setProductName}
              placeholder="옷 이름을 입력해주세요."
              value={productName}
            />
          </View>

          <View className="mt-[24px]">
            <TextInfoField
              inputProps={keyboardAccessory.getInputAccessoryProps(1)}
              label="브랜드명"
              onChange={setBrandName}
              placeholder="브랜드명을 입력해주세요."
              value={brandName}
            />
          </View>

          <View className="mt-[24px]">
            <PurchaseDateField onChange={setPurchaseDate} value={purchaseDate} />
          </View>

          <View className="mt-[24px]">
            <PriceField
              inputProps={keyboardAccessory.getInputAccessoryProps(2)}
              onChange={setPrice}
              value={price}
            />
          </View>

          <View className="mt-[24px]">
            <ClosetSelect
              options={closetOptions}
              selectedOption={selectedClosetOption}
              onSelect={(option) => {
                setSelectedClosetId(option.closetId);
                setSelectedClosetSectionId(null);
                setIsServerLimitExceeded(false);
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

          <View className="mt-[24px]">
            <ClosetSectionSelect
              key={selectedCloset?.closetId ?? "no-closet"}
              hasError={isClothesLimitReached || Boolean(closetsError)}
              options={closetSectionOptions}
              selectedOption={selectedSectionOption}
              onSelect={(option) => setSelectedClosetSectionId(option.requestSectionId)}
            />
            {isClothesLimitReached ? (
              <Text className="mt-[8px] font-pretendard text-[11px] leading-[16px] text-error">
                {clothesLimitMessage}
              </Text>
            ) : null}
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

        <View className="px-6" style={{ paddingBottom: insets.bottom + 20 }}>
          <Button
            label={isSaving ? "저장 중..." : "저장하기"}
            disabled={isSaving || isClothesLimitReached}
            fullWidth
            className="h-[58px]"
            onPress={handleSave}
            textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
          />
        </View>
      </View>
      {keyboardAccessory.toolbar}
    </KeyboardAvoidingView>
  );
}
