import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { colors } from "@/constants/colors";

interface SignupInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  successMessage?: string;
  maxLength?: number;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  messageTextClassName?: string;
  counterClassName?: string;
  successMessageClassName?: string;
}

const SignupInput = ({
  label,
  error,
  isSuccess,
  successMessage,
  maxLength,
  value,
  containerClassName,
  labelClassName,
  inputClassName,
  messageTextClassName,
  counterClassName,
  successMessageClassName,
  ...props
}: SignupInputProps) => {
  const message = error || (isSuccess ? successMessage : undefined);
  const stateMessageClassName = error
    ? "text-error"
    : isSuccess
      ? successMessageClassName || "text-accent"
      : "text-transparent";
  const inputStateClassName = error
    ? "bg-cool border-error border-[1px]"
    : isSuccess
      ? "bg-cool border-text-subdued border-[1px]"
      : "bg-cool border-transparent";

  return (
    <View className={["mb-4", containerClassName].filter(Boolean).join(" ")}>
      {label && (
        <Text
          className={[
            "text-text-DEFAULT font-pretendard-semibold mb-2 text-[16px] tracking-[0px]",
            labelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </Text>
      )}

      <View className="relative">
        <TextInput
          className={[
            "h-[58px] rounded-[4px] border px-[16px] py-[19px]",
            inputStateClassName,
            "text-text-DEFAULT font-pretendard-light text-[15px] tracking-[-0.5px]",
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          placeholderTextColor={colors.text.subdued}
          maxLength={maxLength}
          value={value}
          {...props}
        />
      </View>

      <View className="mt-2 h-[28px] flex-row items-start justify-between">
        <Text
          className={[
            "text-caption font-pretendard flex-1",
            stateMessageClassName,
            messageTextClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {message || "\u00A0"}
        </Text>

        {maxLength && (
          <Text
            className={["text-caption text-text-subdued font-pretendard w-[40px] text-right", counterClassName]
              .filter(Boolean)
              .join(" ")}
          >
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

export default SignupInput;
