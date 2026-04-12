import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface BasicInputProps extends TextInputProps {
  label?: string;
  unit?: string; // '원' 같은 단위를 붙이기 위해 추가
  error?: string;
}

const BasicInput = ({ label, unit, error, ...props }: BasicInputProps) => {
  return (
    <View className="mb-4">
      {label && <Text className="text-main font-regular mb-2 text-[12px]">{label}</Text>}

      <View className="flex-row items-center">
        <TextInput
          className="border-gray-disabled h-[58px] flex-1 rounded-[8px] border bg-white px-[28px] py-[19px] text-base"
          placeholderTextColor="#D1D1D1" // disabled 색상 계열
          {...props}
        />
        {unit && <Text className="text-main ml-2">{unit}</Text>}
      </View>
      {error && <Text className="mt-2 text-[12px] text-red-500">{error}</Text>}
    </View>
  );
};

export default BasicInput;
