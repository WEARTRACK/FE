import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { colors } from "@/constants/colors";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import type { ClosetUsageProfile } from "@/features/weekly-review/types/weekly-review";

const DONUT_SIZE = 220;
const DONUT_STROKE_WIDTH = 40;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE_WIDTH) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_TRACK_COLOR = colors.cool;

type UsageColor = {
  accent: string;
  gradientStart: string;
  gradientEnd: string;
};

const usageColorByToken: Record<ClosetUsageProfile["colorToken"], UsageColor> = {
  blue: {
    accent: colors.accent,
    gradientStart: colors.primary,
    gradientEnd: colors.accent,
  },
  green: {
    accent: colors.green[4],
    gradientStart: colors.green[3],
    gradientEnd: colors.green[4],
  },
  yellow: {
    accent: colors.yellow[4],
    gradientStart: colors.yellow[3],
    gradientEnd: colors.yellow[4],
  },
  red: {
    accent: colors.red[4],
    gradientStart: colors.red[3],
    gradientEnd: colors.red[4],
  },
};

type WeeklyReviewUsageDonutProps = {
  profile: ClosetUsageProfile;
  usageRate: number;
};

export function WeeklyReviewUsageDonut({ profile, usageRate }: WeeklyReviewUsageDonutProps) {
  const usageColor = usageColorByToken[profile.colorToken];
  const progressLength = DONUT_CIRCUMFERENCE * (usageRate / 100);
  const gapLength = DONUT_CIRCUMFERENCE - progressLength;

  return (
    <View
      accessibilityLabel={`전체 활용도 ${usageRate}%`}
      accessibilityRole="image"
      className="items-center"
    >
      <View className="h-[220px] w-[220px] items-center justify-center">
        <Svg height={DONUT_SIZE} width={DONUT_SIZE}>
          <Defs>
            <LinearGradient
              gradientUnits="userSpaceOnUse"
              id="weekly-usage-gradient"
              x1={DONUT_CENTER - DONUT_RADIUS}
              x2={DONUT_CENTER + DONUT_RADIUS}
              y1={DONUT_CENTER - DONUT_RADIUS}
              y2={DONUT_CENTER + DONUT_RADIUS}
            >
              <Stop offset="0%" stopColor={usageColor.gradientStart} />
              <Stop offset="100%" stopColor={usageColor.gradientEnd} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={DONUT_CENTER}
            cy={DONUT_CENTER}
            fill="transparent"
            r={DONUT_RADIUS}
            stroke={DONUT_TRACK_COLOR}
            strokeWidth={DONUT_STROKE_WIDTH}
          />
          <Circle
            cx={DONUT_CENTER}
            cy={DONUT_CENTER}
            fill="transparent"
            r={DONUT_RADIUS}
            stroke="url(#weekly-usage-gradient)"
            strokeDasharray={`${progressLength} ${gapLength}`}
            strokeLinecap="butt"
            strokeWidth={DONUT_STROKE_WIDTH}
            transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`}
          />
        </Svg>

        <View className="absolute inset-0 items-center justify-center">
          <Text
            className="font-pretendard-semibold"
            style={{
              color: usageColor.accent,
              fontSize: 24,
              letterSpacing: -0.5,
              lineHeight: 32,
            }}
          >
            {usageRate}%
          </Text>
          <Text className="mt-2 font-pretendard text-body text-text-subdued">전체 활용도</Text>
        </View>
      </View>
    </View>
  );
}

type WeeklyReviewUsageProfileCardProps = {
  className?: string;
  profile: ClosetUsageProfile;
  unwornClothesCount: number | null;
};

export function WeeklyReviewUsageProfileCard({
  className,
  profile,
  unwornClothesCount,
}: WeeklyReviewUsageProfileCardProps) {
  const usageColor = usageColorByToken[profile.colorToken];
  const unwornClothesCountLabel = unwornClothesCount === null ? "-" : String(unwornClothesCount);
  const classNames = [
    "h-[107px] justify-center rounded-xl border border-cool bg-white px-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={weeklyReviewRoutes.receipt} asChild>
      <Pressable
        accessibilityLabel={`${profile.title} 상세 리포트 보기`}
        className={classNames}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View className="flex-row items-center">
          <View
            className="h-[13px] w-[13px] rounded-[2px]"
            style={{ backgroundColor: usageColor.accent }}
          />

          <View className="ml-[34px] flex-1">
            <View className="flex-row items-center">
              <Text className="shrink font-pretendard text-heading text-black" numberOfLines={1}>
                {profile.title}
              </Text>
              <Text
                className="ml-[18px] shrink font-pretendard text-body text-text-subdued"
                numberOfLines={1}
              >
                {profile.range.min}-{profile.range.max}% 활용
              </Text>
            </View>
            <Text className="mt-[10px] font-pretendard text-body text-text" numberOfLines={1}>
              입지 않는 옷이 {unwornClothesCountLabel}벌 있어요!
            </Text>
          </View>

          <Svg fill="none" height={32} viewBox="0 0 24 24" width={32}>
            <Path
              d="M9.70498 6L8.29498 7.41L12.875 12L8.29498 16.59L9.70498 18L15.705 12L9.70498 6Z"
              fill="#000000"
            />
          </Svg>
        </View>
      </Pressable>
    </Link>
  );
}
