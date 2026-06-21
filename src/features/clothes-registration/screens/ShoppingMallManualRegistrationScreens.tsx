import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import CalendarIcon from "../../../../assets/calendar.svg";
import ClotheExample from "../../../../assets/clotheExample.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { useClothesStorageSections } from "@/features/clothes-registration/hooks/use-clothes-storage-sections";
import { clothingColors } from "@/features/clothes-registration/screens/ClothesStyleData";
import {
  getCategoryChipIcon,
  getColorChipIcon,
} from "@/features/clothes-registration/screens/clothes-style-chip-icons";
import type { ClosetSectionOption } from "@/features/closet/utils/closet-section-options";
import { showToast } from "@/lib/ui/showToast";

const categoryGroups = [
  { title: "Tops", categories: ["T-shirt", "Shirt", "Blouse", "Knit", "Hoodie", "Vest"] },
  { title: "Outwears", categories: ["Cardigan", "Jacket", "Coat", "Padding"] },
  { title: "Bottoms", categories: ["Skirt", "Pants", "Shorts"] },
  { title: "Dresses", categories: ["Dress"] },
];

const colorOrder = [
  "Red",
  "Pink",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Navy",
  "Purple",
  "White",
  "Beige",
  "Brown",
  "Gray",
  "Black",
];

const orderedColors = colorOrder
  .map((name) => clothingColors.find((color) => color.name === name))
  .filter((color): color is (typeof clothingColors)[number] => Boolean(color));

function formatPrice(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPurchaseDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

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
    <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-text-subdued bg-white">
      <ClotheExample height={100} preserveAspectRatio="xMidYMid slice" width={100} />
    </View>
  );
}

function BottomScrollDim({ bottomOffset }: { bottomOffset: number }) {
  return (
    <View
      className="absolute left-0 right-0 h-[84px]"
      pointerEvents="none"
      style={{ bottom: bottomOffset }}
    >
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="manual-style-bottom-dim" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#D9D9D9" stopOpacity="0" />
            <Stop offset="1" stopColor="#D9D9D9" stopOpacity="0.72" />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#manual-style-bottom-dim)" height="100%" width="100%" x="0" y="0" />
      </Svg>
    </View>
  );
}

function ColorChip({
  name,
  selected,
  onPress,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = getColorChipIcon(name, selected);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
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
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
        옷장 보관 칸
      </Text>
      <View className="mt-[14px] overflow-hidden rounded-lg border-[0.5px] border-disabled bg-white">
        <Pressable
          className="h-[50px] flex-row items-center justify-between px-[20px]"
          onPress={() => setOpen((current) => !current)}
        >
          <Text className="font-pretendard text-[14px] leading-[20px] text-text">
            {selectedOption?.label ?? "보관 칸을 불러오는 중"}
          </Text>
          <Text className="font-pretendard text-[20px] leading-[20px] text-disabled">⌄</Text>
        </Pressable>

        {open && options.length > 0 ? (
          <ScrollView className="max-h-[180px]" contentContainerClassName="px-[20px] pb-[8px]">
            {options.map((option) => (
              <Pressable
                key={option.templateSectionId}
                className="h-[40px] justify-center border-t-[0.5px] border-disabled"
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                <Text className="font-pretendard text-[13px] leading-[20px] text-text-subdued">
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

export function ShoppingMallManualStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedCategory, setSelectedCategory] = useState("T-shirt");

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
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

        <Text className="mt-[39px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          색상
        </Text>
        <View className="mt-[24px] flex-row flex-wrap gap-[8px]">
          {orderedColors.map((color) => (
            <ColorChip
              key={color.name}
              name={color.name}
              onPress={() => setSelectedColor(color.name)}
              selected={selectedColor === color.name}
            />
          ))}
        </View>

        <Text className="mt-[27px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          카테고리
        </Text>
        <View className="mt-[24px]">
          {categoryGroups.map((group) => (
            <View key={group.title} className="mb-[18px]">
              <Text className="font-pretendard text-[15px] leading-[20px] text-text">
                {group.title}
              </Text>
              <View className="mt-[10px] flex-row flex-wrap gap-[8px]">
                {group.categories.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    onPress={() => setSelectedCategory(category)}
                    selected={selectedCategory === category}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomScrollDim bottomOffset={insets.bottom + 78} />
      <View className="px-6">
        <Button
          label="저장하기"
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
          onPress={() =>
            router.push({
              pathname: "/clothes/register/shopping-mall/manual-details",
              params: { selectedColor, selectedCategory },
            })
          }
        />
      </View>
    </View>
  );
}

export function ShoppingMallManualDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedColor: selectedColorParam, selectedCategory: selectedCategoryParam } =
    useLocalSearchParams<{
      selectedColor?: string;
      selectedCategory?: string;
    }>();
  const {
    options: closetSectionOptions,
    isLoading: isClosetSectionsLoading,
    error: closetSectionsError,
  } = useClothesStorageSections();
  const [purchaseDate, setPurchaseDate] = useState(() => new Date());
  const [pickerDate, setPickerDate] = useState(() => new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [selectedClosetSectionId, setSelectedClosetSectionId] = useState<number | null>(null);
  const selectedColor = typeof selectedColorParam === "string" ? selectedColorParam : "Black";
  const selectedCategory =
    typeof selectedCategoryParam === "string" ? selectedCategoryParam : "T-shirt";
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
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            구매 날짜
          </Text>
          <Pressable
            className="mt-[14px] h-[40px] w-[139px] flex-row items-center rounded-lg border-[0.5px] border-disabled bg-white px-[17px]"
            onPress={() => {
              setPickerDate(purchaseDate);
              setIsDatePickerVisible(true);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
          >
            <CalendarIcon height={22} width={22} />
            <Text className="ml-[10px] flex-1 font-pretendard text-[14px] leading-[17px] text-text">
              {formatPurchaseDate(purchaseDate)}
            </Text>
          </Pressable>
          {Platform.OS === "android" && isDatePickerVisible ? (
            <DateTimePicker
              display="default"
              mode="date"
              onChange={(_, selectedDate) => {
                setIsDatePickerVisible(false);

                if (selectedDate) {
                  setPurchaseDate(selectedDate);
                }
              }}
              value={purchaseDate}
            />
          ) : null}
          {Platform.OS === "ios" ? (
            <Modal
              animationType="fade"
              onRequestClose={() => setIsDatePickerVisible(false)}
              transparent
              visible={isDatePickerVisible}
            >
              <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <Pressable
                  className="absolute inset-0"
                  onPress={() => setIsDatePickerVisible(false)}
                />
                <View className="w-[340px] rounded-xl bg-white pb-4 pt-5">
                  <Text className="px-4 font-pretendard-semibold text-[18px] leading-[24px] text-text">
                    구매 날짜를 선택해주세요.
                  </Text>
                  <DateTimePicker
                    display="inline"
                    mode="date"
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        setPickerDate(selectedDate);
                      }
                    }}
                    style={{ alignSelf: "center", width: 340 }}
                    value={pickerDate}
                  />
                  <View className="px-4">
                    <Pressable
                      className="mt-2 h-[48px] items-center justify-center rounded-lg bg-bg-dark"
                      onPress={() => {
                        setPurchaseDate(pickerDate);
                        setIsDatePickerVisible(false);
                      }}
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                      <Text className="font-pretendard-semibold text-[16px] leading-[20px] text-white">
                        완료
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          ) : null}
        </View>

        <View className="mt-[34px]">
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            가격
          </Text>
          <View className="mt-[14px] flex-row items-center">
            <TextInput
              className="h-[50px] w-[250px] rounded-lg border-[0.5px] border-disabled bg-white px-[20px] font-pretendard text-[14px] leading-[17px] text-text"
              keyboardType="number-pad"
              onChangeText={(nextValue) => setPrice(nextValue.replace(/[^0-9]/g, ""))}
              placeholder="숫자만 입력 가능"
              placeholderTextColor={colors.disabled}
              style={{ includeFontPadding: false, paddingBottom: 2, paddingTop: 0 }}
              value={formatPrice(price)}
            />
            <Text className="ml-[10px] font-pretendard text-[14px] leading-[20px] text-bg-dark">
              원
            </Text>
          </View>
        </View>

        <View className="mt-[24px]">
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
              옷장 보관 칸 정보를 불러오지 못했어요.
            </Text>
          ) : null}
        </View>

        <View className="mt-auto">
          <Button
            label="다음"
            disabled={!canGoNext}
            fullWidth
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
            onPress={() => showToast(`${selectedColor} ${selectedCategory} 정보를 확인했어요.`)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
