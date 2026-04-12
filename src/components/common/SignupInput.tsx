import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { colors } from "@/constants/colors";

interface SignupInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  maxLength?: number;
}

const SignupInput = ({ label, error, isSuccess, maxLength, value, ...props }: SignupInputProps) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-DEFAULT font-pretendard-semibold mb-2 text-[16px] tracking-[0px]">
          {label}
        </Text>
      )}

      <View className="relative">
        <TextInput
          className={`bg-cool h-[58px] rounded-[4px] border px-[28px] py-[19px] ${
            error
              ? "border-error border-[1px]"
              : isSuccess
                ? "border-text-subdued border-[1px]"
                : "border-transparent"
          } text-text-DEFAULT font-pretendard-light text-[15px] tracking-[-0.5px]`}
          placeholderTextColor={colors.text.subdued}
          maxLength={maxLength}
          value={value}
          {...props}
        />
      </View>

      <View className="mt-2 h-[28px] flex-row items-start justify-between">
        <Text
          className={`text-caption font-pretendard flex-1 ${error ? "text-error" : "text-transparent"}`}
        >
          {error || "spacer"}
        </Text>

        {maxLength && (
          <Text className="text-caption text-text-subdued font-pretendard w-[40px] text-right">
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

export default SignupInput;
