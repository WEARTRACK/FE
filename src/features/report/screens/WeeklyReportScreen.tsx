import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import ArrowLeftIcon from "../../../../assets/arrow_left.svg";
import ArrowRightIcon from "../../../../assets/arrow_right.svg";
import WeartrackLogo from "../../../../assets/WEARTRACK-logo.svg";
import type {
  MonthlyExpense,
  MonthlyFashionReport,
  MonthlyTopCategory,
} from "@/features/report/api/monthlyFashionReportApi";
import { useMonthlyFashionReport } from "@/features/report/hooks/useMonthlyFashionReport";
import { useWeeklyFashionReport } from "@/features/report/hooks/useWeeklyFashionReport";
import {
  formatCategoryLabel,
  groupCategoriesByExpense,
  sortCategoriesByExpense,
  type GroupedExpenseCategory,
} from "@/features/report/utils/reportCategory";
import {
  getCurrentYearMonth,
  getMonthDistance,
  shiftYearMonth,
} from "@/features/report/utils/monthlyReportDate";
import { getCurrentWeekStartDate, shiftDate } from "@/features/report/utils/weeklyReportDate";

const MAX_WEEK_INDEX = 3;
const MAX_MONTH_INDEX = 3;

function formatExpenseComparison(changeRate: number | null) {
  if (changeRate === null) {
    return "1주 전 대비 -";
  }

  return `1주 전 대비 ${changeRate > 0 ? "+" : ""}${changeRate}%`;
}

function formatMonthlyExpenseComparison(changeRate: number | null) {
  if (changeRate === null) {
    return "1달 전 대비 -";
  }

  return `1달 전 대비 ${changeRate > 0 ? "+" : ""}${changeRate}%`;
}

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
  expense,
  monthlyExpenses,
  selected,
  onPress,
}: {
  expense: MonthlyExpense;
  monthlyExpenses: MonthlyExpense[];
  selected: boolean;
  onPress: () => void;
}) {
  const maxAmount = Math.max(...monthlyExpenses.map((item) => item.expenseAmount), 0);
  const height =
    maxAmount > 0 ? Math.max(30, Math.round((expense.expenseAmount / maxAmount) * 88)) : 30;
  const gradientId = `monthly-bar-${expense.yearMonth}`;
  const spendingRank = [...monthlyExpenses]
    .sort((first, second) => second.expenseAmount - first.expenseAmount)
    .findIndex((item) => item.yearMonth === expense.yearMonth);
  const gradient =
    monthlyBarGradients[spendingRank] ?? monthlyBarGradients[monthlyBarGradients.length - 1];

  return (
    <Pressable
      accessibilityLabel={`${formatMonthlyLabel(expense.yearMonth)} 리포트 보기`}
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
        {formatMonthlyLabel(expense.yearMonth)}
      </Text>
    </Pressable>
  );
}

function MonthlyBarChart({
  monthlyExpenses,
  selectedYearMonth,
  onSelectMonth,
}: {
  monthlyExpenses: MonthlyExpense[];
  selectedYearMonth: string;
  onSelectMonth: (yearMonth: string) => void;
}) {
  return (
    <View className="mx-6 mt-[22px] flex-row items-end gap-[7px] px-[20px]">
      {monthlyExpenses.map((expense) => (
        <MonthlyBar
          key={expense.yearMonth}
          expense={expense}
          monthlyExpenses={monthlyExpenses}
          selected={expense.yearMonth === selectedYearMonth}
          onPress={() => onSelectMonth(expense.yearMonth)}
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
        {formatCategoryLabel(category.category)}
      </Text>
    </View>
  );
}

function MonthlyReportContent({
  report,
  showComparison,
  onSelectMonth,
}: {
  report: MonthlyFashionReport;
  showComparison: boolean;
  onSelectMonth: (yearMonth: string) => void;
}) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <ReceiptCard
        report={{
          total: report.totalExpenseAmount,
          comparison: showComparison
            ? formatMonthlyExpenseComparison(report.expenseChangeRate)
            : undefined,
        }}
        receiptLabel={formatMonthlyReceiptLabel(report.yearMonth)}
      />
      <MonthlyBarChart
        monthlyExpenses={report.monthlyExpenses}
        selectedYearMonth={report.yearMonth}
        onSelectMonth={onSelectMonth}
      />

      <Text className="mb-[12px] mt-[24px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
        TOP3 카테고리
      </Text>
      <View className="mx-6 flex-row gap-[15px]">
        {report.topCategories.map((category) => (
          <TopCategoryCard key={category.category} category={category} />
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
  item: GroupedExpenseCategory;
  total: number;
  onPress: () => void;
}) {
  const progress = total > 0 ? item.expenseAmount / total : 0;

  return (
    <Pressable
      accessibilityRole="button"
      className="mx-6 mb-2 rounded-[4px] border-[0.5px] border-cool bg-white px-6 pb-[13px] pt-[13px]"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-pretendard text-[14px] leading-[18px] text-text">
          {formatCategoryLabel(item.category)}
        </Text>
        <Text className="font-pretendard text-[14px] leading-[18px] text-text">
          {formatWon(item.expenseAmount)}
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
  const isWeekly = period === "weekly";
  const [weekIndex, setWeekIndex] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [currentWeekStartDate] = useState(getCurrentWeekStartDate);
  const [currentYearMonth] = useState(getCurrentYearMonth);
  const selectedWeekStartDate = shiftDate(currentWeekStartDate, -weekIndex * 7);
  const selectedWeekEndDate = shiftDate(selectedWeekStartDate, 6);
  const selectedYearMonth = shiftYearMonth(currentYearMonth, -monthIndex);
  const weeklyReportQuery = useWeeklyFashionReport(selectedWeekStartDate);
  const monthlyReportQuery = useMonthlyFashionReport({
    yearMonth: selectedYearMonth,
    isCurrentMonth: monthIndex === 0,
    enabled: !isWeekly,
  });
  const report = weeklyReportQuery.data;
  const monthlyReport = monthlyReportQuery.data;

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
          disabled={isWeekly ? weekIndex === MAX_WEEK_INDEX : monthIndex === MAX_MONTH_INDEX}
          unit={isWeekly ? "주" : "달"}
          onPress={() => {
            if (isWeekly) {
              setWeekIndex((current) => Math.min(current + 1, MAX_WEEK_INDEX));
            } else {
              setMonthIndex((current) => Math.min(current + 1, MAX_MONTH_INDEX));
            }
          }}
        />
        <Text className="min-w-[58px] text-center font-pretendard text-[16px] leading-[20px] text-text">
          {isWeekly
            ? formatWeeklyRange(
                report?.weekStartDate ?? selectedWeekStartDate,
                report?.weekEndDate ?? selectedWeekEndDate,
              )
            : formatMonthlyTitle(monthlyReport?.yearMonth ?? selectedYearMonth)}
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
        weeklyReportQuery.isPending ? (
          <View className="flex-1 items-center justify-center pb-[80px]">
            <ActivityIndicator color="#272C35" />
          </View>
        ) : weeklyReportQuery.isError || !report ? (
          <View className="flex-1 items-center justify-center px-6 pb-[80px]">
            <Text className="font-pretendard text-[15px] text-text-subdued">
              주간 리포트를 불러오지 못했어요.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-[6px] bg-bg-dark px-5 py-3"
              onPress={() => weeklyReportQuery.refetch()}
            >
              <Text className="font-pretendard text-[14px] text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <ReceiptCard
              report={{
                total: report.totalExpenseAmount,
                comparison:
                  weekIndex === 0 ? formatExpenseComparison(report.expenseChangeRate) : undefined,
              }}
              receiptLabel={formatWeeklyReceiptLabel(report.weekStartDate, report.weekEndDate)}
            />

            <Text className="mb-[11px] mt-[16px] px-6 font-pretendard-bold text-[14px] leading-[18px] text-bg-dark">
              카테고리 별 지출
            </Text>

            {sortCategoriesByExpense(groupCategoriesByExpense(report.categories)).map((item) => (
              <CategorySpendingCard
                key={item.category}
                item={item}
                total={report.totalExpenseAmount}
                onPress={() =>
                  router.push({
                    pathname: "/report/purchase-history",
                    params: {
                      category: item.category,
                      sourceCategories: item.sourceCategories.join(","),
                      weekStartDate: report.weekStartDate,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        )
      ) : monthlyReportQuery.isPending ? (
        <View className="flex-1 items-center justify-center pb-[80px]">
          <ActivityIndicator color="#272C35" />
        </View>
      ) : monthlyReportQuery.isError || !monthlyReport ? (
        <View className="flex-1 items-center justify-center px-6 pb-[80px]">
          <Text className="font-pretendard text-[15px] text-text-subdued">
            월간 리포트를 불러오지 못했어요.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-4 rounded-[6px] bg-bg-dark px-5 py-3"
            onPress={() => monthlyReportQuery.refetch()}
          >
            <Text className="font-pretendard text-[14px] text-white">다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <MonthlyReportContent
          report={monthlyReport}
          showComparison={monthIndex === 0}
          onSelectMonth={(yearMonth) => {
            const selectedIndex = getMonthDistance(currentYearMonth, yearMonth);

            if (selectedIndex >= 0 && selectedIndex <= MAX_MONTH_INDEX) {
              setMonthIndex(selectedIndex);
            }
          }}
        />
      )}
    </View>
  );
}
