import { useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { AppState, Image, Platform, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

import { env } from "@/config/env";
import type { WeeklyReceiptReportItem } from "@/features/weekly-review/types/weekly-review";
import type { WeeklyReceiptTheme } from "@/features/weekly-review/utils/weekly-review-receipt";
import { createBearerAuthorizationHeader } from "@/lib/api/authToken";
import { useSessionStore } from "@/stores/useSessionStore";

const RECEIPT_CARD_WIDTH = 215;
const RECEIPT_CARD_HEIGHT = 296;
const RECEIPT_CARD_SLOT_WIDTH = 234;
const RECEIPT_CARD_SIDE_SCALE = 0.82;
const RECEIPT_CARD_SIDE_TRANSLATE_Y = 18;
const RECEIPT_MARQUEE_SPEED_PX_PER_SECOND = 40;
const BARCODE_HEIGHT = 50;
const BARCODE_WIDTHS = [3, 6, 12, 6, 12, 6, 21, 6, 3];
const DIVIDER_DOT_COUNT = 180;
const DIVIDER_DOTS = Array.from({ length: DIVIDER_DOT_COUNT }, (_, index) => index);

type ReceiptGradientTextProps = {
  align?: "left" | "center" | "right";
  direction?: "horizontal" | "vertical";
  fontSize: number;
  gradientId: string;
  height: number;
  text: string;
  theme: WeeklyReceiptTheme;
  width: number;
};

function WeeklyReceiptGradientText({
  align = "left",
  direction = "vertical",
  fontSize,
  gradientId,
  height,
  text,
  theme,
  width,
}: ReceiptGradientTextProps) {
  const textAnchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const x = align === "center" ? width / 2 : align === "right" ? width : 0;

  return (
    <Svg height={height} width={width}>
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="0%"
          x2={direction === "horizontal" ? "100%" : "0%"}
          y1="0%"
          y2={direction === "horizontal" ? "0%" : "100%"}
        >
          <Stop offset="0%" stopColor={theme.soft} />
          <Stop
            offset="100%"
            stopColor={direction === "horizontal" ? theme.softer : theme.accent}
          />
        </LinearGradient>
      </Defs>
      <SvgText
        fill={`url(#${gradientId})`}
        fontFamily="PretendardSemiBold"
        fontSize={fontSize}
        letterSpacing={-0.5}
        textAnchor={textAnchor}
        x={x}
        y={height / 2 + fontSize / 3}
      >
        {text}
      </SvgText>
    </Svg>
  );
}

export function WeeklyReceiptProfileTitle({
  text,
  theme,
}: {
  text: string;
  theme: WeeklyReceiptTheme;
}) {
  return (
    <WeeklyReceiptGradientText
      fontSize={28}
      gradientId="receipt-profile-title-gradient"
      height={36}
      text={text}
      theme={theme}
      width={210}
    />
  );
}

export function WeeklyReceiptUsageRate({
  text,
  theme,
}: {
  text: string;
  theme: WeeklyReceiptTheme;
}) {
  return (
    <WeeklyReceiptGradientText
      align="right"
      fontSize={28}
      gradientId="receipt-usage-rate-gradient"
      height={36}
      text={text}
      theme={theme}
      width={96}
    />
  );
}

export function WeeklyReceiptWornTitle({ theme }: { theme: WeeklyReceiptTheme }) {
  return (
    <WeeklyReceiptGradientText
      align="center"
      direction="horizontal"
      fontSize={20}
      gradientId="receipt-worn-title-gradient"
      height={24}
      text="이번주 입은 옷"
      theme={theme}
      width={160}
    />
  );
}

type ReceiptDividerProps = {
  color: string;
  className?: string;
};

export function WeeklyReceiptDivider({ color, className }: ReceiptDividerProps) {
  return (
    <View
      className={className}
      style={{
        flexDirection: "row",
        height: 4,
        overflow: "hidden",
      }}
    >
      {DIVIDER_DOTS.map((index) => (
        <View
          key={index}
          style={{
            backgroundColor: color,
            borderRadius: 1,
            height: 2,
            marginRight: 3,
            width: 2,
          }}
        />
      ))}
    </View>
  );
}

type ReceiptCarouselProps = {
  items: WeeklyReceiptReportItem[];
  screenWidth: number;
  theme: WeeklyReceiptTheme;
};

type ReceiptCarouselCardProps = {
  accessToken: string | null;
  item: WeeklyReceiptReportItem;
  theme: WeeklyReceiptTheme;
};

function shouldUseApiAuthorizationHeader(imageUrl: string, accessToken: string | null) {
  if (!accessToken) {
    return false;
  }

  try {
    return new URL(imageUrl).origin === new URL(env.apiBaseUrl).origin;
  } catch {
    return false;
  }
}

function createReceiptImageUri(imageUrl: string) {
  return encodeURI(imageUrl);
}

function createReceiptImageSource(uri: string, accessToken: string | null) {
  if (Platform.OS === "web" || !accessToken || !shouldUseApiAuthorizationHeader(uri, accessToken)) {
    return { uri };
  }

  return {
    cache: "reload" as const,
    headers: {
      Authorization: createBearerAuthorizationHeader(accessToken),
    },
    uri,
  };
}

function WeeklyReceiptCarouselCard({ accessToken, item, theme }: ReceiptCarouselCardProps) {
  const imageUri = createReceiptImageUri(item.imageUrl);

  return (
    <View
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: theme.softer,
        borderColor: theme.accent,
        borderWidth: 1,
        height: RECEIPT_CARD_HEIGHT,
        width: RECEIPT_CARD_WIDTH,
      }}
    >
      {Platform.OS === "web" ? (
        <View
          style={[
            {
              height: RECEIPT_CARD_HEIGHT,
              width: RECEIPT_CARD_WIDTH,
            },
            {
              backgroundImage: `url("${imageUri}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            } as never,
          ]}
        />
      ) : (
        <Image
          onError={(event) => {
            console.warn("Failed to load weekly receipt image", {
              clothesId: item.clothesId,
              error: event.nativeEvent.error,
              imageUrl: item.imageUrl,
            });
          }}
          resizeMode="cover"
          source={createReceiptImageSource(imageUri, accessToken)}
          style={{
            height: RECEIPT_CARD_HEIGHT,
            width: RECEIPT_CARD_WIDTH,
          }}
        />
      )}
    </View>
  );
}

type WeeklyReceiptMarqueeCardProps = {
  accessToken: string | null;
  item: WeeklyReceiptReportItem;
  slotIndex: number;
  theme: WeeklyReceiptTheme;
  translateX: SharedValue<number>;
  viewportCenterX: number;
};

function WeeklyReceiptMarqueeCard({
  accessToken,
  item,
  slotIndex,
  theme,
  translateX,
  viewportCenterX,
}: WeeklyReceiptMarqueeCardProps) {
  const depthStyle = useAnimatedStyle(() => {
    const cardCenterX =
      translateX.value + slotIndex * RECEIPT_CARD_SLOT_WIDTH + RECEIPT_CARD_SLOT_WIDTH / 2;
    const distance = Math.abs(cardCenterX - viewportCenterX);
    const normalizedDistance = Math.min(distance / RECEIPT_CARD_SLOT_WIDTH, 1);
    const scale = interpolate(
      normalizedDistance,
      [0, 1],
      [1, RECEIPT_CARD_SIDE_SCALE],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      normalizedDistance,
      [0, 1],
      [0, RECEIPT_CARD_SIDE_TRANSLATE_Y],
      Extrapolation.CLAMP,
    );
    const zIndex = Math.round(
      interpolate(normalizedDistance, [0, 1], [20, 0], Extrapolation.CLAMP),
    );

    return {
      elevation: zIndex,
      transform: [{ translateY }, { scale }],
      zIndex,
    };
  });
  const dimOverlayStyle = useAnimatedStyle(() => {
    const cardCenterX =
      translateX.value + slotIndex * RECEIPT_CARD_SLOT_WIDTH + RECEIPT_CARD_SLOT_WIDTH / 2;
    const distance = Math.abs(cardCenterX - viewportCenterX);
    const normalizedDistance = Math.min(distance / RECEIPT_CARD_SLOT_WIDTH, 1);

    return {
      opacity: interpolate(normalizedDistance, [0, 1], [0, 0.5], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          alignItems: "center",
          height: RECEIPT_CARD_HEIGHT,
          width: RECEIPT_CARD_SLOT_WIDTH,
        },
        depthStyle,
      ]}
    >
      <WeeklyReceiptCarouselCard accessToken={accessToken} item={item} theme={theme} />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: "#000000",
            borderRadius: 12,
            height: RECEIPT_CARD_HEIGHT,
            position: "absolute",
            width: RECEIPT_CARD_WIDTH,
          },
          dimOverlayStyle,
        ]}
      />
    </Animated.View>
  );
}

export function WeeklyReceiptCarousel({ items, screenWidth, theme }: ReceiptCarouselProps) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const translateX = useSharedValue(0);
  const imageUris = useMemo(
    () => Array.from(new Set(items.map((item) => createReceiptImageUri(item.imageUrl)))),
    [items],
  );
  const repeatedItems = useMemo(() => [...items, ...items, ...items], [items]);
  const singleSetWidth = items.length * RECEIPT_CARD_SLOT_WIDTH;
  const viewportCenterX = screenWidth / 2;
  const initialTranslateX = -singleSetWidth + (screenWidth - RECEIPT_CARD_SLOT_WIDTH) / 2;
  const marqueeDuration = (singleSetWidth / RECEIPT_MARQUEE_SPEED_PX_PER_SECOND) * 1000;
  const startMarqueeAnimation = useCallback(() => {
    cancelAnimation(translateX);

    if (items.length <= 1) {
      translateX.value = (screenWidth - RECEIPT_CARD_SLOT_WIDTH) / 2;
      return;
    }

    translateX.value = initialTranslateX;
    translateX.value = withRepeat(
      withTiming(initialTranslateX - singleSetWidth, {
        duration: marqueeDuration,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.Never,
      }),
      -1,
      false,
      undefined,
      ReduceMotion.Never,
    );
  }, [initialTranslateX, items.length, marqueeDuration, screenWidth, singleSetWidth, translateX]);
  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    imageUris.forEach((imageUri) => {
      void Image.prefetch(imageUri).catch(() => undefined);
    });
  }, [imageUris]);

  useFocusEffect(
    useCallback(() => {
      startMarqueeAnimation();

      return () => {
        cancelAnimation(translateX);
      };
    }, [startMarqueeAnimation, translateX]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        startMarqueeAnimation();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startMarqueeAnimation]);

  return (
    <View
      style={{
        height: RECEIPT_CARD_HEIGHT,
        overflow: "hidden",
        width: screenWidth,
      }}
    >
      <Animated.View
        style={[
          {
            flexDirection: "row",
            height: RECEIPT_CARD_HEIGHT,
          },
          marqueeStyle,
        ]}
      >
        {repeatedItems.map((item, index) => (
          <WeeklyReceiptMarqueeCard
            key={`${item.clothesId}-${index}`}
            accessToken={accessToken}
            item={item}
            slotIndex={index}
            theme={theme}
            translateX={translateX}
            viewportCenterX={viewportCenterX}
          />
        ))}
      </Animated.View>
    </View>
  );
}

type ReceiptBarcodeProps = {
  color: string;
};

export function WeeklyReceiptBarcode({ color }: ReceiptBarcodeProps) {
  return (
    <View
      accessibilityLabel="영수증 바코드"
      accessibilityRole="image"
      className="flex-row items-center justify-center gap-[8px]"
      style={{ height: BARCODE_HEIGHT }}
    >
      {BARCODE_WIDTHS.map((width, index) => (
        <View
          key={`${width}-${index}`}
          style={{
            backgroundColor: color,
            height: BARCODE_HEIGHT,
            width,
          }}
        />
      ))}
    </View>
  );
}

type ReceiptTotalProps = {
  color: string;
  itemCount: number;
  priceLabel: string;
  softColor: string;
};

export function WeeklyReceiptTotal({ color, itemCount, priceLabel, softColor }: ReceiptTotalProps) {
  return (
    <View className="items-center">
      <Text
        className="font-pretendard text-white"
        style={{
          color: softColor,
          fontSize: 18,
          letterSpacing: -0.6,
          lineHeight: 24,
        }}
      >
        {itemCount}벌 TOTAL PRICE
      </Text>
      <Text className="mt-[6px] font-pretendard text-heading" style={{ color }}>
        {priceLabel}
      </Text>
    </View>
  );
}
