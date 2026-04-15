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
      {label && <Text className="text-text-DEFAULT font-pretendard text-body mb-2">{label}</Text>}

      <View className="flex-row items-center">
        <TextInput
          className={`text-body font-pretendard h-[50px] flex-1 rounded-[8px] px-[20px] ${
            isPrice
              ? `border-disabled border-[0.5px] bg-white`
              : hasValue
                ? `border-disabled bg-cool text-bg-dark border-[0.5px] border-solid`
                : `border-disabled border-[0.5px] border-dashed bg-white`
          }`}
          placeholderTextColor={colors.disabled}
          value={value}
          textAlignVertical="center"
          style={{ paddingVertical: 0 }}
          {...props}
        />
        {unit && <Text className="text-text-DEFAULT font-pretendard ml-2">{unit}</Text>}
      </View>
    </View>
  );
};

export default BasicInput;
