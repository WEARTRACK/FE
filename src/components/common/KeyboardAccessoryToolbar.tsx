import React, { useMemo, useRef, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type TextInputRef = TextInput | null;

type KeyboardAccessoryNavigation = {
  accessoryViewID?: string;
  focusedIndex: number;
  getInputAccessoryProps: (index: number) => {
    ref: (input: TextInputRef) => void;
    inputAccessoryViewID?: string;
    onFocus: () => void;
  };
  toolbar: React.ReactNode;
};

type KeyboardAccessoryToolbarProps = {
  nativeID: string;
  focusedIndex: number;
  inputCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onDone: () => void;
};

function ChevronIcon({ direction, disabled }: { direction: "up" | "down"; disabled: boolean }) {
  const path = direction === "up" ? "M5 14L12 7L19 14" : "M5 10L12 17L19 10";

  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d={path}
        stroke={disabled ? "#B8C0CC" : "#007AFF"}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function KeyboardAccessoryToolbar({
  nativeID,
  focusedIndex,
  inputCount,
  onPrevious,
  onNext,
  onDone,
}: KeyboardAccessoryToolbarProps) {
  if (Platform.OS !== "ios") {
    return null;
  }

  const hasPrevious = focusedIndex > 0;
  const hasNext = focusedIndex >= 0 && focusedIndex < inputCount - 1;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View className="h-[44px] flex-row items-center justify-between border-t-[0.5px] border-[#C7C7CC] bg-[#F7F7F7] px-[14px]">
        <View className="h-[44px] flex-row items-center">
          <Pressable
            accessibilityLabel="이전 입력창"
            accessibilityRole="button"
            className="h-[44px] w-[44px] items-center justify-center"
            disabled={!hasPrevious}
            hitSlop={8}
            onPress={onPrevious}
            style={({ pressed }) => ({ opacity: pressed && hasPrevious ? 0.55 : 1 })}
          >
            <ChevronIcon direction="up" disabled={!hasPrevious} />
          </Pressable>
          <Pressable
            accessibilityLabel="다음 입력창"
            accessibilityRole="button"
            className="h-[44px] w-[44px] items-center justify-center"
            disabled={!hasNext}
            hitSlop={8}
            onPress={onNext}
            style={({ pressed }) => ({ opacity: pressed && hasNext ? 0.55 : 1 })}
          >
            <ChevronIcon direction="down" disabled={!hasNext} />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="키보드 닫기"
          accessibilityRole="button"
          className="h-[44px] justify-center px-[10px]"
          hitSlop={8}
          onPress={onDone}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
        >
          <Text className="font-pretendard-semibold text-[17px] leading-[22px] text-[#007AFF]">
            완료
          </Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

export function useKeyboardAccessoryNavigation(inputCount: number): KeyboardAccessoryNavigation {
  const accessoryViewID = useMemo(
    () => `keyboard-accessory-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const refs = useRef<TextInputRef[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const focusInput = (index: number) => {
    refs.current[index]?.focus();
  };

  const getInputAccessoryProps = (index: number) => ({
    ref: (input: TextInputRef) => {
      refs.current[index] = input;
    },
    inputAccessoryViewID: Platform.OS === "ios" ? accessoryViewID : undefined,
    onFocus: () => setFocusedIndex(index),
  });

  return {
    accessoryViewID: Platform.OS === "ios" ? accessoryViewID : undefined,
    focusedIndex,
    getInputAccessoryProps,
    toolbar:
      Platform.OS === "ios" ? (
        <KeyboardAccessoryToolbar
          nativeID={accessoryViewID}
          focusedIndex={focusedIndex}
          inputCount={inputCount}
          onPrevious={() => focusInput(focusedIndex - 1)}
          onNext={() => focusInput(focusedIndex + 1)}
          onDone={Keyboard.dismiss}
        />
      ) : null,
  };
}
