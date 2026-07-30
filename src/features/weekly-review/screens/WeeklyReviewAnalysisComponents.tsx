import type { Ref } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import InfoTooltipIcon from "../../../../assets/info-tooltip.svg";
import { colors } from "@/constants/colors";
import { weeklyReviewRoutes } from "@/features/weekly-review/routes";
import type { ClosetUsageProfile } from "@/features/weekly-review/types/weekly-review";
import { CLOSET_USAGE_PROFILES } from "@/features/weekly-review/utils/closet-usage";

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

type WeeklyReviewUsageDistributionSectionProps = {
  infoButtonRef?: Ref<View>;
  isGuideVisible: boolean;
  onGuidePress: () => void;
  profile: ClosetUsageProfile;
  unwornClothesCount: number | null;
};

const usageProfilesInOrder = [
  CLOSET_USAGE_PROFILES.neglected,
  CLOSET_USAGE_PROFILES.potential,
  CLOSET_USAGE_PROFILES.active,
  CLOSET_USAGE_PROFILES.master,
] satisfies ClosetUsageProfile[];

export function WeeklyReviewUsageDistributionSection({
  infoButtonRef,
  isGuideVisible,
  onGuidePress,
  profile,
  unwornClothesCount,
}: WeeklyReviewUsageDistributionSectionProps) {
  return (
    <View className="mt-[33px]">
      <View className="flex-row items-center">
        <Text
          className="font-pretendard-semibold text-headline text-bg-dark"
          style={{ lineHeight: 24 }}
        >
          활용도 분포
        </Text>

        <View className="ml-[5px] h-6 w-6" collapsable={false} ref={infoButtonRef}>
          <WeeklyReviewUsageInfoButton isGuideVisible={isGuideVisible} onPress={onGuidePress} />
        </View>
      </View>

      <WeeklyReviewUsageProfileCard
        className="mt-[15px]"
        profile={profile}
        unwornClothesCount={unwornClothesCount}
      />

      <WeeklyReviewUsageProfileLegendCard className="mt-[34px]" profile={profile} />
    </View>
  );
}

type WeeklyReviewUsageProfileLegendCardProps = {
  className?: string;
  profile: ClosetUsageProfile;
};

function WeeklyReviewUsageProfileLegendCard({
  className,
  profile,
}: WeeklyReviewUsageProfileLegendCardProps) {
  const classNames = ["h-[201px] rounded-xl border border-cool bg-white px-8 py-8", className]
    .filter(Boolean)
    .join(" ");

  return (
    <View className={classNames}>
      {usageProfilesInOrder.map((usageProfile, index) => {
        const isSelected = usageProfile.type === profile.type;
        const titleClassName = isSelected
          ? "font-pretendard-semibold text-heading text-text"
          : "font-pretendard text-heading text-text-subdued";
        const rangeClassName = isSelected
          ? "font-pretendard text-heading text-text"
          : "font-pretendard text-body text-text-subdued";

        return (
          <View
            className="flex-row items-center"
            key={usageProfile.type}
            style={index === 0 ? undefined : { marginTop: 20 }}
          >
            <View className="w-[97px]">
              <Text className={titleClassName}>{usageProfile.title}</Text>
            </View>

            <Text className={rangeClassName}>
              {usageProfile.range.min}-{usageProfile.range.max}% 활용
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type WeeklyReviewUsageInfoButtonProps = {
  isGuideVisible: boolean;
  onPress: () => void;
};

function WeeklyReviewUsageInfoButton({
  isGuideVisible,
  onPress,
}: WeeklyReviewUsageInfoButtonProps) {
  return (
    <Pressable
      accessibilityLabel={isGuideVisible ? "활용도 분포 안내 닫기" : "활용도 분포 안내 보기"}
      accessibilityRole="button"
      className="h-6 w-6 items-center justify-center"
      onPress={onPress}
      hitSlop={12}
    >
      <InfoTooltipIcon height={24} width={24} />
    </Pressable>
  );
}

type WeeklyReviewUsageGuideTooltipProps = {
  pointerLeft: number;
  top: number;
};

export function WeeklyReviewUsageGuideTooltip({
  pointerLeft,
  top,
}: WeeklyReviewUsageGuideTooltipProps) {
  return (
    <View className="absolute left-6 right-6 z-30 h-[101px]" style={{ top }}>
      <View className="h-[85px] items-center justify-center rounded-xl bg-white px-[30px]">
        <Text className="w-[278px] text-center font-pretendard text-body text-black">
          주간 회고에서 선택한 이번주 입은 옷을 기준으로{"\n"}이번주 옷장 활용도가 결정돼요!
        </Text>
      </View>

      <View style={{ marginLeft: pointerLeft, marginTop: -1 }}>
        <Svg height={16} viewBox="0 0 22 16" width={22}>
          <Path d="M11 16L0 0H22L11 16Z" fill={colors.white} />
        </Svg>
      </View>
    </View>
  );
}
