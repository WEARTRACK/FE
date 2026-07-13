import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import type { ToastTone } from "@/lib/ui/showToast";

type ToastProps = {
  visible: boolean;
  message: string;
  tone?: ToastTone;
  bottomInset?: number;
};

const ANIMATION_DURATION = 160;

export function Toast({ visible, message, tone = "default", bottomInset = 24 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 12,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute left-0 right-0 items-center"
      style={{
        bottom: bottomInset,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        className="w-full max-w-[345px] overflow-hidden rounded-[16px] px-[16px] py-[12px]"
        style={{
          backgroundColor: colors.bg.dark,
          elevation: 6,
          shadowColor: colors.bg.dark,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.24,
          shadowRadius: 10,
        }}
      >
        <Text
          className="font-pretendard text-subhead text-white"
          numberOfLines={tone === "error" ? 4 : 3}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
