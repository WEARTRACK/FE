import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { colors } from "@/constants/colors";

interface BasicInputProps extends TextInputProps {
  label?: string;
  unit?: string;
  isPrice?: boolean;
}

const BasicInput = ({ label, unit, isPrice, value, ...props }: BasicInputProps) => {
  const hasValue = value && value.length > 0;

  return (
    <View className="mb-4">
      {label && <Text className="text-text-DEFAULT mb-2 font-pretendard text-body">{label}</Text>}

      <View className="flex-row items-center">
        <TextInput
          className={`h-[50px] flex-1 rounded-[8px] px-[20px] font-pretendard text-body ${
            isPrice
              ? `border-[0.5px] border-disabled bg-white`
              : hasValue
                ? `border-[0.5px] border-solid border-disabled bg-cool text-bg-dark`
                : `border-[0.5px] border-dashed border-disabled bg-white`
          }`}
          placeholderTextColor={colors.disabled}
          value={value}
          textAlignVertical="center"
          style={{ paddingVertical: 0 }}
          {...props}
        />
        {unit && <Text className="text-text-DEFAULT ml-2 font-pretendard">{unit}</Text>}
      </View>
    </View>
  );
};

export default BasicInput;
