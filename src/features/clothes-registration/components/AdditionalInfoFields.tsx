import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import CalendarIcon from "../../../../assets/calendar.svg";
import { colors } from "@/constants/colors";
import type { ClosetSectionOption } from "@/features/closet/utils/closet-section-options";

export type ClosetSelectOption = {
  closetId: number;
  label: string;
};

function formatPrice(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPurchaseDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function PurchaseDateField({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [pickerDate, setPickerDate] = useState(value);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const openPicker = () => {
    setPickerDate(value);
    setIsPickerVisible(true);
  };

  return (
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
        구매 날짜
      </Text>
      <Pressable
        className="mt-[14px] h-[40px] w-[139px] flex-row items-center rounded-lg border-[0.5px] border-disabled bg-white px-[17px]"
        onPress={openPicker}
        style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      >
        <CalendarIcon height={22} width={22} />
        <Text className="ml-[10px] flex-1 font-pretendard text-[14px] leading-[17px] text-text">
          {formatPurchaseDate(value)}
        </Text>
      </Pressable>

      {Platform.OS === "android" && isPickerVisible ? (
        <DateTimePicker
          display="default"
          mode="date"
          onChange={(_, selectedDate) => {
            setIsPickerVisible(false);

            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
          value={value}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setIsPickerVisible(false)}
          transparent
          visible={isPickerVisible}
        >
          <View className="flex-1 items-center justify-center bg-black/40 px-6">
            <Pressable className="absolute inset-0" onPress={() => setIsPickerVisible(false)} />
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
                    onChange(pickerDate);
                    setIsPickerVisible(false);
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
  );
}

export function PriceField({
  value,
  onChange,
  inputProps,
}: {
  value: string;
  onChange: (value: string) => void;
  inputProps?: TextInputProps & { ref?: (input: TextInput | null) => void };
}) {
  return (
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">가격</Text>
      <View className="mt-[14px] flex-row items-center">
        <TextInput
          className="h-[50px] w-[250px] rounded-lg border-[0.5px] border-disabled bg-white px-[20px] font-pretendard text-[14px] leading-[17px] text-text"
          keyboardType="number-pad"
          onChangeText={(nextValue) => onChange(nextValue.replace(/[^0-9]/g, ""))}
          placeholder="숫자만 입력 가능"
          placeholderTextColor={colors.disabled}
          style={{ includeFontPadding: false, paddingBottom: 2, paddingTop: 0 }}
          value={formatPrice(value)}
          {...inputProps}
        />
        <Text className="ml-[10px] font-pretendard text-[14px] leading-[20px] text-bg-dark">
          원
        </Text>
      </View>
    </View>
  );
}

export function ClosetSectionSelect({
  options,
  selectedOption,
  onSelect,
  hasError = false,
}: {
  options: ClosetSectionOption[];
  selectedOption: ClosetSectionOption | null;
  onSelect: (option: ClosetSectionOption) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
        옷장 보관 칸
      </Text>
      <View
        className={[
          "mt-[14px] overflow-hidden rounded-lg bg-white",
          hasError ? "border border-error" : "border-[0.5px] border-disabled",
        ].join(" ")}
      >
        <Pressable
          className="h-[50px] flex-row items-center justify-between px-[20px]"
          disabled={options.length === 0}
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

export function ClosetSelect({
  options,
  selectedOption,
  onSelect,
  placeholder = "보관 옷장을 불러오는 중",
  hasError = false,
}: {
  options: ClosetSelectOption[];
  selectedOption: ClosetSelectOption | null;
  onSelect: (option: ClosetSelectOption) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
        보관 옷장
      </Text>
      <View
        className={[
          "mt-[14px] overflow-hidden rounded-lg bg-white",
          hasError ? "border border-error" : "border-[0.5px] border-disabled",
        ].join(" ")}
      >
        <Pressable
          className="h-[50px] flex-row items-center justify-between px-[20px]"
          disabled={options.length === 0}
          onPress={() => setOpen((current) => !current)}
        >
          <Text className="font-pretendard text-[14px] leading-[20px] text-text">
            {selectedOption?.label ?? placeholder}
          </Text>
          <Text className="font-pretendard text-[20px] leading-[20px] text-disabled">⌄</Text>
        </Pressable>

        {open && options.length > 0 ? (
          <ScrollView className="max-h-[180px]" contentContainerClassName="px-[20px] pb-[8px]">
            {options.map((option) => (
              <Pressable
                key={option.closetId}
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
