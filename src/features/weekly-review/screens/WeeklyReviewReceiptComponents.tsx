import { Image, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Extrapolation, interpolate } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

import type { WeeklyReceiptReportItem } from "@/features/weekly-review/types/weekly-review";
import type { WeeklyReceiptTheme } from "@/features/weekly-review/utils/weekly-review-receipt";

const RECEIPT_CARD_WIDTH = 215;
const RECEIPT_CARD_HEIGHT = 296;
const RECEIPT_CARD_SLOT_WIDTH = 234;
const BARCODE_HEIGHT = 50;
const BARCODE_WIDTHS = [3, 6, 12, 6, 12, 6, 21, 6, 3];

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
        borderColor: color,
        borderStyle: "dotted",
        borderTopWidth: 2,
        height: 1,
      }}
    />
  );
}

type ReceiptCarouselProps = {
  items: WeeklyReceiptReportItem[];
  screenWidth: number;
  theme: WeeklyReceiptTheme;
};

export function WeeklyReceiptCarousel({ items, screenWidth, theme }: ReceiptCarouselProps) {
  return (
    <Carousel
      autoFillData={false}
      customAnimation={(value) => {
        "worklet";

        const distance = Math.abs(value);
        const scale = interpolate(distance, [0, 1], [1, 0.86], Extrapolation.CLAMP);
        const opacity = interpolate(distance, [0, 1], [1, 0.62], Extrapolation.CLAMP);
        const translateX = interpolate(
          value,
          [-1, 0, 1],
          [-RECEIPT_CARD_SLOT_WIDTH * 0.54, 0, RECEIPT_CARD_SLOT_WIDTH * 0.54],
          Extrapolation.CLAMP,
        );
        const rotateY = interpolate(value, [-1, 0, 1], [16, 0, -16], Extrapolation.CLAMP);

        return {
          opacity,
          transform: [
            { perspective: 900 },
            { translateX },
            { rotateY: `${rotateY}deg` },
            { scale },
          ],
        };
      }}
      data={items}
      height={RECEIPT_CARD_HEIGHT}
      loop={items.length > 1}
      renderItem={({ item }) => (
        <View
          className="overflow-hidden rounded-xl bg-white"
          style={{
            borderColor: theme.accent,
            borderWidth: 1,
            height: RECEIPT_CARD_HEIGHT,
            width: RECEIPT_CARD_WIDTH,
          }}
        >
          <Image
            resizeMode="cover"
            source={{ uri: item.imageUrl }}
            style={{
              height: RECEIPT_CARD_HEIGHT,
              width: RECEIPT_CARD_WIDTH,
            }}
          />
        </View>
      )}
      scrollAnimationDuration={520}
      style={{
        alignItems: "center",
        height: RECEIPT_CARD_HEIGHT,
        justifyContent: "center",
        overflow: "visible",
        width: screenWidth,
      }}
      width={RECEIPT_CARD_SLOT_WIDTH}
      windowSize={5}
    />
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
