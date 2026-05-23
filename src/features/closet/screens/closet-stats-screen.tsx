import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Stop } from "react-native-svg";

import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { useClosetStatistics } from "@/features/closet/hooks/use-closet-data";
import { showToast } from "@/lib/ui/showToast";

const DONUT_SIZE = 220;
const DONUT_THICKNESS = 38;
const DONUT_GAP_SIZE = 2;
const HEADER_TOP_OFFSET = 15;
const HEADER_LINE_HEIGHT = 20;
const SUMMARY_TOP_GAP = 27;

const rankColorByRank: Record<number, string> = {
  1: colors.blue[4],
  2: colors.blue[3],
  3: colors.blue[2],
  4: colors.blue[1],
  5: colors.white,
};

export function ClosetStatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { statistics, isLoading, error, refetch } = useClosetStatistics();
  const lastToastMessageRef = useRef<string | null>(null);

  const summaryWidth = screenWidth - 48;
  const summaryHeight = summaryWidth / 3;
  const summarySubTextTop = summaryHeight * 0.22;
  const headerTop = insets.top + HEADER_TOP_OFFSET;
  const summaryTop = headerTop + HEADER_LINE_HEIGHT + SUMMARY_TOP_GAP;

  const chartData = statistics.rankedCategories.map((target, index) => ({
    value: target.count,
    fill: `url(#rank-gradient-${index + 1})`,
  }));
  const radius = DONUT_SIZE / 2 - DONUT_THICKNESS / 2;
  const circumference = 2 * Math.PI * radius;
  const totalValue = chartData.reduce((sum, target) => sum + target.value, 0);
  let accumulatedLength = 0;
  const isEmpty = statistics.totalCount === 0;

  useEffect(() => {
    if (!error) {
      lastToastMessageRef.current = null;
      return;
    }
    const message = "불러오기에 실패했어요.";
    if (lastToastMessageRef.current === message) {
      return;
    }
    lastToastMessageRef.current = message;
    showToast(message);
  }, [error]);

  const handlePressBack = () => {
    if (router.canDismiss()) {
      router.dismissTo("/closet");
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/closet");
  };

  return (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-20" style={{ top: insets.top + 14 }}>
        <BackButton accessibilityLabel="내 옷장으로 돌아가기" onPress={handlePressBack} />
      </View>

      <View pointerEvents="none" className="absolute left-0 right-0 z-10" style={{ top: headerTop }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">통계</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: summaryTop, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="relative rounded-xl bg-cool pl-[21px]" style={{ width: summaryWidth, height: summaryHeight }}>
          <View className="absolute left-[21px]" style={{ top: summarySubTextTop, gap: 17 }}>
            <Text className="font-pretendard text-subhead text-text-subdued">내 옷장에 지금..</Text>
            <Text className="font-pretendard-semibold text-headline text-text">
              총 {statistics.totalCount}벌이 있습니다.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View className="mt-8 items-center rounded-2xl bg-white p-6">
            <Text className="font-pretendard text-body text-text-subdued">통계를 불러오고 있습니다.</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View className="mt-8">
            <Button fullWidth label="다시 시도" onPress={refetch} size="lg" variant="secondary" />
          </View>
        ) : null}

        {!isLoading && !error && !isEmpty ? (
          <>
            <View
              className="mt-[34px] items-center"
              accessibilityLabel="카테고리 비율 도넛 차트"
              accessibilityRole="image"
            >
              <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
                <Defs>
                  <RadialGradient id="rank-gradient-1" cx="50%" cy="50%" r="60%">
                    <Stop offset="0%" stopColor={colors.blue[4]} />
                    <Stop offset="100%" stopColor={colors.blue[3]} />
                  </RadialGradient>
                  <RadialGradient id="rank-gradient-2" cx="50%" cy="50%" r="65%">
                    <Stop offset="38%" stopColor={colors.blue[3]} />
                    <Stop offset="100%" stopColor={colors.blue[1]} />
                  </RadialGradient>
                  <RadialGradient id="rank-gradient-3" cx="50%" cy="50%" r="60%">
                    <Stop offset="0%" stopColor={colors.blue[2]} />
                    <Stop offset="100%" stopColor={colors.blue[1]} />
                  </RadialGradient>
                  <RadialGradient id="rank-gradient-4" cx="50%" cy="50%" r="60%">
                    <Stop offset="0%" stopColor={colors.blue[1]} />
                    <Stop offset="43%" stopColor={colors.blue[1]} />
                  </RadialGradient>
                  <LinearGradient id="rank-gradient-5" x1="0%" x2="100%" y1="0%" y2="100%">
                    <Stop offset="0%" stopColor={colors.white} />
                    <Stop offset="100%" stopColor={colors.cool} />
                  </LinearGradient>
                </Defs>
                <G rotation={-90} originX={DONUT_SIZE / 2} originY={DONUT_SIZE / 2}>
                  {chartData.map((target, index) => {
                    const segmentLength = totalValue === 0 ? 0 : (target.value / totalValue) * circumference;
                    const usableLength = Math.max(segmentLength - DONUT_GAP_SIZE, 0);
                    const strokeDashoffset = -accumulatedLength;
                    accumulatedLength += segmentLength;

                    return (
                      <Circle
                        key={`${target.fill}-${index}`}
                        cx={DONUT_SIZE / 2}
                        cy={DONUT_SIZE / 2}
                        r={radius}
                        stroke={target.fill}
                        strokeDasharray={`${usableLength} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="butt"
                        strokeWidth={DONUT_THICKNESS}
                        fill="transparent"
                      />
                    );
                  })}
                </G>
              </Svg>
            </View>

            <View className="mt-[34px] rounded-2xl bg-white px-[15px] pb-4 pt-[14px]">
              <Text className="font-pretendard-light text-caption text-text-subdued">카테고리 별 통계</Text>
              <View className="mt-2 gap-[10px]">
                {statistics.rankedCategories.map((target) => (
                  <View
                    key={`${target.category}-${target.rank}`}
                    accessibilityLabel={`${target.label} ${target.count}벌`}
                    accessibilityRole="text"
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor: rankColorByRank[target.rank] ?? colors.white,
                          borderWidth: target.category === "others" ? 0.5 : 0,
                          borderColor: target.category === "others" ? colors.cool : "transparent",
                        }}
                      />
                      <Text className="ml-[13px] font-pretendard text-body text-text">{target.label}</Text>
                    </View>
                    <Text className="font-pretendard text-body text-text">{target.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {!isLoading && !error && isEmpty ? (
          <View className="mt-8 items-center rounded-2xl bg-white p-6">
            <Text className="font-pretendard text-body text-text-subdued">등록된 옷이 없습니다.</Text>
            <View className="mt-4 w-full">
              <Button
                fullWidth
                label="옷 등록하러 가기"
                onPress={() => router.replace("/home")}
                size="lg"
                variant="secondary"
              />
            </View>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}
