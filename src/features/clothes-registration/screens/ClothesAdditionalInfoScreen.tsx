import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLogo from "../../../../assets/headerLogo.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

const closetOptions = ["왼쪽 서랍 1칸", "오른쪽 서랍 1칸", "왼쪽 행거", "오른쪽 행거"];

function formatPrice(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function AnalysisResultHeader() {
  return (
    <View className="mt-[24px] flex-row items-start">
      <View className="h-[100px] w-[100px] items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white">
        <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-disabled">
          이미지
        </Text>
      </View>

      <View className="ml-[18px]">
        <Text className="font-pretendard text-[12px] leading-[20px] text-bg-dark">
          AI 분석 결과
        </Text>
        <View className="mt-[8px] flex-row gap-[6px]">
          <View className="h-[32px] min-w-[70px] items-center justify-center rounded-full bg-bg-dark px-[18px]">
            <Text className="font-pretendard text-[12px] leading-[16px] text-white">Black</Text>
          </View>
          <View className="h-[32px] min-w-[78px] items-center justify-center rounded-full bg-primary px-[18px]">
            <Text className="font-pretendard text-[12px] leading-[16px] text-accent">T-shirt</Text>
          </View>
        </View>
      </View>
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

function ClosetSelect() {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("왼쪽 서랍 1칸");

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
          onPress={() => setOpen((current) => !current)}
        >
          <Text className="font-pretendard text-[12px] leading-[20px] text-text">
            {selectedOption}
          </Text>
          <Text className="font-pretendard text-[18px] leading-[20px] text-disabled">⌄</Text>
        </Pressable>

        {open ? (
          <View className="px-[20px]">
            {closetOptions.map((option, index) => (
              <Pressable
                key={`${option}-${index}`}
                className="h-[41px] justify-center border-t-[0.5px] border-disabled"
                onPress={() => {
                  setSelectedOption(option);
                  setOpen(false);
                }}
              >
                <Text className="font-pretendard text-[12px] leading-[20px] text-disabled">
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ClothesAdditionalInfoScreen() {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = useState("");

  return (
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

      <AnalysisResultHeader />

      <View className="mt-[34px]">
        <LabeledInput
          label="가격"
          onChangeText={setPrice}
          placeholder="숫자만 입력 가능"
          unit="원"
          value={formatPrice(price)}
        />

        <ClosetSelect />
      </View>

      <View className="mt-auto">
        <Button
          label="저장하기"
          href={clothesRegistrationRoutes.clothesComplete}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
