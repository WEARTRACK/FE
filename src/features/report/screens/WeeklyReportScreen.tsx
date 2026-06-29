import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import ArrowLeftIcon from "../../../../assets/arrow_left.svg";
import ArrowRightIcon from "../../../../assets/arrow_right.svg";
import WeartrackLogo from "../../../../assets/WEARTRACK-logo.svg";
import type {
  MonthlyReport,
  MonthlyTopCategory,
  ReportCategory,
} from "@/features/report/reportMockData";
import { monthlyReports, weeklyReports } from "@/features/report/reportMockData";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getMonthNumber(date: string) {
  const month = Number(date.split("-")[1]);

  return Number.isFinite(month) && month >= 1 && month <= 12 ? month : null;
}

function formatWeeklyRange(startDate: string, endDate: string) {
  return `${startDate.slice(5).replace("-", "/")} ~ ${endDate.slice(5).replace("-", "/")}`;
}

function formatWeeklyReceiptLabel(startDate: string, endDate: string) {
  return `${startDate.slice(5).replace("-", "/")} ~ ${endDate.slice(5).replace("-", "/")} 지출`;
}

function formatMonthlyTitle(date: string) {
  const [year] = date.split("-");
  const month = getMonthNumber(date);

  return month ? `${year}년 ${month}월` : date;
}

function formatMonthlyLabel(date: string) {
  const month = getMonthNumber(date);

  return month ? `${month}월` : date;
}

function formatMonthlyReceiptLabel(date: string) {
  const month = getMonthNumber(date);

  return month ? `${month}월 달 지출` : `${date} 지출`;
}

function DottedDivider() {
  return (
    <Svg width="100%" height={2}>
      <Line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="#FFFFFF"
        strokeDasharray="1 3"
        strokeLinecap="round"
        strokeOpacity={0.9}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function PeriodArrow({
  direction,
  disabled,
  onPress,
  unit,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onPress: () => void;
  unit: "주" | "달";
}) {
  const ArrowIcon = direction === "left" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <Pressable
      accessibilityLabel={direction === "left" ? `이전 ${unit} 보기` : `다음 ${unit} 보기`}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <ArrowIcon width={24} height={24} opacity={disabled ? 0.28 : 1} />
    </Pressable>
  );
}

function ReceiptCard({
  report,
  receiptLabel,
}: {
  report: { total: number; comparison?: string };
  receiptLabel: string;
}) {
  return (
    <View className="mx-6 rounded-[4px] bg-bg-dark px-[36px] pb-[23px] pt-[27px]">
      <View className="items-center">
        <WeartrackLogo width={138} height={18} />
      </View>
      <Text className="mt-[10px] text-center font-pretendard text-[14px] leading-[16px] text-blue-1">
        RECEIPT
      </Text>

      <View className="mt-[20px]">
        <DottedDivider />
      </View>

      <View className="min-h-[56px] flex-row items-center justify-between py-[16px]">
        <Text className="font-pretendard text-[15px] leading-[18px] text-white">
          {receiptLabel}
        </Text>
        {report.comparison ? (
          <Text
            className={`font-pretendard text-[14px] leading-[18px] ${
              report.comparison.includes("+") ? "text-red-3" : "text-green-3"
            }`}
          >
            {report.comparison}
          </Text>
        ) : null}
      </View>

      <DottedDivider />

      <Text className="mt-[16px] text-center font-pretendard text-[14px] leading-[16px] text-primary">
        Total price
      </Text>
      <Text className="mt-[8px] text-center font-pretendard-semibold text-[24px] leading-[28px] text-primary">
        {formatWon(report.total)}
      </Text>
    </View>
  );
}

const monthlyBarGradients = [
  { start: "#417AFF", startOpacity: 0.95, end: "#B1C9FF", endOpacity: 0.75 },
  { start: "#7EA5FF", startOpacity: 0.9, end: "#CDDDFF", endOpacity: 0.72 },
  { start: "#B1C9FF", startOpacity: 0.82, end: "#EDF2FF", endOpacity: 0.65 },
  { start: "#CDDDFF", startOpacity: 0.65, end: "#FBFCFF", endOpacity: 0.55 },
] as const;

function MonthlyBar({
  report,
  selected,
  onPress,
}: {
  report: MonthlyReport;
  selected: boolean;
  onPress: () => void;
}) {
  const maxAmount = Math.max(...monthlyReports.map((item) => item.total));
  const height = Math.max(30, Math.round((report.total / maxAmount) * 88));
  const gradientId = `monthly-bar-${report.id}`;
  const spendingRank = [...monthlyReports]
    .sort((first, second) => second.total - first.total)
    .findIndex((item) => item.id === report.id);
  const gradient =
    monthlyBarGradients[spendingRank] ?? monthlyBarGradients[monthlyBarGradients.length - 1];

  return (
    <Pressable
      accessibilityLabel={`${formatMonthlyLabel(report.monthDate)} 리포트 보기`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="h-[122px] flex-1 items-center justify-end"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Svg width={62} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={gradient.start} stopOpacity={gradient.startOpacity} />
            <Stop offset="1" stopColor={gradient.end} stopOpacity={gradient.endOpacity} />
          </LinearGradient>
        </Defs>
        <Path
          d={`M 8 0 H 52 Q 62 0 62 8 V ${height} H 0 V 8 Q 0 0 8 0 Z`}
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <Text
        className={`mt-[5px] text-[12px] leading-[18px] text-text ${
          selected ? "font-pretendard-semibold" : "font-pretendard-light"
        }`}
      >
        {formatMonthlyLabel(report.monthDate)}
      </Text>
    </Pressable>
  );
}

function MonthlyBarChart({
  selectedReportId,
  onSelectReport,
}: {
  selectedReportId: string;
  onSelectReport: (reportId: string) => void;
}) {
  return (
    <View className="mx-6 mt-[22px] flex-row items-end gap-[7px] px-[20px]">
      {[...monthlyReports].reverse().map((report) => (
        <MonthlyBar
          key={report.id}
          report={report}
          selected={report.id === selectedReportId}
          onPress={() => onSelectReport(report.id)}
        />
      ))}
    </View>
  );
}

function TopCategoryCard({ category }: { category: MonthlyTopCategory }) {
  return (
    <View className="h-[86px] flex-1 justify-center rounded-[4px] border-[0.5px] border-blue-2 bg-blue-1 px-[21px]">
      <Text className="font-pretendard-light text-[13px] leading-[18px] text-text-subdued">
        {category.percentage}%
      </Text>
      <Text className="mt-[9px] font-pretendard-semibold text-[20px] leading-[24px] text-accent">
        {category.label}
      </Text>
    </View>
  );
}

function MonthlyReportContent({
  report,
  onSelectReport,
}: {
  report: MonthlyReport;
  onSelectReport: (reportId: string) => void;
}) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <ReceiptCard report={report} receiptLabel={formatMonthlyReceiptLabel(report.monthDate)} />
      <MonthlyBarChart selectedReportId={report.id} onSelectReport={onSelectReport} />

      <Text className="mb-[12px] mt-[24px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
        TOP3 카테고리
      </Text>
      <View className="mx-6 flex-row gap-[15px]">
        {report.topCategories.map((category) => (
          <TopCategoryCard key={category.label} category={category} />
        ))}
      </View>
    </ScrollView>
  );
}

function CategorySpendingCard({
  item,
  total,
  onPress,
}: {
  item: ReportCategory;
  total: number;
  onPress: () => void;
}) {
  const progress = total > 0 ? item.amount / total : 0;

  return (
    <Pressable
      accessibilityRole="button"
      className="mx-6 mb-2 rounded-[4px] border-[0.5px] border-cool bg-white px-6 pb-[13px] pt-[13px]"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-pretendard text-[14px] leading-[18px] text-text">{item.label}</Text>
        <Text className="font-pretendard text-[14px] leading-[18px] text-text">
          {formatWon(item.amount)}
        </Text>
      </View>
      <View className="mt-[9px] h-[7px] overflow-hidden rounded-full bg-blue-1">
        <View
          className="h-full rounded-full bg-blue-4"
          style={{ width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }}
        />
      </View>
    </Pressable>
  );
}

export function WeeklyReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const report = weeklyReports[weekIndex];
  const monthlyReport = monthlyReports[monthIndex];
  const isWeekly = period === "weekly";

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top }}>
      <View className="h-[72px] items-center justify-center">
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          패션 소비 리포트
        </Text>
      </View>

      <View className="h-[49px] flex-row items-start gap-[36px] px-6">
        <Pressable
          accessibilityRole="tab"
          className={isWeekly ? "border-b border-text pb-[5px]" : "pb-[5px]"}
          onPress={() => setPeriod("weekly")}
        >
          <Text
            className={`font-pretendard text-[16px] leading-[20px] ${
              isWeekly ? "text-text" : "text-disabled"
            }`}
          >
            주간
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          className={!isWeekly ? "border-b border-text pb-[5px]" : "pb-[5px]"}
          onPress={() => setPeriod("monthly")}
        >
          <Text
            className={`font-pretendard text-[16px] leading-[20px] ${
              !isWeekly ? "text-text" : "text-disabled"
            }`}
          >
            월간
          </Text>
        </Pressable>
      </View>

      <View className="mb-[17px] h-[34px] flex-row items-center justify-center gap-[35px]">
        <PeriodArrow
          direction="left"
          disabled={
            isWeekly
              ? weekIndex === weeklyReports.length - 1
              : monthIndex === monthlyReports.length - 1
          }
          unit={isWeekly ? "주" : "달"}
          onPress={() => {
            if (isWeekly) {
              setWeekIndex((current) => Math.min(current + 1, weeklyReports.length - 1));
            } else {
              setMonthIndex((current) => Math.min(current + 1, monthlyReports.length - 1));
            }
          }}
        />
        <Text className="min-w-[58px] text-center font-pretendard text-[16px] leading-[20px] text-text">
          {isWeekly
            ? formatWeeklyRange(report.startDate, report.endDate)
            : formatMonthlyTitle(monthlyReport.monthDate)}
        </Text>
        <PeriodArrow
          direction="right"
          disabled={isWeekly ? weekIndex === 0 : monthIndex === 0}
          unit={isWeekly ? "주" : "달"}
          onPress={() => {
            if (isWeekly) {
              setWeekIndex((current) => Math.max(current - 1, 0));
            } else {
              setMonthIndex((current) => Math.max(current - 1, 0));
            }
          }}
        />
      </View>

      {isWeekly ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <ReceiptCard
            report={report}
            receiptLabel={formatWeeklyReceiptLabel(report.startDate, report.endDate)}
          />

          <Text className="mb-[11px] mt-[16px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
            카테고리 별 지출
          </Text>

          {report.categories.map((item) => (
            <CategorySpendingCard
              key={item.label}
              item={item}
              total={report.total}
              onPress={() =>
                router.push({
                  pathname: "/report/purchase-history",
                  params: { category: item.label, reportId: report.id },
                })
              }
            />
          ))}
        </ScrollView>
      ) : (
        <MonthlyReportContent
          report={monthlyReport}
          onSelectReport={(reportId) => {
            const selectedIndex = monthlyReports.findIndex((item) => item.id === reportId);

            if (selectedIndex >= 0) {
              setMonthIndex(selectedIndex);
            }
          }}
        />
      )}
    </View>
  );
}
